package util

import (
	"errors"
	"strings"
)

func countVal(str string, val string) int {
	var count int
	arr := strings.Split(str, "")
	for _, v := range arr {
		if v == val {
			count++
		}
	}

	return count
}

func FilterFilename(filename string) (string, error) {
	if countVal(filename, ".") > 1 {
		return filename, errors.New("filename cannot contain more than one period character")
	}

	var filteredStr string

	filteredStr = strings.Replace(filename, "/", "", -1)
	filteredStr = strings.Replace(filteredStr, `\`, "", -1)

	return filteredStr, nil
}
