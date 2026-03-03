package handlers

import (
	"encoding/json"
	"errors"
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
	"github.com/kevinanielsen/go-fast-cdn/src/models"
	"github.com/kevinanielsen/go-fast-cdn/src/util"
	"github.com/stretchr/testify/require"
)

type mockImageRepo struct {
	images map[string]models.Image
}

func newMockImageRepo() *mockImageRepo {
	return &mockImageRepo{images: make(map[string]models.Image)}
}

func (m *mockImageRepo) GetAllImages() []models.Image {
	var result []models.Image
	for _, img := range m.images {
		result = append(result, img)
	}
	return result
}

func (m *mockImageRepo) GetImageByCheckSum(checksum []byte) models.Image {
	for _, img := range m.images {
		if string(img.Checksum) == string(checksum) {
			return img
		}
	}
	return models.Image{}
}

func (m *mockImageRepo) GetImageByFileName(fileName string) (models.Image, error) {
	if img, ok := m.images[fileName]; ok {
		return img, nil
	}
	return models.Image{}, errors.New("not found")
}

func (m *mockImageRepo) AddImage(img models.Image) (string, error) {
	m.images[img.FileName] = img
	return img.FileName, nil
}

func (m *mockImageRepo) DeleteImage(fileName string) (string, bool) {
	if _, ok := m.images[fileName]; ok {
		delete(m.images, fileName)
		return fileName, true
	}
	return "", false
}

func (m *mockImageRepo) RenameImage(oldFileName, newFileName string) error {
	if img, ok := m.images[oldFileName]; ok {
		delete(m.images, oldFileName)
		img.FileName = newFileName
		m.images[newFileName] = img
		return nil
	}
	return errors.New("not found")
}

func TestHandleImageMetadata_FromCache(t *testing.T) {
	testFileName := "cached_image.jpg"
	mockRepo := newMockImageRepo()
	mockRepo.images[testFileName] = models.Image{
		FileName: testFileName,
		FileSize: 1024,
		Width:    800,
		Height:   600,
	}
	handler := NewImageHandler(mockRepo)

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest(http.MethodGet, "/test", nil)
	c.Params = []gin.Param{{Key: "filename", Value: testFileName}}

	handler.HandleImageMetadata(c)

	require.Equal(t, http.StatusOK, w.Result().StatusCode)
	result := map[string]interface{}{}
	err := json.NewDecoder(w.Body).Decode(&result)
	require.NoError(t, err)
	require.Equal(t, testFileName, result["filename"])
	require.Equal(t, float64(1024), result["file_size"])
	require.Equal(t, float64(800), result["width"])
	require.Equal(t, float64(600), result["height"])
}

func TestHandleImageMetadata_FallbackToFilesystem(t *testing.T) {
	testFileName := "test_image.jpg"
	testFileDir := filepath.Join(util.ExPath, "uploads", "images")
	defer os.RemoveAll(filepath.Join(util.ExPath, "uploads"))
	err := os.MkdirAll(testFileDir, 0o766)
	require.NoError(t, err)
	testFilePath := filepath.Join(testFileDir, testFileName)
	_, err = createTempImageFile(testFilePath, 512, 512)
	require.NoError(t, err)

	mockRepo := newMockImageRepo()
	handler := NewImageHandler(mockRepo)

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest(http.MethodGet, "/test", nil)
	c.Params = []gin.Param{{Key: "filename", Value: testFileName}}

	handler.HandleImageMetadata(c)

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
	mockRepo := newMockImageRepo()
	handler := NewImageHandler(mockRepo)

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest(http.MethodGet, "/test", nil)

	handler.HandleImageMetadata(c)

	require.Equal(t, http.StatusBadRequest, w.Result().StatusCode)
	result := map[string]interface{}{}
	err := json.NewDecoder(w.Body).Decode(&result)
	require.NoError(t, err)
	require.Contains(t, result, "error")
	require.Equal(t, result["error"], "Image name is required")
}

func TestHandleImageMetadata_NotFound(t *testing.T) {
	testFileName := "nonexistent.jpg"
	mockRepo := newMockImageRepo()
	handler := NewImageHandler(mockRepo)

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest(http.MethodGet, "/test", nil)
	c.Params = []gin.Param{{Key: "filename", Value: testFileName}}

	handler.HandleImageMetadata(c)

	require.Equal(t, http.StatusNotFound, w.Result().StatusCode)
	result := map[string]interface{}{}
	err := json.NewDecoder(w.Body).Decode(&result)
	require.NoError(t, err)
	require.Contains(t, result, "error")
	require.Equal(t, result["error"], "Image does not exist")
}

func EncodeImage(w io.Writer, img image.Image) error {
	return jpeg.Encode(w, img, &jpeg.Options{Quality: jpeg.DefaultQuality})
}

func createDummyImage(width, height int) (image.Image, error) {
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
