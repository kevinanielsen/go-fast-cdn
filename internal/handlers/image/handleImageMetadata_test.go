package handlers

import (
	"encoding/json"
	"image"
	"image/color"
	"image/jpeg"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/kevinanielsen/go-fast-cdn/internal/util"
	"github.com/stretchr/testify/require"
)

func TestHandleImageMetadata_NoError(t *testing.T) {
	// Arrange
	testFileName := "test_image.jpg"
	testFileDir := filepath.Join(util.ExPath, "uploads", "images")
	defer os.RemoveAll(filepath.Join(util.ExPath, "uploads"))
	err := os.MkdirAll(testFileDir, 0o766)
	require.NoError(t, err)
	testFilePath := filepath.Join(testFileDir, testFileName)
	_, err = createTempImageFile(testFilePath, 512, 512)
	require.NoError(t, err)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest(http.MethodGet, "/test", nil)
	c.Params = []gin.Param{{
		Key:   "filename",
		Value: testFileName,
	}}

	// Act
	HandleImageMetadata(c)

	// Assert
	require.Equal(t, http.StatusOK, w.Result().StatusCode)
	result := map[string]interface{}{}
	err = json.NewDecoder(w.Body).Decode(&result)
	require.NoError(t, err)
	require.Contains(t, result, "filename")
	require.Equal(t, result["filename"], testFileName)
	require.Contains(t, result, "download_url")
	require.NotEmpty(t, result["download_url"])
	require.Contains(t, result, "file_size")
	require.Contains(t, result, "width")
	require.Contains(t, result, "height")
}

func TestHandleImageMetadata_NameNotProvided(t *testing.T) {
	// Arrange
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest(http.MethodGet, "/test", nil)

	// Act
	HandleImageMetadata(c)

	// Assert
	require.Equal(t, http.StatusBadRequest, w.Result().StatusCode)
	result := map[string]interface{}{}
	err := json.NewDecoder(w.Body).Decode(&result)
	require.NoError(t, err)
	require.Contains(t, result, "error")
	require.Equal(t, result["error"], "Image name is required")
}

func TestHandleImageMetadata_NotFound(t *testing.T) {
	// Arrange
	testFileName := "test_file.jpg"
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest(http.MethodGet, "/test", nil)
	c.Params = []gin.Param{{
		Key:   "filename",
		Value: testFileName,
	}}

	// Act
	HandleImageMetadata(c)

	// Assert
	require.Equal(t, http.StatusNotFound, w.Result().StatusCode)
	result := map[string]interface{}{}
	err := json.NewDecoder(w.Body).Decode(&result)
	require.NoError(t, err)
	require.Contains(t, result, "error")
	require.Equal(t, result["error"], "Image does not exist")
}

// Helper functions
func EncodeImage(w io.Writer, img image.Image) error {
	return jpeg.Encode(w, img, &jpeg.Options{Quality: jpeg.DefaultQuality})
}

func createDummyImage(width, height int) (image.Image, error) {
	// Create a simple black image
	img := image.NewRGBA(image.Rect(0, 0, width, height))
	for y := 0; y < height; y++ {
		for x := 0; x < width; x++ {
			img.Set(x, y, color.RGBA{0, 0, 0, 255})
		}
	}

	return img, nil
}

func createTempImageFile(name string, width, height int) (*os.File, error) {
	img, err := createDummyImage(width, height)
	if err != nil {
		return nil, err
	}

	tempFile, err := os.Create(name)
	if err != nil {
		return nil, err
	}
	defer tempFile.Close()

	err = EncodeImage(tempFile, img)
	if err != nil {
		return nil, err
	}

	return tempFile, nil
}
