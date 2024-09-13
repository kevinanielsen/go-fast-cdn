package server

import "github.com/gin-gonic/gin"

type Server struct {
	Engine *gin.Engine
	Port   string
}

func NewServer(options ...func(s *Server)) *Server {
	s := &Server{
		Engine: gin.Default(),
		Port:   ":8080",
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

func (s *Server) Run() {
	s.Engine.Run(s.Port)
}
