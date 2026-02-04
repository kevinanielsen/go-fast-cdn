package models

import "gorm.io/gorm"

type Image struct {
	gorm.Model

	FileName string `json:"file_name"`
	Checksum []byte `json:"checksum" gorm:"uniqueIndex"`
	// Cached metadata fields to avoid repeated filesystem I/O
	FileSize int64  `json:"file_size"`
	Width    int    `json:"width"`
	Height   int    `json:"height"`
	MimeType string `json:"mime_type"`
}

type ImageRepository interface {
	GetAllImages() []Image
	GetImageByCheckSum(checksum []byte) Image
	GetImageByFileName(fileName string) (Image, error)
	AddImage(image Image) (string, error)
	DeleteImage(fileName string) (string, bool)
	RenameImage(oldFileName, newFileName string) error
}
