package handlers

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/kevinanielsen/go-fast-cdn/internal/util"
	"github.com/stretchr/testify/require"
)

func TestHandleDocMetadata_NoError(t *testing.T) {
	// Arrange
	testFileName := uuid.NewString()
	testFileDir := filepath.Join(util.ExPath, "uploads", "docs")
	defer os.RemoveAll(filepath.Join(util.ExPath, "uploads"))
	err := os.MkdirAll(testFileDir, 0o766)
	require.NoError(t, err)
	testFilePath := filepath.Join(testFileDir, testFileName)
	testFileContents := uuid.NewString()
	err = os.WriteFile(testFilePath, []byte(testFileContents), 0o666)
	require.NoError(t, err)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest(http.MethodGet, "/test", nil)
	c.Params = []gin.Param{{
		Key:   "filename",
		Value: testFileName,
	}}

	// Act
	HandleDocMetadata(c)

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
	require.Equal(t, float64(len(testFileContents)), result["file_size"])
}

func TestHandleDocMetadata_NotFound(t *testing.T) {
	// Arrange
	testFileName := uuid.NewString()
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest(http.MethodGet, "/test", nil)
	c.Params = []gin.Param{{
		Key:   "filename",
		Value: testFileName,
	}}

	// Act
	HandleDocMetadata(c)

	// Assert
	require.Equal(t, http.StatusNotFound, w.Result().StatusCode)
	result := map[string]interface{}{}
	err := json.NewDecoder(w.Body).Decode(&result)
	require.NoError(t, err)
	require.Contains(t, result, "error")
	require.Equal(t, result["error"], "Doc does not exist")
}

func TestHandleDocMetadata_NameNotProvided(t *testing.T) {
	// Arrange
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest(http.MethodGet, "/test", nil)

	// Act
	HandleDocMetadata(c)

	// Assert
	require.Equal(t, http.StatusBadRequest, w.Result().StatusCode)
	result := map[string]interface{}{}
	err := json.NewDecoder(w.Body).Decode(&result)
	require.NoError(t, err)
	require.Contains(t, result, "error")
	require.Equal(t, result["error"], "Doc name is required")
}
