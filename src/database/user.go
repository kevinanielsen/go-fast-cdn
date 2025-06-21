package database

import (
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
		return nil, err
	}
	return &user, nil
}

func (r *UserRepo) GetUserByID(id uint) (*models.User, error) {
	var user models.User
	err := r.db.First(&user, id).Error
	if err != nil {
		return nil, err
	}
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
	return r.db.Model(&models.User{}).Where("id = ?", userID).Updates(map[string]interface{}{
		"two_fa_secret":  secret,
		"is2_fa_enabled": enabled,
	}).Error
}
