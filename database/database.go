package database

import (
	"github.com/go-fast-cdn/models"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectToDB() {
	database, err := gorm.Open(sqlite.Open("main.db"), &gorm.Config{
		DisableForeignKeyConstraintWhenMigrating: true,
	})
	if err != nil {
		panic("failed to connect to database")
	}

	database.AutoMigrate(&models.Image{}, &models.Doc{})
	DB = database
}
