package router

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	docHandlers "github.com/go-fast-cdn/util/handlers/docs"
	imageHandlers "github.com/go-fast-cdn/util/handlers/image"
)

func Router() {
	r := gin.Default()

	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, "pong")
	})

	api := r.Group("/api")
	{
		api.GET("/image/all", imageHandlers.HandleAllImages)
	}

	cdn := api.Group("/cdn")
	{

	}

	upload := cdn.Group("/upload")
	{
		upload.POST("/image", imageHandlers.HandleImageUpload)
		upload.POST("/doc", docHandlers.HandleDocsUpload)
	}

	r.Static("/download/images", "./uploads/images")
	r.Static("/download/docs", "./uploads/docs")

	r.Run(":" + os.Getenv("PORT"))
}
