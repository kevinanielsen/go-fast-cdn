package router

import (
	"os"

	"github.com/gin-gonic/gin"
	"github.com/kevinanielsen/go-fast-cdn/internal/middleware"

	"github.com/kevinanielsen/go-fast-cdn/ui"
)

// Router initializes the router and sets up middleware, routes, etc.
// It returns a *gin.Engine instance configured with the routes, middleware, etc.
func Router() {
	r := gin.Default()

	r.Use(middleware.CORSMiddleware())

	// Add all the API routes
	AddApiRoutes(r)

	// Add the embedded ui routes
	ui.AddRoutes(r)

	r.Run(":" + os.Getenv("PORT"))
}
