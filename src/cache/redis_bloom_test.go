package cache

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestRedisBloomFilter_Indices(t *testing.T) {
	filter := &RedisBloomFilter{
		bitSize:   1000000,
		hashCount: 4,
	}
	checksum := []byte{1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16}

	indices := filter.indices(checksum)

	require.Len(t, indices, 4)
	for _, idx := range indices {
		require.Less(t, idx, uint64(1000000))
	}
}

func TestRedisBloomFilter_IndicesDeterministic(t *testing.T) {
	filter := &RedisBloomFilter{
		bitSize:   1000000,
		hashCount: 4,
	}
	checksum := []byte{1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16}

	indices1 := filter.indices(checksum)
	indices2 := filter.indices(checksum)

	require.Equal(t, indices1, indices2)
}

func TestRedisBloomFilter_IndicesDifferentChecksums(t *testing.T) {
	filter := &RedisBloomFilter{
		bitSize:   1000000,
		hashCount: 4,
	}
	checksum1 := []byte{1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16}
	checksum2 := []byte{16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1}

	indices1 := filter.indices(checksum1)
	indices2 := filter.indices(checksum2)

	require.NotEqual(t, indices1, indices2)
}
