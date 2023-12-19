package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/go-fast-cdn/database"
	"github.com/go-fast-cdn/models"
)

func HandleAllImages(c *gin.Context) {
	var entries []models.Image
	database.DB.Find(&entries, &models.Image{})

	c.JSON(http.StatusOK, entries)

}
