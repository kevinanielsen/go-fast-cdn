package handlers

import (
	"crypto/md5"
	"image"
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

	file.Seek(0, 0)
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

	possiblyExists, _ := h.filter.PossiblyExists(fileHashBuffer[:])
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
		c.JSON(http.StatusInternalServerError, err.Error())
		return
	}

	h.filter.Add(fileHashBuffer[:])

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
