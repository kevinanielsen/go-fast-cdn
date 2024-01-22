package handlers

import (
	"net/http"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"github.com/kevinanielsen/go-fast-cdn/src/database"
	"github.com/kevinanielsen/go-fast-cdn/src/util"
)

func HandleDocsRename(c *gin.Context) {
	oldName := c.PostForm("filename")
	newName := c.PostForm("newname")

	if oldName == "" || newName == "" {
		c.String(http.StatusBadRequest, "Invalid request")
		return
	}

	prefix := filepath.Join(util.ExPath, "uploads", "images")

	err := os.Rename(
		filepath.Join(prefix, oldName),
		filepath.Join(prefix, newName),
	)
	if err != nil {
		c.String(http.StatusInternalServerError, "Failed to rename file: %s", err.Error())
		return
	}

	err = database.RenameDoc(oldName, newName)
	if err != nil {
		c.String(http.StatusInternalServerError, "Failed to rename file: %s", err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "File renamed successfully"})
}
