package handlers

import (
	"fmt"
	"image"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/anthonynsimon/bild/imgio"
	"github.com/anthonynsimon/bild/transform"
	"github.com/chai2010/webp"
	"github.com/gin-gonic/gin"
	"github.com/kevinanielsen/go-fast-cdn/src/util"
	_ "golang.org/x/image/webp"
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

	filePath := filepath.Join(util.ExPath, "uploads", "images", filename)

	// Open and decode image (supports webp via golang.org/x/image/webp)
	file, err := os.Open(filePath)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}
	defer file.Close()

	img, _, err := image.Decode(file)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	img = transform.Resize(img, body.Width, body.Height, transform.Linear)

	// TODO: a shared accepted image type data could be added to be shared between upload and resize api
	switch imgType {
	case "png":
		if err := imgio.Save(filePath, img, imgio.PNGEncoder()); err != nil {
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}
	case "jpg", "jpeg":
		if err := imgio.Save(filePath, img, imgio.JPEGEncoder(75)); err != nil {
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}
	case "bmp":
		if err := imgio.Save(filePath, img, imgio.BMPEncoder()); err != nil {
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}
	case "webp":
		outFile, err := os.Create(filePath)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}
		defer outFile.Close()
		if err := webp.Encode(outFile, img, &webp.Options{Quality: 75}); err != nil {
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}
	default:
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
			"error": fmt.Sprintf("Image of type %s is not supported", imgType),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "File resized successfully",
	})
}
