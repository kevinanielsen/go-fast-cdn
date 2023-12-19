package database

import "github.com/go-fast-cdn/models"

func RenameImage(oldFileName, newFileName string) error {
	image := models.Image{}
	return DB.Model(&image).Where("file_name = ?", oldFileName).Update("file_name", newFileName).Error
}
