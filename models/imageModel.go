package models

import "gorm.io/gorm"

type Image struct {
	gorm.Model

	FileName string `json:"file_name"`
	Checksum []byte `json:"checksum"`
}
