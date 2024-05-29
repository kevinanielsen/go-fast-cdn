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

func TestHandleImageUpload_NoError(t *testing.T) {
	// create tmpFile
	pipeRead, pipeWriter := io.Pipe()
	writer := multipart.NewWriter(pipeWriter)
	go func() {
		defer writer.Close()
		part, _ := writer.CreateFormFile("image", "image.img")
		img, _ := createDummyImage(200, 200)
		_ = EncodeImage(part, img)
	}()

	// init request
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	c.Request = httptest.NewRequest(http.MethodPost, "/api/cdn/upload/image", pipeRead)
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
	HandleImageUpload(c)

	// assert
	require.Equal(t, http.StatusOK, w.Result().StatusCode)
}

func TestHandleImageUpload_ReadFailed_NoFile(t *testing.T) {
	// create tmpFile
	pipeRead, pipeWriter := io.Pipe()
	writer := multipart.NewWriter(pipeWriter)
	go func() {
		defer writer.Close()
		part, _ := writer.CreateFormFile("png", "img.img")
		img, _ := createDummyImage(200, 200)
		_ = EncodeImage(part, img)
	}()

	// init request
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	c.Request = httptest.NewRequest(http.MethodPost, "/api/cdn/upload/image", pipeRead)
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
	HandleImageUpload(c)

	// assert
	require.Equal(t, http.StatusBadRequest, w.Result().StatusCode)
	require.Equal(t, w.Body.String(), "Failed to read file: http: no such file")
}

func TestHandleImageUpload_ReadFailed_EOF(t *testing.T) {
	// create tmpFile
	pipeRead, pipeWriter := io.Pipe()
	writer := multipart.NewWriter(pipeWriter)
	go func() {
		defer writer.Close()
		part, _ := writer.CreateFormFile("image", "image.img")
		part.Write([]byte(""))
	}()

	// init request
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	c.Request = httptest.NewRequest(http.MethodPost, "/api/cdn/upload/image", pipeRead)
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
	HandleImageUpload(c)

	// assert
	fmt.Println(w.Body.String())
	require.Equal(t, http.StatusInternalServerError, w.Result().StatusCode)
	require.Equal(t, w.Body.String(), "Failed to read file: EOF")
}

func TestHandleImageUpload_InvalidType(t *testing.T) {
	// create tmpFile
	pipeRead, pipeWriter := io.Pipe()
	writer := multipart.NewWriter(pipeWriter)
	go func() {
		defer writer.Close()
		part, _ := writer.CreateFormFile("image", "img.docx")
		part.Write([]byte("dsf"))
	}()

	// init request
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	c.Request = httptest.NewRequest(http.MethodPost, "/api/cdn/upload/image", pipeRead)
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
	HandleImageUpload(c)

	// assert
	require.Equal(t, http.StatusBadRequest, w.Result().StatusCode)
	require.Equal(t, w.Body.String(), "Invalid file type")
}

func TestHandleImageUpload_InvalidFilename(t *testing.T) {
	// create tmpFile
	pipeRead, pipeWriter := io.Pipe()
	writer := multipart.NewWriter(pipeWriter)
	go func() {
		defer writer.Close()
		part, _ := writer.CreateFormFile("image", "img.image.img")
		img, _ := createDummyImage(200, 200)
		_ = EncodeImage(part, img)
	}()

	// init request
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	c.Request = httptest.NewRequest(http.MethodPost, "/api/cdn/upload/image", pipeRead)
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
	HandleImageUpload(c)

	// assert
	require.Equal(t, http.StatusBadRequest, w.Result().StatusCode)
	require.Equal(t, w.Body.String(), "filename cannot contain more than one period character")
}

func TestHandleImageUpload_FileExist(t *testing.T) {
	// create tmpFile
	pipeRead, pipeWriter := io.Pipe()
	writer := multipart.NewWriter(pipeWriter)
	go func() {
		defer writer.Close()
		part, _ := writer.CreateFormFile("image", "image.img")
		img, _ := createDummyImage(200, 200)
		_ = EncodeImage(part, img)
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

	c.Request = httptest.NewRequest(http.MethodPost, "/api/cdn/upload/image", pipeRead)
	c.Request.Header.Add("Content-Type", writer.FormDataContentType())

	// first handling
	HandleImageUpload(c)

	// first statement
	require.Equal(t, http.StatusOK, w.Result().StatusCode)

	// init request
	ww := httptest.NewRecorder()
	cc, _ := gin.CreateTestContext(ww)
	go func() {
		defer writer.Close()
		part, _ := writer.CreateFormFile("image", "image.img")
		img, _ := createDummyImage(200, 200)
		_ = EncodeImage(part, img)
	}()
	cc.Request = httptest.NewRequest(http.MethodPost, "/api/cdn/upload/image", pipeRead)
	cc.Request.Header.Add("Content-Type", writer.FormDataContentType())

	// second handling
	HandleImageUpload(cc)

	//// first statement
	require.Equal(t, http.StatusConflict, ww.Result().StatusCode)
	require.Equal(t, ww.Body.String(), "\"File already exists\"")
}
