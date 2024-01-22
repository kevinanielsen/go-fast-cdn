// Package util contains utility functions used throughout the application.
package util

import (
	"errors"
	"strings"
)

// countVal counts the number of occurrences of val in str.
// It splits str into a slice of strings, iterates over the slice
// checking each string for equality with val, and increments a counter
// each time a match is found. The final count is returned.
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

// FilterFilename removes illegal characters from a filename string.
// It ensures there is at most one period in the filename,
// replaces any '/' and '\' characters,
// and returns the filtered string.
func FilterFilename(filename string) (string, error) {
	if countVal(filename, ".") > 1 {
		return filename, errors.New("filename cannot contain more than one period character")
	}

	var filteredStr string

	filteredStr = strings.Replace(filename, "/", "", -1)
	filteredStr = strings.Replace(filteredStr, `\`, "", -1)

	return filteredStr, nil
}
