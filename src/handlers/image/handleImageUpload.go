package handlers

import (
	"crypto/md5"
	"image"
	"log"
	"net/http"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"github.com/kevinanielsen/go-fast-cdn/src/models"
	"github.com/kevinanielsen/go-fast-cdn/src/util"
	_ "golang.org/x/image/webp"
)

func (h *ImageHandler) HandleImageUpload(c *gin.Context) {
	newName := c.PostForm("filename")

	fileHeader, err := c.FormFile("image")
	if err != nil {
		c.String(http.StatusBadRequest, "Failed to read file: %s", err.Error())
		return
	}

	file, err := fileHeader.Open()
	if err != nil {
		c.String(http.StatusBadRequest, "Failed to open file: %s", err.Error())
		return
	}

	defer file.Close()

	fileBuffer := make([]byte, 512)

	_, err = file.Read(fileBuffer)
	if err != nil {
		c.String(http.StatusInternalServerError, "Failed to read file: %s", err.Error())
		return
	}

	fileType := http.DetectContentType(fileBuffer)

	allowedMimeTypes := map[string]bool{
		"image/jpeg": true,
		"image/jpg":  true,
		"image/png":  true,
		"image/gif":  true,
		"image/webp": true,
		"image/bmp":  true,
	}

	if !allowedMimeTypes[fileType] {
		c.String(http.StatusBadRequest, "Invalid file type")
		return
	}

	fileHashBuffer := md5.Sum(fileBuffer)

	var filename string

	if newName == "" {
		filename = fileHeader.Filename
	} else {
		filename = newName + filepath.Ext(fileHeader.Filename)
	}

	filteredFilename, err := util.FilterFilename(filename)
	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	if _, err := file.Seek(0, 0); err != nil {
		c.String(http.StatusInternalServerError, "Failed to read file: %s", err.Error())
		return
	}
	img, _, err := image.Decode(file)
	var width, height int
	if err == nil {
		width = img.Bounds().Dx()
		height = img.Bounds().Dy()
	}

	imageModel := models.Image{
		FileName: filteredFilename,
		Checksum: fileHashBuffer[:],
		FileSize: fileHeader.Size,
		Width:    width,
		Height:   height,
		MimeType: fileType,
	}

	possiblyExists, err := h.filter.PossiblyExists(fileHashBuffer[:])
	if err != nil {
		log.Printf("cache pre-check failed for %s: %v; falling back to DB check", filteredFilename, err)
		possiblyExists = true
	}
	if possiblyExists {
		imageInDatabase := h.repo.GetImageByCheckSum(fileHashBuffer[:])
		if len(imageInDatabase.Checksum) > 0 {
			c.JSON(http.StatusConflict, gin.H{
				"error": "File already exists",
			})
			return
		}
	}

	savedFilename, err := h.repo.AddImage(imageModel)
	if err != nil {
		if util.IsDuplicateError(err) {
			c.JSON(http.StatusConflict, gin.H{"error": "File already exists"})
			return
		}
		c.JSON(http.StatusInternalServerError, err.Error())
		return
	}

	if err := h.filter.Add(fileHashBuffer[:]); err != nil {
		log.Printf("cache add failed for %s: %v", filteredFilename, err)
	}

	err = c.SaveUploadedFile(fileHeader, util.ExPath+"/uploads/images/"+savedFilename)
	if err != nil {
		c.String(http.StatusInternalServerError, "Failed to save file: %s", err.Error())
		return
	}

	body := gin.H{
		"file_url": c.Request.Host + "/api/cdn/download/images/" + savedFilename,
	}

	c.JSON(http.StatusOK, body)
}
