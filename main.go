package main

import (
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/go-fast-cdn/database"
	"github.com/go-fast-cdn/initializers"
	"github.com/go-fast-cdn/router"
)

func init() {
	gin.SetMode("debug")
	initializers.LoadEnvVariables(true)
	database.ConnectToDB()
}

func main() {
	fmt.Println("Starting")

	router.Router()
}
