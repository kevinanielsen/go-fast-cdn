package handlers

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/kevinanielsen/go-fast-cdn/internal/database"
	"github.com/kevinanielsen/go-fast-cdn/internal/models"
)

func HandleDropDB(c *gin.Context) {
	validToken := os.Getenv("DB_SECRET")

	token := c.Query("token")
	if len(token) == 0 {
		c.String(http.StatusBadRequest, "No token provided")
		return
	}
	if token != validToken {
		c.String(http.StatusUnauthorized, "Invalid token: %s", token)
		return
	}

	database.DB.Migrator().DropTable(models.Doc{})
	database.DB.Migrator().DropTable(models.Image{})
	database.Migrate()
}
