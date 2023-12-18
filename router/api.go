package router

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/go-fast-cdn/util"
	dbHandlers "github.com/go-fast-cdn/util/handlers/db"
	dHandlers "github.com/go-fast-cdn/util/handlers/docs"
	iHandlers "github.com/go-fast-cdn/util/handlers/image"
)

func AddApiRoutes(r *gin.Engine) {
	api := r.Group("/api")
	api.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, "pong")
	})

	cdn := api.Group("/cdn")

	{
		cdn.GET("/doc/all", dHandlers.HandleAllDocs)
		cdn.GET("/image/all", iHandlers.HandleAllImages)
		cdn.POST("/drop/database", dbHandlers.HandleDropDB)
		cdn.Static("/download/images", util.ExPath+"/uploads/images")
		cdn.Static("/download/docs", util.ExPath+"/uploads/docs")
	}

	upload := cdn.Group("/upload")
	{
		upload.POST("/image", iHandlers.HandleImageUpload)
		upload.POST("/doc", dHandlers.HandleDocsUpload)
	}

	rename := cdn.Group("/rename")
	{
		rename.PUT("/image", iHandlers.HandleImageRename)
		rename.PUT("/doc", dHandlers.HandleDocsRename)
	}
}
