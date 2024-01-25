package handlers

import (
	"net/http"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"github.com/kevinanielsen/go-fast-cdn/src/database"
	"github.com/kevinanielsen/go-fast-cdn/src/util"
	"github.com/kevinanielsen/go-fast-cdn/src/validations"
)

func HandleDocsRename(c *gin.Context) {
	oldName := c.PostForm("filename")
	newName := c.PostForm("newname")

	err := validations.ValidateRenameInput(oldName, newName)
	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	prefix := filepath.Join(util.ExPath, "uploads", "docs")

	err = os.Rename(
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
