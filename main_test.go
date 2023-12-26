package main_test

import (
	"os"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/kevinanielsen/go-fast-cdn/database"
	ini "github.com/kevinanielsen/go-fast-cdn/initializers"
	"github.com/kevinanielsen/go-fast-cdn/util"
)

func setup() {
	util.LoadExPath()
	gin.SetMode(gin.TestMode)
	ini.LoadEnvVariables(false)
	ini.CreateFolders()
	database.ConnectToDB()
}

func TestMain(m *testing.M) {
	setup()
	code := m.Run()
	os.Exit(code)
}
