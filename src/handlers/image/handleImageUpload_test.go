package handlers

import (
	"io"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/kevinanielsen/go-fast-cdn/src/database"
	"github.com/kevinanielsen/go-fast-cdn/src/util"
	"github.com/stretchr/testify/require"
)

func setupIsolatedTestDatabase(t *testing.T) {
	t.Helper()
	previousPath, previousDB := util.ExPath, database.DB
	util.ExPath = t.TempDir()
	database.ConnectToDB()
	testDB := database.DB
	t.Cleanup(func() {
		sqlDB, err := testDB.DB()
		if err != nil {
			t.Error(err)
		} else if err := sqlDB.Close(); err != nil {
			t.Error(err)
		}
		database.DB = previousDB
		util.ExPath = previousPath
	})
}

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
	setupIsolatedTestDatabase(t)

	// handling
	imageHandler := NewImageHandler(database.NewImageRepo(database.DB))
	imageHandler.HandleImageUpload(c)

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
	setupIsolatedTestDatabase(t)

	// handling
	imageHandler := NewImageHandler(database.NewImageRepo(database.DB))
	imageHandler.HandleImageUpload(c)

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
	setupIsolatedTestDatabase(t)

	// handling
	imageHandler := NewImageHandler(database.NewImageRepo(database.DB))
	imageHandler.HandleImageUpload(c)

	// assert
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
	setupIsolatedTestDatabase(t)

	// handling
	imageHandler := NewImageHandler(database.NewImageRepo(database.DB))
	imageHandler.HandleImageUpload(c)

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
	setupIsolatedTestDatabase(t)

	// handling
	imageHandler := NewImageHandler(database.NewImageRepo(database.DB))
	imageHandler.HandleImageUpload(c)

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
	setupIsolatedTestDatabase(t)

	// init request
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	c.Request = httptest.NewRequest(http.MethodPost, "/api/cdn/upload/image", pipeRead)
	c.Request.Header.Add("Content-Type", writer.FormDataContentType())

	// first handling
	imageHandler := NewImageHandler(database.NewImageRepo(database.DB))
	imageHandler.HandleImageUpload(c)

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
	imageHandler.HandleImageUpload(cc)

	// second statement
	require.Equal(t, http.StatusConflict, ww.Result().StatusCode)
	require.Equal(t, ww.Body.String(), `{"error":"File already exists"}`)
}
