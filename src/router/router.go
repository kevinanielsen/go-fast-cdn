package router

import (
	"log"
	"os"

	"github.com/kevinanielsen/go-fast-cdn/src/cache"
	"github.com/kevinanielsen/go-fast-cdn/src/middleware"
	"github.com/kevinanielsen/go-fast-cdn/ui"
)

func Router(filter cache.ChecksumFilter) {
	port := ":" + os.Getenv("PORT")

	s := NewServer(
		WithPort(port),
		WithMiddleware(middleware.CORSMiddleware()),
		WithCache(filter),
	)

	s.AddApiRoutes()

	ui.AddRoutes(s.Engine)

	log.Printf("Starting server on port %v", port)
	log.Fatal(s.Run())
}
