package validations

import "errors"

func ValidateRenameInput(oldName, newName string) error {
	if oldName == "" || newName == "" {
		return errors.New("'oldName' and 'newName' are required")
	}

	if oldName == newName {
		return errors.New("New name must be different from the old name")
	}

	return nil
}
