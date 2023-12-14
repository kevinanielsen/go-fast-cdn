package models

import "gorm.io/gorm"

type Image struct {
	gorm.Model

	FileName string `json:"file_name" gorm:"unique"`
	Checksum []byte `json:"checksum"`
}
