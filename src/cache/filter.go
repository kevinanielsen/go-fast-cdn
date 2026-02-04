package cache

type ChecksumFilter interface {
	PossiblyExists(checksum []byte) (bool, error)
	Add(checksum []byte) error
	Close() error
}
