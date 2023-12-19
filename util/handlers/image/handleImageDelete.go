package handlers

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/go-fast-cdn/database"
	"github.com/go-fast-cdn/util"
	"net/http"
	"os"
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
	filePath := fmt.Sprintf("%v/uploads/images/%v", util.ExPath, deletedFileName)
	err := os.Remove(filePath)
	if success && err == nil {
		c.JSON(http.StatusOK, gin.H{
			"message":  "Image deleted successfuly",
			"fileName": deletedFileName,
		})
	} else {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Image not found",
		})
	}
}
