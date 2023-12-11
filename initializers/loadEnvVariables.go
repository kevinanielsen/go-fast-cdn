package initializers

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

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
