package handlers

import (
	"github.com/kevinanielsen/go-fast-cdn/src/models"
)

type DocHandler struct {
	repo models.DocRepository
}

func NewDocHandler(repo models.DocRepository) *DocHandler {
	return &DocHandler{repo}
}
