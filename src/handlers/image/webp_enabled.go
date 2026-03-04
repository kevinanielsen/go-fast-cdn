//go:build webp
// +build webp

package handlers

import (
	"image"
	"os"

	"github.com/chai2010/webp"
)

// encodeWebP encodes an image to WebP format when CGO is available
// Quality 80 provides optimal balance: better visual quality than JPEG 75,
// with ~25-35% smaller file sizes. Suitable for CDN use cases.
func encodeWebP(filePath string, img image.Image) error {
	outFile, err := os.Create(filePath)
	if err != nil {
		return err
	}
	defer outFile.Close()

	return webp.Encode(outFile, img, &webp.Options{Quality: 80})
}

// isWebPEncodingSupported returns true when WebP encoding is available
func isWebPEncodingSupported() bool {
	return true
}
