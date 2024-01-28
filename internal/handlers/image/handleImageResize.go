package handlers

import (
	"fmt"
	"net/http"
	"path/filepath"
	"strings"

	"github.com/anthonynsimon/bild/imgio"
	"github.com/anthonynsimon/bild/transform"
	"github.com/gin-gonic/gin"
	"github.com/kevinanielsen/go-fast-cdn/internal/util"
)

// TODO: add logging package
func HandleImageResize(c *gin.Context) {
	body := struct {
		Filename string `json:"filename" binding:"required"`
		Width    int    `json:"width" binding:"required"`
		Height   int    `json:"height" binding:"required"`
	}{}
	if e := c.BindJSON(&body); e != nil {
		// TODO: add shared error handling across handler package
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
			"error": e.Error(),
		})
		return
	}

	filename, err := util.FilterFilename(body.Filename)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}
	imgType := strings.Split(filename, ".")[1]

	filepath := filepath.Join(util.ExPath, "uploads", "images", filename)

	img, err := imgio.Open(filepath)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}
	img = transform.Resize(img, body.Width, body.Height, transform.Linear)

	// TODO: a shared accepted image type data could be added to be shared between upload and resize api
	var encoder imgio.Encoder
	switch imgType {
	case "png":
		encoder = imgio.PNGEncoder()
	case "jpg", "jpeg":
		// 75 is the default quality encoding parameter
		encoder = imgio.JPEGEncoder(75)
	case "bmp":
		encoder = imgio.BMPEncoder()
	default:
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
			"error": fmt.Sprintf("Image of type %s is not supported", imgType),
		})
		return
	}

	if err := imgio.Save(filepath, img, encoder); err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "File resized successfully",
	})
}
