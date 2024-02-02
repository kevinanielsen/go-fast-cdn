package database

import (
	"github.com/kevinanielsen/go-fast-cdn/src/models"
)

func GetImageByCheckSum(checksum []byte) models.Image {
	var entries models.Image

	DB.Where("checksum = ?", checksum).First(&entries)

	return entries
}

func AddImage(image models.Image) (string, error) {
	result := DB.Create(&image)
	if result.Error != nil {
		return "", result.Error
	}

	return image.FileName, nil
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

func RenameImage(oldFileName, newFileName string) error {
	image := models.Image{}
	return DB.Model(&image).Where("file_name = ?", oldFileName).Update("file_name", newFileName).Error
}
