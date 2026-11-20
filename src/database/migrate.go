package database

import "github.com/kevinanielsen/go-fast-cdn/src/models"

// Migrate runs database migrations for all model structs using
// the global DB instance. This would typically be called on app startup.
func Migrate() error {
	return DB.AutoMigrate(&models.Image{}, &models.Doc{}, &models.User{}, &models.UserSession{}, &models.PasswordReset{}, &models.APIToken{})
}
