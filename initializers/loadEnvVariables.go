package initializers

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

// LoadEnvVariables loads environment variables from .env file or sets
// hardcoded values based on prod boolean. In prod it sets PORT and DB_SECRET
// to hardcoded values. In dev it loads .env file from current directory.
func LoadEnvVariables(prod bool) {
	if prod {
		os.Setenv("PORT", "8080")
		os.Setenv("DB_SECRET", "secret")
	} else {
		if err := godotenv.Load(); err != nil {
			log.Fatalf("failed to load environment variables: %s", err.Error())
		}
	}
}
