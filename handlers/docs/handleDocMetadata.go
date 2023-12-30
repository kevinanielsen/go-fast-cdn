package handlers

import (
	"errors"
	"fmt"
	"net/http"
	"os"

	"github.com/kevinanielsen/go-fast-cdn/util"

	"github.com/gin-gonic/gin"
)

func HandleDocMetadata(c *gin.Context) {
	fileName := c.Param("filename")
	if fileName == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Doc name is required",
		})
		return
	}

	filePath := fmt.Sprintf("%v/uploads/docs/%v", util.ExPath, fileName)
	stat, err := os.Stat(filePath)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Doc does not exist",
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Internal error",
			})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"filename":     fileName,
		"download_url": c.Request.Host + "/api/cdn/download/docs/" + fileName,
		"file_size":    stat.Size(),
	})
}
