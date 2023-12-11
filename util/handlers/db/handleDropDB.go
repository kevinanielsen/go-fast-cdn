package handlers

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/go-fast-cdn/database"
	"github.com/go-fast-cdn/models"
)

func HandleDropDB(c *gin.Context) {
	validToken := os.Getenv("DB_SECRET")

	token := c.Query("token")
	if len(token) == 0 {
		c.String(http.StatusBadRequest, "No token provided")
		return
	}
	if token != validToken {
		c.String(http.StatusUnauthorized, "Invalid token: %s, needed: %s", token, validToken)
		return
	}

	database.DB.Migrator().DropTable(models.Doc{})
	database.DB.Migrator().DropTable(models.Image{})
}
