package database

import (
	"github.com/kevinanielsen/go-fast-cdn/src/models"
)

func GetDocByCheckSum(checksum []byte) models.Doc {
	var entries models.Doc

	DB.Where("checksum = ?", checksum).First(&entries)

	return entries
}

func AddDoc(doc models.Doc) (string, error) {
	result := DB.Create(&doc)
	if result.Error != nil {
		return "", result.Error
	}

	return doc.FileName, result.Error
}

func DeleteDoc(fileName string) (string, bool) {
	var doc models.Doc

	result := DB.Where("file_name = ?", fileName).First(&doc)

	if result.Error == nil {
		DB.Delete(&doc)
		return fileName, true
	} else {
		return "", false
	}
}

func RenameDoc(oldFileName, newFileName string) error {
	doc := models.Doc{}
	return DB.Model(&doc).Where("file_name = ?", oldFileName).Update("file_name", newFileName).Error
}
