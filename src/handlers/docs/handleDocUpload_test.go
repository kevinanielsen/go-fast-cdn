package handlers

import (
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/kevinanielsen/go-fast-cdn/src/database"
	"github.com/kevinanielsen/go-fast-cdn/src/util"
	"github.com/stretchr/testify/require"
)

var testDataFile []byte = []byte(`Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.`)

func TestHandleDocUpload_NoError(t *testing.T) {
	// create tmpFile
	pipeRead, pipeWriter := io.Pipe()
	writer := multipart.NewWriter(pipeWriter)
	go func() {
		defer writer.Close()
		part, _ := writer.CreateFormFile("doc", "filename.txt")
		part.Write(testDataFile)
	}()

	// init request
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	c.Request = httptest.NewRequest(http.MethodPost, "/api/cdn/upload/doc", pipeRead)
	c.Request.Header.Add("Content-Type", writer.FormDataContentType())

	// init database
	util.ExPath = os.TempDir()
	database.ConnectToDB()
	defer func() {
		filePath := fmt.Sprintf("%s/%s/%s", util.ExPath, database.DbFolder, database.DbName)
		err := os.Remove(filePath)
		if err != nil {
			t.Error(err)
		}
	}()

	// handling
	docHandler := NewDocHandler(database.NewDocRepo(database.DB))
	docHandler.HandleDocUpload(c)

	// assert
	require.Equal(t, http.StatusOK, w.Result().StatusCode)
}

func TestHandleDocUpload_ReadFailed_NoFile(t *testing.T) {
	// create tmpFile
	pipeRead, pipeWriter := io.Pipe()
	writer := multipart.NewWriter(pipeWriter)
	go func() {
		defer writer.Close()
		part, _ := writer.CreateFormFile("docx", "filename.txt")
		part.Write(testDataFile)
	}()

	// init request
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	c.Request = httptest.NewRequest(http.MethodPost, "/api/cdn/upload/doc", pipeRead)
	c.Request.Header.Add("Content-Type", writer.FormDataContentType())

	// init database
	util.ExPath = os.TempDir()
	database.ConnectToDB()
	defer func() {
		filePath := fmt.Sprintf("%s/%s/%s", util.ExPath, database.DbFolder, database.DbName)
		err := os.Remove(filePath)
		if err != nil {
			t.Error(err)
		}
	}()

	// handling
	docHandler := NewDocHandler(database.NewDocRepo(database.DB))
	docHandler.HandleDocUpload(c)

	// assert
	require.Equal(t, http.StatusBadRequest, w.Result().StatusCode)
	require.Equal(t, w.Body.String(), "Failed to read file: http: no such file")
}

func TestHandleDocUpload_ReadFailed_EOF(t *testing.T) {
	// create tmpFile
	pipeRead, pipeWriter := io.Pipe()
	writer := multipart.NewWriter(pipeWriter)
	go func() {
		defer writer.Close()
		part, _ := writer.CreateFormFile("doc", "filename.txt")
		part.Write([]byte(""))
	}()

	// init request
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	c.Request = httptest.NewRequest(http.MethodPost, "/api/cdn/upload/doc", pipeRead)
	c.Request.Header.Add("Content-Type", writer.FormDataContentType())

	// init database
	util.ExPath = os.TempDir()
	database.ConnectToDB()
	defer func() {
		filePath := fmt.Sprintf("%s/%s/%s", util.ExPath, database.DbFolder, database.DbName)
		err := os.Remove(filePath)
		if err != nil {
			t.Error(err)
		}
	}()

	// handling
	docHandler := NewDocHandler(database.NewDocRepo(database.DB))
	docHandler.HandleDocUpload(c)

	// assert
	require.Equal(t, http.StatusInternalServerError, w.Result().StatusCode)
	require.Equal(t, w.Body.String(), "Failed to read file: EOF")
}

func TestHandleDocUpload_InvalidType(t *testing.T) {
	// create tmpFile
	pipeRead, pipeWriter := io.Pipe()
	writer := multipart.NewWriter(pipeWriter)
	go func() {
		defer writer.Close()
		part, _ := writer.CreateFormFile("doc", "filename.txt")
		part.Write([]byte("testDataFile"))
	}()

	// init request
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	c.Request = httptest.NewRequest(http.MethodPost, "/api/cdn/upload/doc", pipeRead)
	c.Request.Header.Add("Content-Type", writer.FormDataContentType())

	// init database
	util.ExPath = os.TempDir()
	database.ConnectToDB()
	defer func() {
		filePath := fmt.Sprintf("%s/%s/%s", util.ExPath, database.DbFolder, database.DbName)
		err := os.Remove(filePath)
		if err != nil {
			t.Error(err)
		}
	}()

	// handling
	docHandler := NewDocHandler(database.NewDocRepo(database.DB))
	docHandler.HandleDocUpload(c)

	// assert
	require.Equal(t, http.StatusBadRequest, w.Result().StatusCode)
	require.Equal(t, w.Body.String(), "Invalid file type: application/octet-stream")
}

func TestHandleDocUpload_InvalidFilename(t *testing.T) {
	// create tmpFile
	pipeRead, pipeWriter := io.Pipe()
	writer := multipart.NewWriter(pipeWriter)
	go func() {
		defer writer.Close()
		part, _ := writer.CreateFormFile("doc", "file.name.txt")
		part.Write(testDataFile)
	}()

	// init request
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	c.Request = httptest.NewRequest(http.MethodPost, "/api/cdn/upload/doc", pipeRead)
	c.Request.Header.Add("Content-Type", writer.FormDataContentType())

	// init database
	util.ExPath = os.TempDir()
	database.ConnectToDB()
	defer func() {
		filePath := fmt.Sprintf("%s/%s/%s", util.ExPath, database.DbFolder, database.DbName)
		err := os.Remove(filePath)
		if err != nil {
			t.Error(err)
		}
	}()

	// handling
	docHandler := NewDocHandler(database.NewDocRepo(database.DB))
	docHandler.HandleDocUpload(c)

	// assert
	require.Equal(t, http.StatusBadRequest, w.Result().StatusCode)
	require.Equal(t, w.Body.String(), "filename cannot contain more than one period character")
}

func TestHandleDocUpload_FileExist(t *testing.T) {
	// create tmpFile
	pipeRead, pipeWriter := io.Pipe()
	writer := multipart.NewWriter(pipeWriter)
	go func() {
		defer writer.Close()
		part, _ := writer.CreateFormFile("doc", "filename.txt")
		part.Write(testDataFile)
	}()

	// init database
	util.ExPath = os.TempDir()
	database.ConnectToDB()
	defer func() {
		filePath := fmt.Sprintf("%s/%s/%s", util.ExPath, database.DbFolder, database.DbName)
		err := os.Remove(filePath)
		if err != nil {
			t.Error(err)
		}
	}()

	// init request
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	c.Request = httptest.NewRequest(http.MethodPost, "/api/cdn/upload/doc", pipeRead)
	c.Request.Header.Add("Content-Type", writer.FormDataContentType())

	// first handling
	docHandler := NewDocHandler(database.NewDocRepo(database.DB))
	docHandler.HandleDocUpload(c)

	// first statement
	require.Equal(t, http.StatusOK, w.Result().StatusCode)

	// init request
	ww := httptest.NewRecorder()
	cc, _ := gin.CreateTestContext(ww)
	go func() {
		defer writer.Close()
		part, _ := writer.CreateFormFile("doc", "filename.txt")
		part.Write(testDataFile)
	}()
	cc.Request = httptest.NewRequest(http.MethodPost, "/api/cdn/upload/doc", pipeRead)
	cc.Request.Header.Add("Content-Type", writer.FormDataContentType())

	// second handling
	docHandler.HandleDocUpload(cc)

	// second statement
	require.Equal(t, http.StatusConflict, ww.Result().StatusCode)
	require.Equal(t, ww.Body.String(),
		`{"error":"File already exists"}`,
	)
}
