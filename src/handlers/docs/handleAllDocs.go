package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func (h *DocHandler) HandleAllDocs(c *gin.Context) {
	entries := h.repo.GetAllDocs()

	c.JSON(http.StatusOK, entries)
}
