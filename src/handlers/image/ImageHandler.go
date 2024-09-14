package handlers

import "github.com/kevinanielsen/go-fast-cdn/src/models"

type ImageHandler struct {
	repo models.ImageRepository
}

func NewImageHandler(repo models.ImageRepository) *ImageHandler {
	return &ImageHandler{repo}
}
