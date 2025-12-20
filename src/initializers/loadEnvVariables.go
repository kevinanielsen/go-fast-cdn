package initializers

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

// LoadEnvVariables loads environment variables
func LoadEnvVariables(prod bool) {
	var envFile string
	var envName string

	goEnv := os.Getenv("GO_ENV")
	if goEnv != "" {
		envName = goEnv
		envFile = ".env." + goEnv
		log.Printf("Using GO_ENV=%s, loading %s", goEnv, envFile)
	} else {
		if prod {
			envName = "production"
			envFile = ".env.production"
		} else {
			envName = "development"
			envFile = ".env.development"
		}
	}

	if err := godotenv.Load(envFile); err != nil {
		log.Printf("Warning: Failed to load %s: %s", envFile, err.Error())
		if err := godotenv.Load(); err != nil {
			log.Printf("Warning: Failed to load .env file: %s", err.Error())
			log.Println("Will use system environment variables only")
		} else {
			log.Println("Loaded default .env file")
		}
	} else {
		log.Printf("Loaded %s environment configuration from %s", envName, envFile)
	}

	validateRequiredEnvVars()

	printConfigSummary()
}

// validateRequiredEnvVars validates required environment variables
func validateRequiredEnvVars() {
	requiredEnvVars := []string{"PORT", "DB_SECRET"}
	missingVars := []string{}

	for _, envVar := range requiredEnvVars {
		if os.Getenv(envVar) == "" {
			missingVars = append(missingVars, envVar)
		}
	}

	if len(missingVars) > 0 {
		log.Printf("Warning: Missing required environment variables: %v", missingVars)
	}
}

// printConfigSummary prints configuration summary
func printConfigSummary() {
	log.Println("Configuration Summary:")
	log.Printf("   PORT: %s", getEnvOrDefault("PORT", "not set"))
	log.Printf("   DB_TYPE: %s", getEnvOrDefault("DB_TYPE", "sqlite"))

	if os.Getenv("DB_TYPE") == "mysql" {
		log.Printf("   DB_HOST: %s", getEnvOrDefault("DB_HOST", "not set"))
		log.Printf("   DB_PORT: %s", getEnvOrDefault("DB_PORT", "not set"))
		log.Printf("   DB_NAME: %s", getEnvOrDefault("DB_NAME", "not set"))
		log.Printf("   DB_USER: %s", getEnvOrDefault("DB_USER", "not set"))
		log.Printf("   DB_PASSWORD: %s", maskPassword(os.Getenv("DB_PASSWORD")))
	}

	log.Printf("   DB_SECRET: %s", maskPassword(os.Getenv("DB_SECRET")))
	log.Printf("   MAX_UPLOAD_SIZE: %s", getEnvOrDefault("MAX_UPLOAD_SIZE", "not set"))
}

// getEnvOrDefault 获取环境变量或返回默认值
func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// maskPassword 隐藏密码，只显示前后各2个字符
func maskPassword(password string) string {
	if password == "" {
		return "not set"
	}
	if len(password) <= 4 {
		return "****"
	}
	return password[:2] + "****" + password[len(password)-2:]
}
