package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/kevinanielsen/go-fast-cdn/internal/database"
	"github.com/kevinanielsen/go-fast-cdn/internal/util"
)

func HandleImageDelete(c *gin.Context) {
	fileName := c.Param("filename")
	if fileName == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Doc name is required",
		})
		return
	}

	deletedFileName, success := database.DeleteImage(fileName)
	if !success {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Image not found",
		})
		return
	}

	err := util.DeleteFile(deletedFileName, "images")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to delete image",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "Image deleted successfully",
		"fileName": deletedFileName,
	})
}
