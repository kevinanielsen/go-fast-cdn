package auth

import (
	"crypto/rand"
	"encoding/base64"
	"errors"
	"os"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/kevinanielsen/go-fast-cdn/src/models"
)

type JWTService struct {
	secretKey []byte
}

type Claims struct {
	UserID uint   `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

type TokenPair struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int64  `json:"expires_in"`
}

func NewJWTService() *JWTService {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "your-super-secret-jwt-key-change-in-production-use-at-least-32-characters"
	}
	return &JWTService{
		secretKey: []byte(secret),
	}
}

// GenerateTokenPair creates both access and refresh tokens
func (j *JWTService) GenerateTokenPair(user *models.User) (*TokenPair, error) {
	// Generate access token (short-lived)
	accessToken, err := j.GenerateAccessToken(user)
	if err != nil {
		return nil, err
	}

	// Generate refresh token (long-lived, random string)
	refreshToken, err := j.GenerateRefreshToken()
	if err != nil {
		return nil, err
	}

	// Get expiration time from environment or default to 15 minutes
	expiresInStr := os.Getenv("JWT_EXPIRES_IN")
	expiresIn := int64(15 * 60) // 15 minutes default
	if expiresInStr != "" {
		if parsed, err := strconv.ParseInt(expiresInStr, 10, 64); err == nil {
			expiresIn = parsed
		}
	}

	return &TokenPair{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    expiresIn,
	}, nil
}

// GenerateAccessToken creates a JWT access token
func (j *JWTService) GenerateAccessToken(user *models.User) (string, error) {
	// Get expiration time from environment or default to 15 minutes
	expiresInStr := os.Getenv("JWT_EXPIRES_IN")
	expiresIn := time.Minute * 15 // 15 minutes default
	if expiresInStr != "" {
		if parsed, err := strconv.ParseInt(expiresInStr, 10, 64); err == nil {
			expiresIn = time.Duration(parsed) * time.Second
		}
	}

	claims := &Claims{
		UserID: user.ID,
		Email:  user.Email,
		Role:   user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(expiresIn)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "go-fast-cdn",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(j.secretKey)
}

// GenerateRefreshToken creates a random refresh token
func (j *JWTService) GenerateRefreshToken() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(bytes), nil
}

// ValidateToken validates and parses a JWT token
func (j *JWTService) ValidateToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("invalid signing method")
		}
		return j.secretKey, nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}

// RefreshTokenExpiration returns the expiration time for refresh tokens
func (j *JWTService) RefreshTokenExpiration() time.Time {
	// Refresh tokens expire in 7 days by default
	expiresInStr := os.Getenv("REFRESH_TOKEN_EXPIRES_IN")
	expiresIn := time.Hour * 24 * 7 // 7 days default
	if expiresInStr != "" {
		if parsed, err := strconv.ParseInt(expiresInStr, 10, 64); err == nil {
			expiresIn = time.Duration(parsed) * time.Second
		}
	}
	return time.Now().Add(expiresIn)
}
