package handlers

import (
	"crypto/md5"
	"net/http"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"github.com/kevinanielsen/go-fast-cdn/src/database"
	"github.com/kevinanielsen/go-fast-cdn/src/util"
)

func HandleImageUpload(c *gin.Context) {
	fileHeader, err := c.FormFile("image")
	newName := c.PostForm("filename")

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

	savedFilename, alreadyExists := database.AddImage(filename, fileHashBuffer[:])

	filteredFilename, err := util.FilterFilename(filename)
	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	if !alreadyExists {
		err = c.SaveUploadedFile(fileHeader, util.ExPath+"/uploads/images/"+filteredFilename)
		if err != nil {
			c.String(http.StatusInternalServerError, "Failed to save file: %s", err.Error())
			return
		}
	}

	body := gin.H{
		"file_url": c.Request.Host + "/download/images/" + savedFilename,
	}

	c.JSON(http.StatusOK, body)
}
