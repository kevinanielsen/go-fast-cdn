package main

import (
	"github.com/gin-gonic/gin"
	"github.com/kevinanielsen/go-fast-cdn/src/database"
	ini "github.com/kevinanielsen/go-fast-cdn/src/initializers"
	"github.com/kevinanielsen/go-fast-cdn/src/router"
	"github.com/kevinanielsen/go-fast-cdn/src/util"
)

func init() {
	util.LoadExPath()
	gin.SetMode("release")
	ini.LoadEnvVariables(true)
	ini.CreateFolders()
	database.ConnectToDB()
	database.Migrate() // Run database migrations
}

func main() {
	router.Router()
}
