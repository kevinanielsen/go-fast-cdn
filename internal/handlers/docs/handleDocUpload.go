package handlers

import (
	"crypto/md5"
	"net/http"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"github.com/kevinanielsen/go-fast-cdn/internal/database"
	"github.com/kevinanielsen/go-fast-cdn/internal/util"
)

func HandleDocUpload(c *gin.Context) {
	fileHeader, err := c.FormFile("doc")
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
		"text/plain":                true,
		"text/plain; charset=utf-8": true,
		"application/msword":        true,
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document":   true,
		"application/vnd.openxmlformats-officedocument.presentationml.presentation": true,
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":         true,
		"application/pdf":       true,
		"application/rtf":       true,
		"application/x-freearc": true,
	}

	if !allowedMimeTypes[fileType] {
		c.String(http.StatusBadRequest, "Invalid file type: %s", fileType)
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

	savedFileName, alreadyExists := database.AddDoc(filename, fileHashBuffer[:])

	if !alreadyExists {
		err = c.SaveUploadedFile(fileHeader, util.ExPath+"/uploads/docs/"+filteredFilename)
		if err != nil {
			c.String(http.StatusInternalServerError, "Failed to save file: %s", err.Error())
			return
		}
	}

	body := gin.H{
		"file_url": c.Request.Host + "/download/docs/" + savedFileName,
	}

	c.JSON(http.StatusOK, body)
}
