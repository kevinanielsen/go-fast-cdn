package handlers

import (
	"net/http"
	"os"
	"path/filepath"
	"sort"

	"github.com/gin-gonic/gin"
	"github.com/kevinanielsen/go-fast-cdn/src/database"
	"github.com/kevinanielsen/go-fast-cdn/src/models"
	"github.com/kevinanielsen/go-fast-cdn/src/util"
)

type DashboardHandler struct {
	DocRepo    models.DocRepository
	ImageRepo  models.ImageRepository
	UserRepo   models.UserRepository
	ConfigRepo *database.ConfigRepo
}

func NewDashboardHandler(docRepo models.DocRepository, imageRepo models.ImageRepository, userRepo models.UserRepository, configRepo *database.ConfigRepo) *DashboardHandler {
	return &DashboardHandler{
		DocRepo:    docRepo,
		ImageRepo:  imageRepo,
		UserRepo:   userRepo,
		ConfigRepo: configRepo,
	}
}

func (h *DashboardHandler) GetDashboard(c *gin.Context) {
	var cdnSize int64
	_ = filepath.Walk(util.ExPath+"/uploads",
		func(path string, info os.FileInfo, err error) error {
			if err != nil {
				return err
			}
			cdnSize += info.Size()
			return nil
		})

	docs := h.DocRepo.GetAllDocs()
	images := h.ImageRepo.GetAllImages()

	sort.Slice(docs, func(i, j int) bool {
		return docs[i].CreatedAt.After(docs[j].CreatedAt)
	})
	sort.Slice(images, func(i, j int) bool {
		return images[i].CreatedAt.After(images[j].CreatedAt)
	})
	recentUploads := []gin.H{}
	for _, d := range docs[:min(5, len(docs))] {
		recentUploads = append(recentUploads, gin.H{"filename": d.FileName, "type": "doc", "uploaded_at": d.CreatedAt})
	}
	for _, img := range images[:min(5, len(images))] {
		recentUploads = append(recentUploads, gin.H{"filename": img.FileName, "type": "image", "uploaded_at": img.CreatedAt})
	}

	users, _ := h.UserRepo.GetAllUsers()
	totalUsers := len(users)
	admins := 0
	verified := 0
	usersWith2FA := 0

	for _, user := range users {
		if user.Role == "admin" {
			admins++
		}
		if user.IsVerified {
			verified++
		}
		if user.Is2FAEnabled != nil && *user.Is2FAEnabled {
			usersWith2FA++
		}
	}

	sort.Slice(users, func(i, j int) bool { return users[i].CreatedAt.After(users[j].CreatedAt) })
	recentRegs := []gin.H{}
	for _, u := range users[:min(5, len(users))] {
		recentRegs = append(recentRegs, gin.H{"email": u.Email, "role": u.Role, "created_at": u.CreatedAt})
	}

	regEnabled, _ := h.ConfigRepo.Get("registration_enabled")

	c.JSON(http.StatusOK, gin.H{
		"files": gin.H{
			"total_size_bytes": cdnSize,
			"documents_count":  len(docs),
			"images_count":     len(images),
			"recent_uploads":   recentUploads,
		},
		"users": gin.H{
			"total":                totalUsers,
			"admins":               admins,
			"verified":             verified,
			"recent_registrations": recentRegs,
		},
		"config": gin.H{
			"registration_enabled": regEnabled == "true",
		},
		"security": gin.H{
			"users_with_2fa": usersWith2FA,
		},
	})
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
