package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/kevinanielsen/go-fast-cdn/internal/database"
	"github.com/kevinanielsen/go-fast-cdn/internal/models"
)

func HandleAllDocs(c *gin.Context) {
	var entries []models.Doc

	database.DB.Find(&entries, &models.Doc{})

	c.JSON(http.StatusOK, entries)
}
