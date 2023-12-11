package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/go-fast-cdn/database"
	"github.com/go-fast-cdn/models"
)

func HandleAllDocs(c *gin.Context) {
	var entries []models.Doc
	database.DB.Find(&entries, &models.Doc{})

	c.JSON(http.StatusOK, entries)

}
