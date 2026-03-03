package handlers

import (
	"github.com/kevinanielsen/go-fast-cdn/src/cache"
	"github.com/kevinanielsen/go-fast-cdn/src/models"
)

type ImageHandler struct {
	repo   models.ImageRepository
	filter cache.ChecksumFilter
}

func NewImageHandler(repo models.ImageRepository) *ImageHandler {
	return &ImageHandler{repo: repo, filter: cache.NewDisabledFilter()}
}

func NewImageHandlerWithFilter(repo models.ImageRepository, filter cache.ChecksumFilter) *ImageHandler {
	return &ImageHandler{repo: repo, filter: filter}
}
