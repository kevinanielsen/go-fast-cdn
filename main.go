package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/go-fast-cdn/database"
	ini "github.com/go-fast-cdn/initializers"
	"github.com/go-fast-cdn/router"
	"github.com/go-fast-cdn/util"
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
