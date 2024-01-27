package validations

import (
	"errors"
	"mime/multipart"
	"path/filepath"
)

func ValidateRenameInput(oldName, newName string) error {
	if oldName == "" || newName == "" {
		return errors.New("'oldName' and 'newName' are required")
	}

	if oldName == newName {
		return errors.New("New name must be different from the old name")
	}

	return nil
}

func DetermineFilename(fileHeader *multipart.FileHeader, newName *string) {
	if *newName == "" {
		*newName = fileHeader.Filename
	} else {
		*newName = *newName + filepath.Ext(fileHeader.Filename)
	}
}
