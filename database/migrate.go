package database

import "github.com/go-fast-cdn/models"

func Migrate() {
	DB.AutoMigrate(&models.Image{}, &models.Doc{})
}
