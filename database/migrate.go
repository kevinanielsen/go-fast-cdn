package database

import "github.com/kevinanielsen/go-fast-cdn/models"

func Migrate() {
	DB.AutoMigrate(&models.Image{}, &models.Doc{})
}
