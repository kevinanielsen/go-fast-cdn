package router

import (
	"os"

	"github.com/kevinanielsen/go-fast-cdn/src/middleware"
	"github.com/kevinanielsen/go-fast-cdn/src/server"
	"github.com/kevinanielsen/go-fast-cdn/ui"
)

// Router initializes the router and sets up middleware, routes, etc.
// It returns a *gin.Engine instance configured with the routes, middleware, etc.
func Router() {
	port := ":" + os.Getenv("PORT")

	s := server.NewServer(
		server.WithPort(port),
		server.WithMiddleware(middleware.CORSMiddleware()),
	)

	// Add all the API routes
	AddApiRoutes(s.Engine)

	// Add the embedded ui routes
	ui.AddRoutes(s.Engine)

	s.Run()
}
