package util

import (
	"os"
	"path/filepath"
)

var ExPath string

// LoadExPath loads the executable path and stores it in the ExPath variable.
// It uses os.Executable to get the path of the current executable.
// The filepath.Dir function is used to get the directory containing the executable.
// If there is an error getting the executable path, it will panic.
func LoadExPath() {
	ex, err := os.Executable()
	if err != nil {
		panic(err)
	}
	exPath := filepath.Dir(ex)
	ExPath = exPath
}
