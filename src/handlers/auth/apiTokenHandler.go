package auth

import (
	"errors"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"
	"unicode"
	"unicode/utf8"

	"github.com/gin-gonic/gin"
	"github.com/kevinanielsen/go-fast-cdn/src/auth"
	"github.com/kevinanielsen/go-fast-cdn/src/database"
	"github.com/kevinanielsen/go-fast-cdn/src/models"
	"gorm.io/gorm"
)

type APITokenHandler struct {
	repo *database.APITokenRepo
}

func NewAPITokenHandler(repo *database.APITokenRepo) *APITokenHandler {
	return &APITokenHandler{repo: repo}
}

func (h *APITokenHandler) List(c *gin.Context) {
	c.Header("Cache-Control", "no-store")
	tokens, err := h.repo.List(c.Request.Context(), c.GetUint("user_id"))
	if err != nil {
		apiTokenStorageError(c, "list")
		return
	}
	c.JSON(http.StatusOK, tokens)
}

func (h *APITokenHandler) Create(c *gin.Context) {
	c.Header("Cache-Control", "no-store")
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, 4096)
	var req struct {
		Name            string                 `json:"name"`
		Scopes          []models.APITokenScope `json:"scopes"`
		ExpiresInDays   int                    `json:"expires_in_days"`
		CurrentPassword string                 `json:"current_password"`
		TwoFAToken      string                 `json:"two_fa_token"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid token creation request"})
		return
	}
	req.Name = strings.TrimSpace(req.Name)
	if req.Name == "" || utf8.RuneCountInString(req.Name) > 64 || strings.ContainsFunc(req.Name, unicode.IsControl) ||
		(req.ExpiresInDays != 7 && req.ExpiresInDays != 30 && req.ExpiresInDays != 90) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Provide a name (1-64 characters) and an expiration of 7, 30, or 90 days"})
		return
	}
	if len(req.Scopes) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Choose at least one valid permission"})
		return
	}
	seen := make(map[models.APITokenScope]bool, len(req.Scopes))
	for _, scope := range req.Scopes {
		if !scope.Valid() || seen[scope] {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Permissions must be valid and unique"})
			return
		}
		seen[scope] = true
	}

	user := c.MustGet("user").(*models.User)
	if !user.CheckPassword(req.CurrentPassword) ||
		(user.Is2FAEnabled != nil && *user.Is2FAEnabled &&
			(user.TwoFASecret == nil || *user.TwoFASecret == "" || !auth.ValidateTOTP(*user.TwoFASecret, req.TwoFAToken))) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Current password or verification code is incorrect"})
		return
	}

	secret := auth.GenerateAPIToken()
	digest, _ := auth.APITokenDigest(secret)
	now := time.Now().UTC()
	token := models.APIToken{
		Digest: digest, Name: req.Name, Scopes: req.Scopes,
		CreatedAt: now, ExpiresAt: now.AddDate(0, 0, req.ExpiresInDays),
	}
	switch err := h.repo.Create(c.Request.Context(), user, &token); {
	case errors.Is(err, database.ErrAPITokenLimit):
		c.JSON(http.StatusConflict, gin.H{"error": "You can have at most 10 active API tokens. Revoke one before creating another."})
	case errors.Is(err, database.ErrCredentialsChanged), errors.Is(err, gorm.ErrRecordNotFound):
		c.JSON(http.StatusConflict, gin.H{"error": "Your account changed. Reload your profile and try again."})
	case err != nil:
		apiTokenStorageError(c, "create")
	default:
		c.JSON(http.StatusCreated, gin.H{"token": secret, "metadata": token})
	}
}

func (h *APITokenHandler) Revoke(c *gin.Context) {
	c.Header("Cache-Control", "no-store")
	id, err := strconv.ParseUint(c.Param("id"), 10, strconv.IntSize)
	if err != nil || id == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid token ID"})
		return
	}
	switch err := h.repo.Revoke(c.Request.Context(), c.GetUint("user_id"), uint(id)); {
	case errors.Is(err, gorm.ErrRecordNotFound):
		c.JSON(http.StatusNotFound, gin.H{"error": "Token not found"})
	case err != nil:
		apiTokenStorageError(c, "revoke")
	default:
		c.Status(http.StatusNoContent)
	}
}

func apiTokenStorageError(c *gin.Context, operation string) {
	log.Printf("API token storage operation failed: %s", operation)
	c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not " + operation + " API tokens"})
}
