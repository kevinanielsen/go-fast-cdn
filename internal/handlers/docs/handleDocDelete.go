package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/kevinanielsen/go-fast-cdn/internal/database"
	"github.com/kevinanielsen/go-fast-cdn/internal/util"
)

func HandleDocDelete(c *gin.Context) {
	fileName := c.Param("filename")
	if fileName == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Doc name is required",
		})
		return
	}

	deletedFileName, success := database.DeleteDoc(fileName)
	if !success {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Document not found",
		})
		return
	}

	err := util.DeleteFile(deletedFileName, "docs")
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Failed to delete document",
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "Document deleted successfully",
		"fileName": deletedFileName,
	})
}
