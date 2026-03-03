package router

import (
	"github.com/gin-gonic/gin"
	"github.com/kevinanielsen/go-fast-cdn/src/cache"
)

type Server struct {
	Engine *gin.Engine
	Port   string
	Filter cache.ChecksumFilter
}

func NewServer(options ...func(s *Server)) *Server {
	s := &Server{
		Engine: gin.Default(),
		Port:   ":8080",
		Filter: cache.NewDisabledFilter(),
	}

	for _, option := range options {
		option(s)
	}

	return s
}

func WithPort(port string) func(*Server) {
	return func(s *Server) {
		s.Port = port
	}
}

func WithMiddleware(middleware gin.HandlerFunc) func(*Server) {
	return func(s *Server) {
		s.Engine.Use(middleware)
	}
}

func WithCache(filter cache.ChecksumFilter) func(*Server) {
	return func(s *Server) {
		s.Filter = filter
	}
}

func (s *Server) Run() error {
	err := s.Engine.Run(s.Port)
	return err
}
