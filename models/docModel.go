package models

import "gorm.io/gorm"

type Doc struct {
	gorm.Model

	FileName string `json:"file_name"`
	Checksum []byte `json:"checksum"`
}
