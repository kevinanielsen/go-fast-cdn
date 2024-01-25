package util

import (
	"os"
	"path/filepath"
)

func RenameFile(oldName, newName, fileType string) error {
	prefix := filepath.Join(ExPath, "uploads", fileType)

	err := os.Rename(
		filepath.Join(prefix, oldName),
		filepath.Join(prefix, newName),
	)
	if err != nil {
		return err
	}

	return nil
}
