package cache

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestDisabledFilter_PossiblyExists(t *testing.T) {
	filter := NewDisabledFilter()
	checksum := []byte{1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16}

	exists, err := filter.PossiblyExists(checksum)

	require.NoError(t, err)
	require.True(t, exists)
}

func TestDisabledFilter_Add(t *testing.T) {
	filter := NewDisabledFilter()
	checksum := []byte{1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16}

	err := filter.Add(checksum)

	require.NoError(t, err)
}

func TestDisabledFilter_Close(t *testing.T) {
	filter := NewDisabledFilter()

	err := filter.Close()

	require.NoError(t, err)
}
