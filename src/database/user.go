package database

import (
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
	return r.db.Model(user).Select("email", "role", "is_verified").Updates(user).Error
}

func (r *UserRepo) UpdateLastLogin(userID uint, lastLogin time.Time) error {
	return r.db.Model(&models.User{}).Where("id = ?", userID).
		UpdateColumn("last_login", lastLogin).Error
}

func (r *UserRepo) DeleteUser(id uint) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("user_id = ?", id).Delete(&models.APIToken{}).Error; err != nil {
			return err
		}
		return tx.Delete(&models.User{}, id).Error
	})
}

func (r *UserRepo) ChangePassword(userID uint, previousHash, newHash string) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		updated := tx.Model(&models.User{}).
			Where("id = ? AND password_hash = ? AND deleted_at IS NULL", userID, previousHash).
			Update("password_hash", newHash)
		if updated.Error != nil {
			return updated.Error
		}
		if updated.RowsAffected == 0 {
			return ErrCredentialsChanged
		}
		if err := tx.Model(&models.UserSession{}).Where("user_id = ?", userID).
			Update("is_revoked", true).Error; err != nil {
			return err
		}
		return tx.Model(&models.APIToken{}).Where("user_id = ? AND revoked_at IS NULL", userID).
			Update("revoked_at", time.Now().UTC()).Error
	})
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

func (r *UserRepo) Set2FA(expected *models.User, secret string, enabled bool) error {
	var newSecret *string
	if secret != "" {
		newSecret = &secret
	}

	// Only update the exact factor state the handler checked.
	result := r.db.Model(&models.User{}).Where("id = ? AND deleted_at IS NULL", expected.ID).
		Where(&models.User{Is2FAEnabled: expected.Is2FAEnabled, TwoFASecret: expected.TwoFASecret},
			"Is2FAEnabled", "TwoFASecret").
		Select("Is2FAEnabled", "TwoFASecret").
		Updates(models.User{Is2FAEnabled: &enabled, TwoFASecret: newSecret})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return ErrCredentialsChanged
	}
	return nil
}
