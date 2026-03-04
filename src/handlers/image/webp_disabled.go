//go:build !webp
// +build !webp

package handlers

import (
	"fmt"
	"image"
)

// encodeWebP provides a fallback when WebP encoding is not available
func encodeWebP(filePath string, img image.Image) error {
	return fmt.Errorf("WebP encoding not supported in this build (CGO disabled)")
}

// isWebPEncodingSupported returns false when WebP encoding is not available
func isWebPEncodingSupported() bool {
	return false
}
