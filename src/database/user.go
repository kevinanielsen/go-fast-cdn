package database

import (
	"fmt"
	"log"
	"time"

	"github.com/kevinanielsen/go-fast-cdn/src/models"
	"gorm.io/gorm"
)

type UserRepo struct {
	db *gorm.DB
}

func NewUserRepo(db *gorm.DB) models.UserRepository {
	return &UserRepo{db: db}
}

// User CRUD operations
func (r *UserRepo) CreateUser(user *models.User) error {
	return r.db.Create(user).Error
}

func (r *UserRepo) GetUserByEmail(email string) (*models.User, error) {
	var user models.User
	err := r.db.Where("email = ?", email).First(&user).Error
	if err != nil {
		log.Printf("[DEBUG] GetUserByEmail - Failed to get user %s: %v", email, err)
		return nil, err
	}
	log.Printf("[DEBUG] GetUserByEmail - Retrieved user %d (%s) - Is2FAEnabled: %t, HasSecret: %t",
		user.ID, user.Email,
		func() bool {
			if user.Is2FAEnabled == nil {
				return false
			}
			return *user.Is2FAEnabled
		}(),
		func() bool {
			return user.TwoFASecret != nil && *user.TwoFASecret != ""
		}())

	return &user, nil
}

func (r *UserRepo) GetUserByID(id uint) (*models.User, error) {
	var user models.User
	err := r.db.First(&user, id).Error
	if err != nil {
		log.Printf("[DEBUG] GetUserByID - Failed to get user %d: %v", id, err)
		return nil, err
	}
	log.Printf("[DEBUG] GetUserByID - Retrieved user %d - Is2FAEnabled: %t, HasSecret: %t",
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

	return &user, nil
}

func (r *UserRepo) UpdateUser(user *models.User) error {
	return r.db.Save(user).Error
}

func (r *UserRepo) DeleteUser(id uint) error {
	return r.db.Delete(&models.User{}, id).Error
}

func (r *UserRepo) GetAllUsers() ([]models.User, error) {
	var users []models.User
	err := r.db.Find(&users).Error
	return users, err
}

func (r *UserRepo) CountUsers() (int64, error) {
	var count int64
	err := r.db.Model(&models.User{}).Count(&count).Error
	return count, err
}

// Session management
func (r *UserRepo) CreateSession(session *models.UserSession) error {
	return r.db.Create(session).Error
}

func (r *UserRepo) GetSessionByRefreshToken(token string) (*models.UserSession, error) {
	var session models.UserSession
	err := r.db.Preload("User").Where("refresh_token = ? AND is_revoked = ? AND expires_at > ?",
		token, false, time.Now()).First(&session).Error
	if err != nil {
		return nil, err
	}
	return &session, nil
}

func (r *UserRepo) RevokeSession(sessionID uint) error {
	return r.db.Model(&models.UserSession{}).Where("id = ?", sessionID).Update("is_revoked", true).Error
}

func (r *UserRepo) RevokeAllUserSessions(userID uint) error {
	return r.db.Model(&models.UserSession{}).Where("user_id = ?", userID).Update("is_revoked", true).Error
}

// Password reset
func (r *UserRepo) CreatePasswordReset(reset *models.PasswordReset) error {
	return r.db.Create(reset).Error
}

func (r *UserRepo) GetPasswordResetByToken(token string) (*models.PasswordReset, error) {
	var reset models.PasswordReset
	err := r.db.Preload("User").Where("token = ? AND is_used = ? AND expires_at > ?",
		token, false, time.Now()).First(&reset).Error
	if err != nil {
		return nil, err
	}
	return &reset, nil
}

func (r *UserRepo) MarkPasswordResetAsUsed(resetID uint) error {
	return r.db.Model(&models.PasswordReset{}).Where("id = ?", resetID).Update("is_used", true).Error
}

func (r *UserRepo) UpdateUserEmail(userID uint, newEmail string) error {
	return r.db.Model(&models.User{}).Where("id = ?", userID).Update("email", newEmail).Error
}

func (r *UserRepo) Set2FA(userID uint, secret string, enabled bool) error {
	log.Printf("[DEBUG] Set2FA called - UserID: %d, Secret: %s, Enabled: %t",
		userID,
		func() string {
			if secret == "" {
				return "<empty>"
			}
			return fmt.Sprintf("<length:%d>", len(secret))
		}(),
		enabled)

	// First, let's check the current state before update
	var currentUser models.User
	if err := r.db.Where("id = ?", userID).First(&currentUser).Error; err != nil {
		log.Printf("[ERROR] Set2FA - Failed to get current user state: %v", err)
		return err
	}
	log.Printf("[DEBUG] Set2FA - Current state before update - UserID: %d, Is2FAEnabled: %t, TwoFASecret: %s",
		currentUser.ID,
		func() bool {
			if currentUser.Is2FAEnabled == nil {
				return false
			}
			return *currentUser.Is2FAEnabled
		}(),
		func() string {
			if currentUser.TwoFASecret == nil {
				return "<nil>"
			}
			if *currentUser.TwoFASecret == "" {
				return "<empty>"
			}
			return fmt.Sprintf("<length:%d>", len(*currentUser.TwoFASecret))
		}()) // Perform the update using pointer values to handle zero values correctly
	secretPtr := &secret
	enabledPtr := &enabled

	// If we're disabling 2FA, set secret to nil (NULL in database)
	if !enabled && secret == "" {
		secretPtr = nil
	}

	result := r.db.Model(&models.User{}).Where("id = ?", userID).Updates(models.User{
		TwoFASecret:  secretPtr,
		Is2FAEnabled: enabledPtr,
	})

	if result.Error != nil {
		log.Printf("[ERROR] Set2FA - Database update failed: %v", result.Error)
		return result.Error
	}

	log.Printf("[DEBUG] Set2FA - Database update completed - Rows affected: %d", result.RowsAffected)

	// Verify the update by checking the current state
	var updatedUser models.User
	if err := r.db.Where("id = ?", userID).First(&updatedUser).Error; err != nil {
		log.Printf("[ERROR] Set2FA - Failed to verify updated state: %v", err)
		return err
	}

	log.Printf("[DEBUG] Set2FA - State after update - UserID: %d, Is2FAEnabled: %t, TwoFASecret: %s",
		updatedUser.ID,
		func() bool {
			if updatedUser.Is2FAEnabled == nil {
				return false
			}
			return *updatedUser.Is2FAEnabled
		}(),
		func() string {
			if updatedUser.TwoFASecret == nil {
				return "<nil>"
			}
			if *updatedUser.TwoFASecret == "" {
				return "<empty>"
			}
			return fmt.Sprintf("<length:%d>", len(*updatedUser.TwoFASecret))
		}())

	return nil
}
