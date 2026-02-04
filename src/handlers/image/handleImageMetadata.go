package handlers

import (
	"errors"
	"image"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"github.com/kevinanielsen/go-fast-cdn/src/util"
	_ "golang.org/x/image/webp"
)

func (h *ImageHandler) HandleImageMetadata(c *gin.Context) {
	fileName := c.Param("filename")
	if fileName == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Image name is required",
		})
		return
	}

	img, err := h.repo.GetImageByFileName(fileName)
	if err == nil && img.FileSize > 0 {
		c.JSON(http.StatusOK, gin.H{
			"filename":     img.FileName,
			"download_url": c.Request.Host + "/api/cdn/download/images/" + img.FileName,
			"file_size":    img.FileSize,
			"width":        img.Width,
			"height":       img.Height,
		})
		return
	}

	filePath := filepath.Join(util.ExPath, "uploads", "images", fileName)

	if fileinfo, err := os.Stat(filePath); err == nil {
		if file, err := os.Open(filePath); err != nil {
			log.Printf("Failed to open the image %s: %s\n", fileName, err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Internal server error",
			})
			return
		} else {
			defer file.Close()

			decodedImg, _, err := image.Decode(file)
			if err != nil {
				log.Printf("Failed to decode image %s: %s\n", fileName, err.Error())
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "Internal server error",
				})
				return
			}
			width := decodedImg.Bounds().Dx()
			height := decodedImg.Bounds().Dy()

			body := gin.H{
				"filename":     fileName,
				"download_url": c.Request.Host + "/api/cdn/download/images/" + fileName,
				"file_size":    fileinfo.Size(),
				"width":        width,
				"height":       height,
			}

			c.JSON(http.StatusOK, body)
		}
	} else if errors.Is(err, os.ErrNotExist) {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Image does not exist",
		})
		return
	} else {
		log.Printf("Failed to get the image %s: %s\n", fileName, err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Internal server error",
		})
		return
	}
}
