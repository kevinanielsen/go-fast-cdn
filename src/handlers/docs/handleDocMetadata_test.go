package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	"github.com/kevinanielsen/go-fast-cdn/src/models"
	"github.com/kevinanielsen/go-fast-cdn/src/util"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/stretchr/testify/require"
)

type mockDocRepo struct {
	docs map[string]models.Doc
}

func newMockDocRepo() *mockDocRepo {
	return &mockDocRepo{docs: make(map[string]models.Doc)}
}

func (m *mockDocRepo) GetAllDocs() []models.Doc {
	var result []models.Doc
	for _, doc := range m.docs {
		result = append(result, doc)
	}
	return result
}

func (m *mockDocRepo) GetDocByCheckSum(checksum []byte) models.Doc {
	for _, doc := range m.docs {
		if string(doc.Checksum) == string(checksum) {
			return doc
		}
	}
	return models.Doc{}
}

func (m *mockDocRepo) GetDocByFileName(fileName string) (models.Doc, error) {
	if doc, ok := m.docs[fileName]; ok {
		return doc, nil
	}
	return models.Doc{}, errors.New("not found")
}

func (m *mockDocRepo) AddDoc(doc models.Doc) (string, error) {
	m.docs[doc.FileName] = doc
	return doc.FileName, nil
}

func (m *mockDocRepo) DeleteDoc(fileName string) (string, bool) {
	if _, ok := m.docs[fileName]; ok {
		delete(m.docs, fileName)
		return fileName, true
	}
	return "", false
}

func (m *mockDocRepo) RenameDoc(oldFileName, newFileName string) error {
	if doc, ok := m.docs[oldFileName]; ok {
		delete(m.docs, oldFileName)
		doc.FileName = newFileName
		m.docs[newFileName] = doc
		return nil
	}
	return errors.New("not found")
}

func TestHandleDocMetadata_FromCache(t *testing.T) {
	testFileName := "cached_doc.pdf"
	mockRepo := newMockDocRepo()
	mockRepo.docs[testFileName] = models.Doc{
		FileName: testFileName,
		FileSize: 2048,
	}
	handler := NewDocHandler(mockRepo)

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest(http.MethodGet, "/test", nil)
	c.Params = []gin.Param{{Key: "filename", Value: testFileName}}

	handler.HandleDocMetadata(c)

	require.Equal(t, http.StatusOK, w.Result().StatusCode)
	result := map[string]interface{}{}
	err := json.NewDecoder(w.Body).Decode(&result)
	require.NoError(t, err)
	require.Equal(t, testFileName, result["filename"])
	require.Equal(t, float64(2048), result["file_size"])
}

func TestHandleDocMetadata_FallbackToFilesystem(t *testing.T) {
	testFileName := uuid.NewString()
	testFileDir := filepath.Join(util.ExPath, "uploads", "docs")
	defer os.RemoveAll(filepath.Join(util.ExPath, "uploads"))
	err := os.MkdirAll(testFileDir, 0o766)
	require.NoError(t, err)
	testFilePath := filepath.Join(testFileDir, testFileName)
	testFileContents := uuid.NewString()
	err = os.WriteFile(testFilePath, []byte(testFileContents), 0o666)
	require.NoError(t, err)

	mockRepo := newMockDocRepo()
	handler := NewDocHandler(mockRepo)

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest(http.MethodGet, "/test", nil)
	c.Params = []gin.Param{{Key: "filename", Value: testFileName}}

	handler.HandleDocMetadata(c)

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
	testFileName := uuid.NewString()
	mockRepo := newMockDocRepo()
	handler := NewDocHandler(mockRepo)

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest(http.MethodGet, "/test", nil)
	c.Params = []gin.Param{{Key: "filename", Value: testFileName}}

	handler.HandleDocMetadata(c)

	require.Equal(t, http.StatusNotFound, w.Result().StatusCode)
	result := map[string]interface{}{}
	err := json.NewDecoder(w.Body).Decode(&result)
	require.NoError(t, err)
	require.Contains(t, result, "error")
	require.Equal(t, result["error"], "Doc does not exist")
}

func TestHandleDocMetadata_NameNotProvided(t *testing.T) {
	mockRepo := newMockDocRepo()
	handler := NewDocHandler(mockRepo)

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest(http.MethodGet, "/test", nil)

	handler.HandleDocMetadata(c)

	require.Equal(t, http.StatusBadRequest, w.Result().StatusCode)
	result := map[string]interface{}{}
	err := json.NewDecoder(w.Body).Decode(&result)
	require.NoError(t, err)
	require.Contains(t, result, "error")
	require.Equal(t, result["error"], "Doc name is required")
}
