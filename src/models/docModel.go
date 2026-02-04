package models

import (
	"gorm.io/gorm"
)

type Doc struct {
	gorm.Model

	FileName string `json:"file_name"`
	Checksum []byte `json:"checksum" gorm:"uniqueIndex"`
	FileSize int64  `json:"file_size"`
	MimeType string `json:"mime_type"`
}

type DocRepository interface {
	GetAllDocs() []Doc
	GetDocByCheckSum(checksum []byte) Doc
	GetDocByFileName(fileName string) (Doc, error)
	AddDoc(doc Doc) (string, error)
	DeleteDoc(fileName string) (string, bool)
	RenameDoc(oldFileName, newFileName string) error
}
