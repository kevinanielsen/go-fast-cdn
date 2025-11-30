package router

import (
	"log"
	"os"

	"github.com/kevinanielsen/go-fast-cdn/src/middleware"
	"github.com/kevinanielsen/go-fast-cdn/ui"
)

// Router initializes the router and sets up middleware, routes, etc.
// It returns a *gin.Engine instance configured with the routes, middleware, etc.
func Router() {
	port := ":" + os.Getenv("PORT")

	s := NewServer(
		WithPort(port),
		WithMiddleware(middleware.CORSMiddleware()),
	)

	// Add all the API routes
	s.AddApiRoutes()

	// Add the embedded ui routes
	ui.AddRoutes(s.Engine)

	log.Printf("Starting server on port %v", port)
	log.Fatal(s.Run())
}
