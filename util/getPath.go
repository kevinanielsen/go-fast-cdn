package util

import (
	"os"
	"path/filepath"
)

var ExPath string

func LoadExPath() {
	ex, err := os.Executable()
	if err != nil {
		panic(err)
	}
	exPath := filepath.Dir(ex)
	ExPath = exPath
}
