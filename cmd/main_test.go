package main_test

import (
	"os"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/kevinanielsen/go-fast-cdn/internal/database"
	ini "github.com/kevinanielsen/go-fast-cdn/internal/initializers"
	"github.com/kevinanielsen/go-fast-cdn/internal/util"
)

func setup() {
	util.LoadExPath()
	gin.SetMode(gin.TestMode)
	ini.LoadEnvVariables(true)
	ini.CreateFolders()
	database.ConnectToDB()
}

func TestMain(m *testing.M) {
	setup()
	code := m.Run()
	os.Exit(code)
}
