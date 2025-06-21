package auth

import (
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/kevinanielsen/go-fast-cdn/src/auth"
	"github.com/kevinanielsen/go-fast-cdn/src/models"
)

type AuthHandler struct {
	userRepo   models.UserRepository
	jwtService *auth.JWTService
	validator  *validator.Validate
}

type RegisterRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8"`
	Role     string `json:"role,omitempty" validate:"omitempty,oneof=admin user"`
}

type LoginRequest struct {
	Email      string `json:"email" validate:"required,email"`
	Password   string `json:"password" validate:"required"`
	TwoFAToken string `json:"two_fa_token,omitempty"`
}

type RefreshRequest struct {
	RefreshToken string `json:"refresh_token" validate:"required"`
}

type ChangePasswordRequest struct {
	CurrentPassword string `json:"current_password" validate:"required"`
	NewPassword     string `json:"new_password" validate:"required,min=8"`
}

type ChangeEmailRequest struct {
	NewEmail string `json:"new_email" validate:"required,email"`
}

type TwoFASetupRequest struct {
	Enable bool   `json:"enable"`
	Token  string `json:"token"`
}

type AuthResponse struct {
	User         *UserResponse `json:"user"`
	AccessToken  string        `json:"access_token"`
	RefreshToken string        `json:"refresh_token"`
	ExpiresIn    int64         `json:"expires_in"`
}

type UserResponse struct {
	ID           uint       `json:"id"`
	Email        string     `json:"email"`
	Role         string     `json:"role"`
	IsVerified   bool       `json:"is_verified"`
	CreatedAt    time.Time  `json:"created_at"`
	LastLogin    *time.Time `json:"last_login"`
	Is2FAEnabled bool       `json:"is_2fa_enabled"`
}

func NewAuthHandler(userRepo models.UserRepository) *AuthHandler {
	return &AuthHandler{
		userRepo:   userRepo,
		jwtService: auth.NewJWTService(),
		validator:  validator.New(),
	}
}

// Register creates a new user account
func (h *AuthHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	if err := h.validator.Struct(req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Validation failed", "details": err.Error()})
		return
	}

	// Check if user already exists
	existingUser, _ := h.userRepo.GetUserByEmail(req.Email)
	if existingUser != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "User with this email already exists"})
		return
	}

	// Create new user
	user := &models.User{
		Email: req.Email,
		Role:  req.Role,
	}

	if user.Role == "" {
		user.Role = "user"
	}

	// Hash password
	if err := user.HashPassword(req.Password); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process password"})
		return
	}

	// Save user to database
	if err := h.userRepo.CreateUser(user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	// Generate tokens
	tokenPair, err := h.jwtService.GenerateTokenPair(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate tokens"})
		return
	}

	// Create session
	session := &models.UserSession{
		UserID:       user.ID,
		RefreshToken: tokenPair.RefreshToken,
		ExpiresAt:    h.jwtService.RefreshTokenExpiration(),
	}

	if err := h.userRepo.CreateSession(session); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create session"})
		return
	}

	response := &AuthResponse{
		User:         h.userToResponse(user),
		AccessToken:  tokenPair.AccessToken,
		RefreshToken: tokenPair.RefreshToken,
		ExpiresIn:    tokenPair.ExpiresIn,
	}

	c.JSON(http.StatusCreated, response)
}

// Login authenticates a user and returns tokens
func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	if err := h.validator.Struct(req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Validation failed", "details": err.Error()})
		return
	}

	// Get user by email
	user, err := h.userRepo.GetUserByEmail(req.Email)
	if err != nil {
		log.Printf("[DEBUG] Login - User not found for email: %s", req.Email)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}
	log.Printf("[DEBUG] Login - User found - UserID: %d, Email: %s, Is2FAEnabled: %t, HasSecret: %t",
		user.ID,
		user.Email,
		func() bool {
			if user.Is2FAEnabled == nil {
				return false
			}
			return *user.Is2FAEnabled
		}(),
		func() bool {
			return user.TwoFASecret != nil && *user.TwoFASecret != ""
		}())

	// Check password
	if !user.CheckPassword(req.Password) {
		log.Printf("[DEBUG] Login - Invalid password for user: %d", user.ID)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	log.Printf("[DEBUG] Login - Password validated for user: %d", user.ID)
	// Check 2FA if enabled
	is2FAEnabled := user.Is2FAEnabled != nil && *user.Is2FAEnabled
	if is2FAEnabled {
		log.Printf("[DEBUG] Login - 2FA is enabled for user: %d, Token provided: %t",
			user.ID, req.TwoFAToken != "")

		if req.TwoFAToken == "" {
			log.Printf("[DEBUG] Login - 2FA token required but not provided for user: %d", user.ID)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "2FA token required", "requires_2fa": true})
			return
		}

		log.Printf("[DEBUG] Login - Validating TOTP token for user: %d", user.ID)
		twoFASecret := ""
		if user.TwoFASecret != nil {
			twoFASecret = *user.TwoFASecret
		}
		if !auth.ValidateTOTP(twoFASecret, req.TwoFAToken) {
			log.Printf("[DEBUG] Login - Invalid 2FA token for user: %d", user.ID)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid 2FA token"})
			return
		}
		log.Printf("[DEBUG] Login - 2FA token validated successfully for user: %d", user.ID)
	} else {
		log.Printf("[DEBUG] Login - 2FA is disabled for user: %d", user.ID)
	}

	// Update last login
	now := time.Now()
	user.LastLogin = &now
	h.userRepo.UpdateUser(user)

	// Generate tokens
	tokenPair, err := h.jwtService.GenerateTokenPair(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate tokens"})
		return
	}

	// Create session
	session := &models.UserSession{
		UserID:       user.ID,
		RefreshToken: tokenPair.RefreshToken,
		ExpiresAt:    h.jwtService.RefreshTokenExpiration(),
	}

	if err := h.userRepo.CreateSession(session); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create session"})
		return
	}

	response := &AuthResponse{
		User:         h.userToResponse(user),
		AccessToken:  tokenPair.AccessToken,
		RefreshToken: tokenPair.RefreshToken,
		ExpiresIn:    tokenPair.ExpiresIn,
	}

	c.JSON(http.StatusOK, response)
}

// RefreshToken generates new tokens using refresh token
func (h *AuthHandler) RefreshToken(c *gin.Context) {
	var req RefreshRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	if err := h.validator.Struct(req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Validation failed", "details": err.Error()})
		return
	}

	// Get session by refresh token
	session, err := h.userRepo.GetSessionByRefreshToken(req.RefreshToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid refresh token"})
		return
	}

	// Generate new tokens
	tokenPair, err := h.jwtService.GenerateTokenPair(&session.User)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate tokens"})
		return
	}

	// Revoke old session
	h.userRepo.RevokeSession(session.ID)

	// Create new session
	newSession := &models.UserSession{
		UserID:       session.UserID,
		RefreshToken: tokenPair.RefreshToken,
		ExpiresAt:    h.jwtService.RefreshTokenExpiration(),
	}

	if err := h.userRepo.CreateSession(newSession); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create session"})
		return
	}

	response := &AuthResponse{
		User:         h.userToResponse(&session.User),
		AccessToken:  tokenPair.AccessToken,
		RefreshToken: tokenPair.RefreshToken,
		ExpiresIn:    tokenPair.ExpiresIn,
	}

	c.JSON(http.StatusOK, response)
}

// Logout revokes the current session
func (h *AuthHandler) Logout(c *gin.Context) {
	var req RefreshRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	// Get session and revoke it
	session, err := h.userRepo.GetSessionByRefreshToken(req.RefreshToken)
	if err == nil {
		h.userRepo.RevokeSession(session.ID)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

// GetProfile returns current user's profile
func (h *AuthHandler) GetProfile(c *gin.Context) {
	userID := c.GetUint("user_id")
	log.Printf("[DEBUG] GetProfile called - UserID: %d", userID)

	// Always fetch fresh user data from database to ensure we have the latest state
	user, err := h.userRepo.GetUserByID(userID)
	if err != nil {
		log.Printf("[ERROR] GetProfile - Failed to get user %d: %v", userID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User not found"})
		return
	}
	log.Printf("[DEBUG] GetProfile - Returning user profile - UserID: %d, Is2FAEnabled: %t",
		user.ID,
		func() bool {
			if user.Is2FAEnabled == nil {
				return false
			}
			return *user.Is2FAEnabled
		}())

	c.JSON(http.StatusOK, h.userToResponse(user))
}

// ChangePassword allows users to change their password
func (h *AuthHandler) ChangePassword(c *gin.Context) {
	var req ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	if err := h.validator.Struct(req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Validation failed", "details": err.Error()})
		return
	}

	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found in context"})
		return
	}

	userModel := user.(*models.User)

	// Verify current password
	if !userModel.CheckPassword(req.CurrentPassword) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Current password is incorrect"})
		return
	}

	// Hash new password
	if err := userModel.HashPassword(req.NewPassword); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process new password"})
		return
	}

	// Update user
	if err := h.userRepo.UpdateUser(userModel); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update password"})
		return
	}

	// Revoke all sessions to force re-login
	h.userRepo.RevokeAllUserSessions(userModel.ID)

	c.JSON(http.StatusOK, gin.H{"message": "Password changed successfully"})
}

// ChangeEmail allows a user to change their email
func (h *AuthHandler) ChangeEmail(c *gin.Context) {
	var req ChangeEmailRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}
	if err := h.validator.Struct(req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Validation failed", "details": err.Error()})
		return
	}
	userID := c.GetUint("user_id")
	if err := h.userRepo.UpdateUserEmail(userID, req.NewEmail); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update email"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Email updated successfully"})
}

// 2FA setup (TOTP)
func (h *AuthHandler) Setup2FA(c *gin.Context) {
	userID := c.GetUint("user_id")
	log.Printf("[DEBUG] Setup2FA called - UserID: %d", userID)

	user, err := h.userRepo.GetUserByID(userID)
	if err != nil {
		log.Printf("[ERROR] Setup2FA - User not found: %d, error: %v", userID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User not found"})
		return
	}
	log.Printf("[DEBUG] Setup2FA - Current user state - UserID: %d, Is2FAEnabled: %t, HasSecret: %t",
		user.ID,
		func() bool {
			if user.Is2FAEnabled == nil {
				return false
			}
			return *user.Is2FAEnabled
		}(),
		func() bool {
			return user.TwoFASecret != nil && *user.TwoFASecret != ""
		}())

	var req struct {
		Enable bool   `json:"enable"`
		Token  string `json:"token"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("[ERROR] Setup2FA - Invalid request format: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	log.Printf("[DEBUG] Setup2FA - Request - Enable: %t, TokenProvided: %t", req.Enable, req.Token != "")

	if req.Enable {
		log.Printf("[DEBUG] Setup2FA - Enabling 2FA for user: %d", userID)
		// Generate secret and QR code URL
		secret, otpauthURL, err := auth.GenerateTOTPSecret(user.Email)
		if err != nil {
			log.Printf("[ERROR] Setup2FA - Failed to generate secret: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate secret"})
			return
		}
		log.Printf("[DEBUG] Setup2FA - Generated secret for user: %d", userID)

		// Save secret to user (but not enabled yet)
		if err := h.userRepo.Set2FA(userID, secret, false); err != nil {
			log.Printf("[ERROR] Setup2FA - Failed to save secret: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save secret"})
			return
		}
		log.Printf("[DEBUG] Setup2FA - Secret saved for user: %d", userID)

		// Return secret and otpauth URL for QR code
		c.JSON(http.StatusOK, gin.H{"secret": secret, "otpauth_url": otpauthURL})
		return
	}
	// If disabling 2FA
	if !req.Enable {
		log.Printf("[DEBUG] Setup2FA - Disabling 2FA for user: %d", userID)
		// Check if user has 2FA enabled
		is2FAEnabled := user.Is2FAEnabled != nil && *user.Is2FAEnabled
		if !is2FAEnabled {
			log.Printf("[DEBUG] Setup2FA - 2FA not enabled for user: %d", userID)
			c.JSON(http.StatusBadRequest, gin.H{"error": "2FA is not enabled"})
			return
		}

		// Require 2FA token to disable
		if req.Token == "" {
			log.Printf("[DEBUG] Setup2FA - No token provided for disabling 2FA for user: %d", userID)
			c.JSON(http.StatusBadRequest, gin.H{"error": "2FA token required to disable 2FA"})
			return
		}

		log.Printf("[DEBUG] Setup2FA - Validating token for disabling 2FA for user: %d", userID)

		// Validate the 2FA token
		twoFASecret := ""
		if user.TwoFASecret != nil {
			twoFASecret = *user.TwoFASecret
		}
		if !auth.ValidateTOTP(twoFASecret, req.Token) {
			log.Printf("[DEBUG] Setup2FA - Invalid token provided for disabling 2FA for user: %d", userID)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid 2FA code"})
			return
		}

		log.Printf("[DEBUG] Setup2FA - Token validated, proceeding to disable 2FA for user: %d", userID)

		// Disable 2FA
		if err := h.userRepo.Set2FA(userID, "", false); err != nil {
			log.Printf("[ERROR] Setup2FA - Failed to disable 2FA: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to disable 2FA"})
			return
		}

		log.Printf("[DEBUG] Setup2FA - 2FA successfully disabled for user: %d", userID)
		c.JSON(http.StatusOK, gin.H{"message": "2FA disabled"})
		return
	}
}

// 2FA verify endpoint
func (h *AuthHandler) Verify2FA(c *gin.Context) {
	userID := c.GetUint("user_id")
	log.Printf("[DEBUG] Verify2FA called - UserID: %d", userID)

	user, err := h.userRepo.GetUserByID(userID)
	if err != nil {
		log.Printf("[ERROR] Verify2FA - User not found: %d, error: %v", userID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User not found"})
		return
	}
	log.Printf("[DEBUG] Verify2FA - Current user state - UserID: %d, Is2FAEnabled: %t, HasSecret: %t",
		user.ID,
		func() bool {
			if user.Is2FAEnabled == nil {
				return false
			}
			return *user.Is2FAEnabled
		}(),
		func() bool {
			return user.TwoFASecret != nil && *user.TwoFASecret != ""
		}())

	var req struct {
		Token string `json:"token"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("[ERROR] Verify2FA - Invalid request format: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	log.Printf("[DEBUG] Verify2FA - Token provided: %t", req.Token != "")

	if user.TwoFASecret == nil || *user.TwoFASecret == "" {
		log.Printf("[DEBUG] Verify2FA - No 2FA secret found for user: %d", userID)
		c.JSON(http.StatusBadRequest, gin.H{"error": "2FA not initialized"})
		return
	}

	log.Printf("[DEBUG] Verify2FA - Validating TOTP token for user: %d", userID)
	if !auth.ValidateTOTP(*user.TwoFASecret, req.Token) {
		log.Printf("[DEBUG] Verify2FA - Invalid 2FA token for user: %d", userID)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid 2FA code"})
		return
	}

	log.Printf("[DEBUG] Verify2FA - Token validated, enabling 2FA for user: %d", userID)

	// Enable 2FA
	if err := h.userRepo.Set2FA(userID, *user.TwoFASecret, true); err != nil {
		log.Printf("[ERROR] Verify2FA - Failed to enable 2FA: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to enable 2FA"})
		return
	}

	log.Printf("[DEBUG] Verify2FA - 2FA successfully enabled for user: %d", userID)
	c.JSON(http.StatusOK, gin.H{"message": "2FA enabled"})
}

// Helper function to convert user model to response
func (h *AuthHandler) userToResponse(user *models.User) *UserResponse {
	is2FAEnabled := false
	if user.Is2FAEnabled != nil {
		is2FAEnabled = *user.Is2FAEnabled
	}

	return &UserResponse{
		ID:           user.ID,
		Email:        user.Email,
		Role:         user.Role,
		IsVerified:   user.IsVerified,
		CreatedAt:    user.CreatedAt,
		LastLogin:    user.LastLogin,
		Is2FAEnabled: is2FAEnabled,
	}
}
