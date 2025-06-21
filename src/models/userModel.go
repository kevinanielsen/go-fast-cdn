package models

import (
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Email        string     `json:"email" gorm:"unique;not null" validate:"required,email"`
	PasswordHash string     `json:"-" gorm:"not null"`
	Role         string     `json:"role" gorm:"default:user" validate:"oneof=admin user"`
	IsVerified   bool       `json:"is_verified" gorm:"default:false"`
	LastLogin    *time.Time `json:"last_login"`
	Is2FAEnabled *bool      `json:"is_2fa_enabled" gorm:"default:false"`
	TwoFASecret  *string    `json:"-" gorm:"default:null"`
}

type UserSession struct {
	gorm.Model
	UserID       uint      `json:"user_id" gorm:"not null"`
	User         User      `json:"user" gorm:"foreignKey:UserID"`
	RefreshToken string    `json:"-" gorm:"unique;not null"`
	ExpiresAt    time.Time `json:"expires_at" gorm:"not null"`
	IsRevoked    bool      `json:"is_revoked" gorm:"default:false"`
}

type PasswordReset struct {
	gorm.Model
	UserID    uint      `json:"user_id" gorm:"not null"`
	User      User      `json:"user" gorm:"foreignKey:UserID"`
	Token     string    `json:"-" gorm:"unique;not null"`
	ExpiresAt time.Time `json:"expires_at" gorm:"not null"`
	IsUsed    bool      `json:"is_used" gorm:"default:false"`
}

// UserRepository interface for database operations
type UserRepository interface {
	CreateUser(user *User) error
	GetUserByEmail(email string) (*User, error)
	GetUserByID(id uint) (*User, error)
	UpdateUser(user *User) error
	DeleteUser(id uint) error
	GetAllUsers() ([]User, error)

	// Session management
	CreateSession(session *UserSession) error
	GetSessionByRefreshToken(token string) (*UserSession, error)
	RevokeSession(sessionID uint) error
	RevokeAllUserSessions(userID uint) error

	// Password reset
	CreatePasswordReset(reset *PasswordReset) error
	GetPasswordResetByToken(token string) (*PasswordReset, error)
	MarkPasswordResetAsUsed(resetID uint) error
	UpdateUserEmail(userID uint, newEmail string) error
	Set2FA(userID uint, secret string, enabled bool) error
}

// HashPassword hashes a plain text password
func (u *User) HashPassword(password string) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	u.PasswordHash = string(hashedPassword)
	return nil
}

// CheckPassword verifies a password against the hash
func (u *User) CheckPassword(password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(password))
	return err == nil
}

// BeforeCreate hook to hash password before saving
func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.Role == "" {
		u.Role = "user"
	}
	return nil
}
