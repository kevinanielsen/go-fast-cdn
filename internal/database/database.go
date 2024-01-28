package database

import (
	"fmt"
	"log"
	"os"

	"github.com/glebarez/sqlite"
	"github.com/kevinanielsen/go-fast-cdn/internal/models"
	"github.com/kevinanielsen/go-fast-cdn/internal/util"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectToDB() {
	dbPath := fmt.Sprintf("%v/db_data", util.ExPath)

	_, err := os.Stat(fmt.Sprintf("%v/main.db", dbPath))
	if err != nil {
		os.Mkdir(dbPath, 0o755)
		log.Printf("DB not found, creating at %v/main.db...", dbPath)
		os.Create(fmt.Sprintf("%v/main.db", dbPath))
	}

	database, err := gorm.Open(sqlite.Open(fmt.Sprintf("%v/main.db", dbPath)), &gorm.Config{
		DisableForeignKeyConstraintWhenMigrating: true,
	})
	if err != nil {
		panic("Failed to connect to database!")
	}
	log.Println("Connected to database!")

	database.AutoMigrate(&models.Image{}, &models.Doc{})
	DB = database
	log.Println("Database initialized!")
}
