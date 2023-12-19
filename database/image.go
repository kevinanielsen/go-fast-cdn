package database

import (
	"github.com/go-fast-cdn/models"
)

func AddImage(fileName string, fileHashBuffer []byte) (string, bool) {
	var image models.Image
	image.FileName = fileName
	image.Checksum = fileHashBuffer

	var entries []models.Image

	DB.First(&entries, "checksum = $1", string(fileHashBuffer))
	if len(entries) == 0 {
		DB.Create(&image)
		return fileName, false
	} else {
		return entries[0].FileName, true
	}
}

func DeleteImage(fileName string) (string, bool) {
	var image models.Image

	result := DB.Where("file_name = ?", fileName).First(&image)

	if result.Error == nil {
		DB.Delete(&image)
		return fileName, true
	} else {
		return "", false
	}
}
