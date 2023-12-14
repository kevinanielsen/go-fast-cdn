package models

import "gorm.io/gorm"

type Doc struct {
	gorm.Model

	FileName string `json:"file_name" gorm:"unique"`
	Checksum []byte `json:"checksum"`
}
