package router

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/kevinanielsen/go-fast-cdn/src/database"
	"github.com/kevinanielsen/go-fast-cdn/src/handlers"
	dbHandlers "github.com/kevinanielsen/go-fast-cdn/src/handlers/db"
	dHandlers "github.com/kevinanielsen/go-fast-cdn/src/handlers/docs"
	iHandlers "github.com/kevinanielsen/go-fast-cdn/src/handlers/image"
	"github.com/kevinanielsen/go-fast-cdn/src/util"
)

func (s *Server) AddApiRoutes() {
	api := s.Engine.Group("/api")
	api.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, "pong")
	})

	cdn := api.Group("/cdn")
	docHandler := dHandlers.NewDocHandler(database.NewDocRepo(database.DB))
	imageHandler := iHandlers.NewImageHandler(database.NewImageRepo(database.DB))

	{
		cdn.GET("/size", handlers.GetSizeHandler)
		cdn.GET("/doc/all", docHandler.HandleAllDocs)
		cdn.GET("/doc/:filename", dHandlers.HandleDocMetadata)
		cdn.GET("/image/all", imageHandler.HandleAllImages)
		cdn.GET("/image/:filename", iHandlers.HandleImageMetadata)
		cdn.POST("/drop/database", dbHandlers.HandleDropDB)
		cdn.Static("/download/images", util.ExPath+"/uploads/images")
		cdn.Static("/download/docs", util.ExPath+"/uploads/docs")
	}

	upload := cdn.Group("/upload")
	{
		upload.POST("/image", imageHandler.HandleImageUpload)
		upload.POST("/doc", docHandler.HandleDocUpload)
	}

	delete := cdn.Group("/delete")
	{
		delete.DELETE("/image/:filename", imageHandler.HandleImageDelete)
		delete.DELETE("/doc/:filename", docHandler.HandleDocDelete)
	}

	rename := cdn.Group("/rename")
	{
		rename.PUT("/image", imageHandler.HandleImageRename)
		rename.PUT("/doc", docHandler.HandleDocsRename)
	}

	resize := cdn.Group("/resize")
	{
		resize.PUT("/image", iHandlers.HandleImageResize)
	}
}
