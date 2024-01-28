package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/kevinanielsen/go-fast-cdn/internal/database"
	"github.com/kevinanielsen/go-fast-cdn/internal/util"
	"github.com/kevinanielsen/go-fast-cdn/internal/validations"
)

func HandleDocsRename(c *gin.Context) {
	oldName := c.PostForm("filename")
	newName := c.PostForm("newname")

	err := validations.ValidateRenameInput(oldName, newName)
	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	filteredNewName, err := util.FilterFilename(newName)
	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	err = util.RenameFile(oldName, filteredNewName, "docs")
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
