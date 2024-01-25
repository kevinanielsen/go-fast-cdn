package util

import (
	"fmt"
	"os"
)

func DeleteFile(deletedFileName string, fileType string) error {
	filePath := fmt.Sprintf("%v/uploads/%v/%v", ExPath, fileType, deletedFileName)

	err := os.Remove(filePath)
	if err != nil {
		return err
	}

	return nil
}
