package initializers

import (
	"log"
	"os"

	"github.com/kevinanielsen/go-fast-cdn/src/cache"
)

// InitCache initializes a ChecksumFilter based on environment configuration.
// If REDIS_URL is set, it creates a Redis-backed bloom filter.
// Otherwise, it returns a disabled filter that always falls back to DB.
func InitCache() cache.ChecksumFilter {
	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		log.Println("REDIS_URL not set, using disabled cache filter (DB-only mode)")
		return cache.NewDisabledFilter()
	}

	filter, err := cache.NewRedisBloomFilter(redisURL, cache.BloomConfig{})
	if err != nil {
		log.Printf("Failed to connect to Redis at %s: %v. Falling back to disabled filter.", redisURL, err)
		return cache.NewDisabledFilter()
	}

	log.Printf("Connected to Redis bloom filter at %s", redisURL)
	return filter
}
