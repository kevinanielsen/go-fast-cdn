package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/kevinanielsen/go-fast-cdn/src/database"
)

type ConfigHandler struct {
	configRepo *database.ConfigRepo
}

func NewConfigHandler(configRepo *database.ConfigRepo) *ConfigHandler {
	return &ConfigHandler{configRepo: configRepo}
}

// GetRegistrationEnabled returns whether registration is enabled
func (h *ConfigHandler) GetRegistrationEnabled(c *gin.Context) {
	val, err := h.configRepo.Get("registration_enabled")
	if err != nil || val == "" {
		c.JSON(http.StatusOK, gin.H{"enabled": true}) // default: enabled
		return
	}
	c.JSON(http.StatusOK, gin.H{"enabled": val == "true"})
}

// SetRegistrationEnabled sets registration enabled/disabled
func (h *ConfigHandler) SetRegistrationEnabled(c *gin.Context) {
	type req struct {
		Enabled bool `json:"enabled"`
	}
	var body req
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}
	val := "false"
	if body.Enabled {
		val = "true"
	}
	if err := h.configRepo.Set("registration_enabled", val); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update config"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"enabled": body.Enabled})
}
