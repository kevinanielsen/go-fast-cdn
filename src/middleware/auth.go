package middleware

import (
	"errors"
	"log"
	"net/http"
	"slices"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/kevinanielsen/go-fast-cdn/src/auth"
	"github.com/kevinanielsen/go-fast-cdn/src/database"
	"github.com/kevinanielsen/go-fast-cdn/src/models"
	"gorm.io/gorm"
)

type AuthMiddleware struct {
	jwtService *auth.JWTService
	userRepo   models.UserRepository
}

func NewAuthMiddleware() *AuthMiddleware {
	return &AuthMiddleware{
		jwtService: auth.NewJWTService(),
		userRepo:   database.NewUserRepo(database.DB),
	}
}

// RequireAuth middleware that validates JWT tokens
func (a *AuthMiddleware) RequireAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			c.Abort()
			return
		}

		// Extract token from "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization header format"})
			c.Abort()
			return
		}

		token := parts[1]
		claims, err := a.jwtService.ValidateToken(token)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		// Get user from database to ensure they still exist and are active
		user, err := a.userRepo.GetUserByID(claims.UserID)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
			c.Abort()
			return
		}

		setUserContext(c, user)

		c.Next()
	}
}

// RequireCDNAuth accepts a scoped API token or the existing browser access JWT.
func (a *AuthMiddleware) RequireCDNAuth(repo *database.APITokenRepo, scope models.APITokenScope) gin.HandlerFunc {
	requireJWT := a.RequireAuth()
	return func(c *gin.Context) {
		scheme, raw, hasScheme := strings.Cut(c.GetHeader("Authorization"), " ")
		digest, valid := auth.APITokenDigest(raw)
		if !hasScheme || !strings.EqualFold(scheme, "Bearer") || !valid {
			requireJWT(c)
			return
		}

		ctx := c.Request.Context()
		token, err := repo.FindActive(ctx, digest)
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			return
		}
		if err != nil {
			apiTokenAuthUnavailable(c)
			return
		}
		if !slices.Contains(token.Scopes, scope) {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Insufficient API token scope"})
			return
		}
		if err := repo.RecordUse(ctx, token); err != nil {
			apiTokenAuthUnavailable(c)
			return
		}

		c.Set("user_id", token.UserID)
		c.Next()
	}
}

func apiTokenAuthUnavailable(c *gin.Context) {
	log.Print("API token authentication storage operation failed")
	c.AbortWithStatusJSON(http.StatusServiceUnavailable, gin.H{"error": "Token authentication unavailable"})
}

func setUserContext(c *gin.Context, user *models.User) {
	c.Set("user_id", user.ID)
	c.Set("user_email", user.Email)
	c.Set("user_role", user.Role)
	c.Set("user", user)
}

// RequireRole middleware that checks if user has required role
func (a *AuthMiddleware) RequireRole(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, exists := c.Get("user_role")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User role not found in context"})
			c.Abort()
			return
		}

		role := userRole.(string)
		for _, requiredRole := range roles {
			if role == requiredRole {
				c.Next()
				return
			}
		}

		c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
		c.Abort()
	}
}

// RequireAdmin middleware that checks if user is admin
func (a *AuthMiddleware) RequireAdmin() gin.HandlerFunc {
	return a.RequireRole("admin")
}

// OptionalAuth middleware that tries to authenticate but doesn't require it
func (a *AuthMiddleware) OptionalAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.Next()
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.Next()
			return
		}

		token := parts[1]
		claims, err := a.jwtService.ValidateToken(token)
		if err != nil {
			c.Next()
			return
		}

		user, err := a.userRepo.GetUserByID(claims.UserID)
		if err != nil {
			c.Next()
			return
		}

		setUserContext(c, user)

		c.Next()
	}
}
