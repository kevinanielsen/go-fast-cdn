package database

import (
	"github.com/kevinanielsen/go-fast-cdn/src/models"
	"gorm.io/gorm"
)

type DocRepo struct {
	DB *gorm.DB
}

func NewDocRepo(db *gorm.DB) models.DocRepository {
	return &DocRepo{DB: db}
}

func (repo *DocRepo) GetAllDocs() []models.Doc {
	var entries []models.Doc

	repo.DB.Find(&entries, &models.Doc{})

	return entries
}

func (repo *DocRepo) GetDocByCheckSum(checksum []byte) models.Doc {
	var entries models.Doc

	repo.DB.Where("checksum = ?", checksum).First(&entries)

	return entries
}

func (repo *DocRepo) AddDoc(doc models.Doc) (string, error) {
	result := repo.DB.Create(&doc)
	if result.Error != nil {
		return "", result.Error
	}

	return doc.FileName, result.Error
}

func (repo *DocRepo) DeleteDoc(fileName string) (string, bool) {
	var doc models.Doc

	result := repo.DB.Where("file_name = ?", fileName).First(&doc)

	if result.Error == nil {
		repo.DB.Delete(&doc)
		return fileName, true
	} else {
		return "", false
	}
}

func (repo *DocRepo) RenameDoc(oldFileName, newFileName string) error {
	doc := models.Doc{}
	return repo.DB.Model(&doc).Where("file_name = ?", oldFileName).Update("file_name", newFileName).Error
}
