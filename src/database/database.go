package database

import (
	"fmt"
	"log"
	"os"

	"github.com/glebarez/sqlite"
	"github.com/kevinanielsen/go-fast-cdn/src/models"
	"github.com/kevinanielsen/go-fast-cdn/src/util"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

const (
	DbFolder = "db_data"
	DbName   = "main.db"
)

var DB *gorm.DB

func ConnectToDB() {
	dbType := getEnvOrDefault("DB_TYPE", "sqlite")

	if dbType == "mysql" {
		connectToMySQL()
	} else {
		connectToSQLite()
	}

	// 自动迁移表结构（两种数据库都支持）
	DB.AutoMigrate(&models.Image{}, &models.Doc{}, &models.Config{})
	log.Println("Database initialized!")
}

// connectToSQLite 连接到 SQLite 数据库（默认）
func connectToSQLite() {
	dbPath := fmt.Sprintf("%v/%s", util.ExPath, DbFolder)

	_, err := os.Stat(fmt.Sprintf("%v/%s", dbPath, DbName))
	if err != nil {
		os.Mkdir(dbPath, 0o755)
		log.Printf("DB not found, creating at %v/main.db...", dbPath)
		os.Create(fmt.Sprintf("%v/main.db", dbPath))
	}

	database, err := gorm.Open(sqlite.Open(fmt.Sprintf("%v/main.db", dbPath)), &gorm.Config{
		DisableForeignKeyConstraintWhenMigrating: true,
	})
	if err != nil {
		panic("Failed to connect to SQLite database: " + err.Error())
	}

	DB = database
	log.Println("Connected to SQLite database!")
}

// connectToMySQL connect to MySQL
func connectToMySQL() {
	dbUser := getEnvOrDefault("DB_USER", "root")
	dbPass := getEnvOrDefault("DB_PASSWORD", "password")
	dbHost := getEnvOrDefault("DB_HOST", "localhost")
	dbPort := getEnvOrDefault("DB_PORT", "3306")
	dbName := getEnvOrDefault("DB_NAME", "go_fast_cdn")

	// first step: connect to MySQL server
	dsnWithoutDB := fmt.Sprintf("%s:%s@tcp(%s:%s)/?charset=utf8mb4&parseTime=True&loc=Local",
		dbUser, dbPass, dbHost, dbPort)

	tempDB, err := gorm.Open(mysql.Open(dsnWithoutDB), &gorm.Config{})
	if err != nil {
		panic("Failed to connect to MySQL server: " + err.Error())
	}

	// second step: create database if not exists
	createDBSQL := fmt.Sprintf("CREATE DATABASE IF NOT EXISTS `%s` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci", dbName)
	if err := tempDB.Exec(createDBSQL).Error; err != nil {
		panic("Failed to create database: " + err.Error())
	}
	log.Printf("Database '%s' is ready!", dbName)

	// third step: connect to database
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		dbUser, dbPass, dbHost, dbPort, dbName)

	database, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		DisableForeignKeyConstraintWhenMigrating: true,
	})
	if err != nil {
		panic("Failed to connect to MySQL database: " + err.Error())
	}

	DB = database
	log.Println("Connected to MySQL database!")
}

// getEnvOrDefault get environment variable or default value
func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
