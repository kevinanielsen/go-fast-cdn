package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/go-fast-cdn/database"
)

func HandleDocsRename(c *gin.Context) {
	oldName := c.PostForm("filename")
	newName := c.PostForm("newname")

	if oldName == "" || newName == "" {
		c.String(http.StatusBadRequest, "Invalid request")
		return
	}

	err := database.RenameDoc(oldName, newName)
	if err != nil {
		c.String(http.StatusInternalServerError, "Failed to rename file: %s", err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "File renamed successfully"})
}
