package handlers

import (
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"github.com/go-fast-cdn/util"
)

func GetSizeHandler(c *gin.Context) {
	var cdnSize int64 = 0

	err := filepath.Walk(util.ExPath,
		func(path string, info os.FileInfo, err error) error {
			if err != nil {
				return err
			}
			cdnSize += info.Size()
			return nil
		})
	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		log.Println(err)
	}

	c.JSON(200, gin.H{"cdn_size_bytes": cdnSize})
}
