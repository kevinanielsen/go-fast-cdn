package router

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/kevinanielsen/go-fast-cdn/src/database"
	"github.com/kevinanielsen/go-fast-cdn/src/handlers"
	authHandlers "github.com/kevinanielsen/go-fast-cdn/src/handlers/auth"
	dbHandlers "github.com/kevinanielsen/go-fast-cdn/src/handlers/db"
	dHandlers "github.com/kevinanielsen/go-fast-cdn/src/handlers/docs"
	iHandlers "github.com/kevinanielsen/go-fast-cdn/src/handlers/image"
	"github.com/kevinanielsen/go-fast-cdn/src/middleware"
	"github.com/kevinanielsen/go-fast-cdn/src/util"
)

func (s *Server) AddApiRoutes() {
	api := s.Engine.Group("/api")
	api.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, "pong")
	})

	// Authentication routes (public)
	authHandler := authHandlers.NewAuthHandler(database.NewUserRepo(database.DB))
	auth := api.Group("/auth")
	{
		auth.POST("/register", authHandler.Register)
		auth.POST("/login", authHandler.Login)
		auth.POST("/refresh", authHandler.RefreshToken)
		auth.POST("/logout", authHandler.Logout)
	}

	// Initialize auth middleware
	authMiddleware := middleware.NewAuthMiddleware()

	// Protected auth routes
	authProtected := api.Group("/auth")
	authProtected.Use(authMiddleware.RequireAuth())
	{
		authProtected.GET("/profile", authHandler.GetProfile)
		authProtected.PUT("/change-password", authHandler.ChangePassword)
		authProtected.PUT("/change-email", authHandler.ChangeEmail)
		authProtected.POST("/2fa", authHandler.Setup2FA)
		authProtected.POST("/2fa/verify", authHandler.Verify2FA)
	}

	cdn := api.Group("/cdn")
	docHandler := dHandlers.NewDocHandler(database.NewDocRepo(database.DB))
	imageHandler := iHandlers.NewImageHandler(database.NewImageRepo(database.DB))

	// Public CDN routes (read-only)
	{
		cdn.GET("/size", handlers.GetSizeHandler)
		cdn.GET("/doc/all", docHandler.HandleAllDocs)
		cdn.GET("/doc/:filename", dHandlers.HandleDocMetadata)
		cdn.GET("/image/all", imageHandler.HandleAllImages)
		cdn.GET("/image/:filename", iHandlers.HandleImageMetadata)
		cdn.Static("/download/images", util.ExPath+"/uploads/images")
		cdn.Static("/download/docs", util.ExPath+"/uploads/docs")
	}

	// Protected CDN routes (require authentication)
	cdnProtected := cdn.Group("/")
	cdnProtected.Use(authMiddleware.RequireAuth())

	upload := cdnProtected.Group("upload")
	{
		upload.POST("/image", imageHandler.HandleImageUpload)
		upload.POST("/doc", docHandler.HandleDocUpload)
	}

	delete := cdnProtected.Group("delete")
	{
		delete.DELETE("/image/:filename", imageHandler.HandleImageDelete)
		delete.DELETE("/doc/:filename", docHandler.HandleDocDelete)
	}

	rename := cdnProtected.Group("rename")
	{
		rename.PUT("/image", imageHandler.HandleImageRename)
		rename.PUT("/doc", docHandler.HandleDocsRename)
	}

	resize := cdnProtected.Group("resize")
	{
		resize.PUT("/image", iHandlers.HandleImageResize)
	}
	// Admin-only routes
	adminRoutes := api.Group("/admin")
	adminRoutes.Use(authMiddleware.RequireAuth(), authMiddleware.RequireAdmin())
	{
		adminRoutes.POST("/drop/database", dbHandlers.HandleDropDB)
	}
}
