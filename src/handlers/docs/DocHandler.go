package handlers

import (
	"github.com/kevinanielsen/go-fast-cdn/src/cache"
	"github.com/kevinanielsen/go-fast-cdn/src/models"
)

type DocHandler struct {
	repo   models.DocRepository
	filter cache.ChecksumFilter
}

func NewDocHandler(repo models.DocRepository) *DocHandler {
	return &DocHandler{repo: repo, filter: cache.NewDisabledFilter()}
}

func NewDocHandlerWithFilter(repo models.DocRepository, filter cache.ChecksumFilter) *DocHandler {
	return &DocHandler{repo: repo, filter: filter}
}
