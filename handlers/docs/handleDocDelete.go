package handlers

import (
	"net/http"

	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/go-fast-cdn/database"
	"github.com/go-fast-cdn/util"
	"os"
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
	filePath := fmt.Sprintf("%v/uploads/docs/%v", util.ExPath, deletedFileName)
	err := os.Remove(filePath)
	if success && err == nil {
		c.JSON(http.StatusOK, gin.H{
			"message":  "Document deleted successfuly",
			"fileName": deletedFileName,
		})
	} else {
		fmt.Println(success)
		fmt.Println(err)
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Document not found",
		})
	}
}
