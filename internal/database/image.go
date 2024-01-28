package database

import "github.com/kevinanielsen/go-fast-cdn/internal/models"

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

func RenameImage(oldFileName, newFileName string) error {
	image := models.Image{}
	return DB.Model(&image).Where("file_name = ?", oldFileName).Update("file_name", newFileName).Error
}
