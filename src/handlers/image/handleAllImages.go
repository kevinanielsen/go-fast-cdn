package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func (h *ImageHandler) HandleAllImages(c *gin.Context) {

	entries := h.repo.GetAllImages()

	c.JSON(http.StatusOK, entries)
}
