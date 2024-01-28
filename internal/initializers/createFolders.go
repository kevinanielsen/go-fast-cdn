package initializers

import (
	"fmt"
	"os"

	"github.com/kevinanielsen/go-fast-cdn/internal/util"
)

func CreateFolders() {
	uploadsFolder := fmt.Sprintf("%v/uploads", util.ExPath)
	os.Mkdir(uploadsFolder, 0o755)
	os.Mkdir(fmt.Sprintf("%v/docs", uploadsFolder), 0o755)
	os.Mkdir(fmt.Sprintf("%v/images", uploadsFolder), 0o755)
}
