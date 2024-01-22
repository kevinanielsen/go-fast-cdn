package main

import (
	"log"
	"os"

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
}

func main() {
	log.Printf("Starting server on port %v", os.Getenv("PORT"))
	router.Router()
}
