package database

import (
	"errors"

	"github.com/kevinanielsen/go-fast-cdn/src/models"
	"gorm.io/gorm"
)

// ConfigRepo provides CRUD for config key/values
func NewConfigRepo(db *gorm.DB) *ConfigRepo {
	return &ConfigRepo{db: db}
}

type ConfigRepo struct {
	db *gorm.DB
}

func (r *ConfigRepo) Get(key string) (string, error) {
	var config models.Config
	if err := r.db.First(&config, "key = ?", key).Error; err != nil {
		return "", err
	}
	return config.Value, nil
}

func (r *ConfigRepo) Set(key, value string) error {
	var config models.Config
	err := r.db.First(&config, "key = ?", key).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		config.Key = key
		config.Value = value
		return r.db.Create(&config).Error
	} else if err != nil {
		return err
	}
	config.Value = value
	return r.db.Save(&config).Error
}
