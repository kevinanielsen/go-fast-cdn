package router

import (
	"os"

	"github.com/gin-gonic/gin"
	"github.com/kevinanielsen/go-fast-cdn/middleware"
	"github.com/kevinanielsen/go-fast-cdn/ui"
)

func Router() {
	r := gin.Default()

	r.Use(middleware.CORSMiddleware())

	// Add all the API routes
	AddApiRoutes(r)

	// Add the embedded ui routes
	ui.AddRoutes(r)

	r.Run(":" + os.Getenv("PORT"))
}
