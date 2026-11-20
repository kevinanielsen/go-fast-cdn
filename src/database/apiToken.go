package database

import (
	"context"
	"errors"
	"time"

	"github.com/kevinanielsen/go-fast-cdn/src/models"
	"gorm.io/gorm"
)

const MaxActiveAPITokens = 10

var (
	ErrAPITokenLimit      = errors.New("active API token limit reached")
	ErrCredentialsChanged = errors.New("account credentials changed")
)

type APITokenRepo struct {
	db *gorm.DB
}

func NewAPITokenRepo(db *gorm.DB) *APITokenRepo {
	return &APITokenRepo{db: db}
}

func (r *APITokenRepo) Create(ctx context.Context, user *models.User, token *models.APIToken) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var current models.User
		if err := tx.Where("deleted_at IS NULL").First(&current, user.ID).Error; err != nil {
			return err
		}
		if current.PasswordHash != user.PasswordHash || !current.UpdatedAt.Equal(user.UpdatedAt) {
			return ErrCredentialsChanged
		}

		now := time.Now().UTC()
		historyCutoff := now.AddDate(0, 0, -90)
		if err := tx.Where("user_id = ? AND (expires_at <= ? OR revoked_at <= ?)",
			user.ID, historyCutoff, historyCutoff).Delete(&models.APIToken{}).Error; err != nil {
			return err
		}
		var count int64
		if err := tx.Model(&models.APIToken{}).
			Where("user_id = ? AND revoked_at IS NULL AND expires_at > ?", user.ID, now).
			Count(&count).Error; err != nil {
			return err
		}
		if count >= MaxActiveAPITokens {
			return ErrAPITokenLimit
		}
		token.UserID = user.ID
		return tx.Create(token).Error
	})
}

func (r *APITokenRepo) List(ctx context.Context, userID uint) ([]models.APIToken, error) {
	tokens := make([]models.APIToken, 0)
	err := r.db.WithContext(ctx).Omit("digest").Where("user_id = ?", userID).
		Order("id DESC").Find(&tokens).Error
	return tokens, err
}

func (r *APITokenRepo) Revoke(ctx context.Context, userID, tokenID uint) error {
	result := r.db.WithContext(ctx).Model(&models.APIToken{}).
		Where("user_id = ? AND id = ?", userID, tokenID).
		Update("revoked_at", gorm.Expr("COALESCE(revoked_at, ?)", time.Now().UTC()))
	if result.Error == nil && result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return result.Error
}

func (r *APITokenRepo) FindActive(ctx context.Context, digest string) (*models.APIToken, error) {
	var token models.APIToken
	err := r.db.WithContext(ctx).Omit("digest").
		Joins("JOIN users ON users.id = api_tokens.user_id AND users.deleted_at IS NULL").
		Where("api_tokens.digest = ? AND api_tokens.revoked_at IS NULL AND api_tokens.expires_at > ?",
			digest, time.Now().UTC()).First(&token).Error
	return &token, err
}

func (r *APITokenRepo) RecordUse(ctx context.Context, token *models.APIToken) error {
	now := time.Now().UTC()
	cutoff := now.Add(-5 * time.Minute)
	if token.LastUsedAt != nil && token.LastUsedAt.After(cutoff) {
		return nil
	}
	return r.db.WithContext(ctx).Model(&models.APIToken{}).
		Where("id = ? AND revoked_at IS NULL AND expires_at > ? AND (last_used_at IS NULL OR last_used_at <= ?)",
			token.ID, now, cutoff).
		Update("last_used_at", now).Error
}
