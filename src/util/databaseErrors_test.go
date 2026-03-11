package util

import (
	"errors"
	"testing"

	"github.com/stretchr/testify/require"
	"gorm.io/gorm"
)

func TestIsDuplicateError(t *testing.T) {
	t.Run("gorm duplicated key", func(t *testing.T) {
		require.True(t, IsDuplicateError(gorm.ErrDuplicatedKey))
	})

	t.Run("sqlite unique constraint", func(t *testing.T) {
		require.True(t, IsDuplicateError(errors.New("UNIQUE constraint failed: docs.checksum")))
	})

	t.Run("non duplicate error", func(t *testing.T) {
		require.False(t, IsDuplicateError(errors.New("network timeout")))
	})
}
