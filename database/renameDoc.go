package database

import "github.com/go-fast-cdn/models"

func RenameDoc(oldFileName, newFileName string) error {
	doc := models.Doc{}
	return DB.Model(&doc).Where("file_name = ?", oldFileName).Update("file_name", newFileName).Error
}
