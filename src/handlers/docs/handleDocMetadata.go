package handlers

import (
	"errors"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/kevinanielsen/go-fast-cdn/src/util"

	"github.com/gin-gonic/gin"
)

func (h *DocHandler) HandleDocMetadata(c *gin.Context) {
	fileName := c.Param("filename")
	if fileName == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Doc name is required",
		})
		return
	}

	doc, err := h.repo.GetDocByFileName(fileName)
	if err == nil && doc.FileSize > 0 {
		c.JSON(http.StatusOK, gin.H{
			"filename":     doc.FileName,
			"download_url": c.Request.Host + "/api/cdn/download/docs/" + doc.FileName,
			"file_size":    doc.FileSize,
		})
		return
	}

	filePath := filepath.Join(util.ExPath, "uploads", "docs", fileName)
	stat, err := os.Stat(filePath)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Doc does not exist",
			})
		} else {
			log.Printf("Failed to get document %s: %s\n", fileName, err.Error())
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
