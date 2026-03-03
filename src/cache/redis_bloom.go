package cache

import (
	"context"
	"encoding/binary"
	"time"

	"github.com/redis/go-redis/v9"
)

const (
	DefaultBitSize   = 64 * 1024 * 1024 // 64M bits = 8MB
	DefaultHashCount = 4
	checksumKey      = "go-fast-cdn:checksums"
)

type BloomConfig struct {
	BitSize   uint64
	HashCount int
}

type RedisBloomFilter struct {
	client    *redis.Client
	bitSize   uint64
	hashCount int
}

func NewRedisBloomFilter(redisURL string, config BloomConfig) (*RedisBloomFilter, error) {
	opts, err := redis.ParseURL(redisURL)
	if err != nil {
		return nil, err
	}

	client := redis.NewClient(opts)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		return nil, err
	}

	bitSize := config.BitSize
	if bitSize == 0 {
		bitSize = DefaultBitSize
	}

	hashCount := config.HashCount
	if hashCount == 0 {
		hashCount = DefaultHashCount
	}

	return &RedisBloomFilter{
		client:    client,
		bitSize:   bitSize,
		hashCount: hashCount,
	}, nil
}

func (f *RedisBloomFilter) indices(checksum []byte) []uint64 {
	h1 := binary.BigEndian.Uint64(checksum[0:8])
	h2 := binary.BigEndian.Uint64(checksum[8:16]) | 1

	indices := make([]uint64, f.hashCount)
	for i := 0; i < f.hashCount; i++ {
		indices[i] = (h1 + uint64(i)*h2) % f.bitSize
	}
	return indices
}

func (f *RedisBloomFilter) PossiblyExists(checksum []byte) (bool, error) {
	if len(checksum) < 16 {
		return false, nil
	}

	ctx := context.Background()
	indices := f.indices(checksum)

	pipe := f.client.Pipeline()
	cmds := make([]*redis.IntCmd, len(indices))
	for i, idx := range indices {
		cmds[i] = pipe.GetBit(ctx, checksumKey, int64(idx))
	}

	_, err := pipe.Exec(ctx)
	if err != nil {
		return false, err
	}

	for _, cmd := range cmds {
		if cmd.Val() == 0 {
			return false, nil
		}
	}

	return true, nil
}

func (f *RedisBloomFilter) Add(checksum []byte) error {
	if len(checksum) < 16 {
		return nil
	}

	ctx := context.Background()
	indices := f.indices(checksum)

	pipe := f.client.Pipeline()
	for _, idx := range indices {
		pipe.SetBit(ctx, checksumKey, int64(idx), 1)
	}

	_, err := pipe.Exec(ctx)
	return err
}

func (f *RedisBloomFilter) Close() error {
	return f.client.Close()
}
