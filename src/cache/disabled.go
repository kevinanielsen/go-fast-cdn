package cache

type DisabledFilter struct{}

func NewDisabledFilter() *DisabledFilter {
	return &DisabledFilter{}
}

func (f *DisabledFilter) PossiblyExists(checksum []byte) (bool, error) {
	return true, nil
}

func (f *DisabledFilter) Add(checksum []byte) error {
	return nil
}

func (f *DisabledFilter) Close() error {
	return nil
}
