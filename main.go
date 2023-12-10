package main

import (
	"fmt"

	"github.com/go-fast-cdn/database"
	"github.com/go-fast-cdn/initializers"
	"github.com/go-fast-cdn/router"
)

func init() {
	initializers.LoadEnvVariables()
	database.ConnectToDB()
}

func main() {
	fmt.Println("Starting")

	router.Router()
}
