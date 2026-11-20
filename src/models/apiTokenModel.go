package models

import "time"

type APITokenScope string

const (
	ScopeUpload APITokenScope = "cdn:upload"
	ScopeRename APITokenScope = "cdn:rename"
	ScopeResize APITokenScope = "cdn:resize"
	ScopeDelete APITokenScope = "cdn:delete"
)

func (s APITokenScope) Valid() bool {
	switch s {
	case ScopeUpload, ScopeRename, ScopeResize, ScopeDelete:
		return true
	default:
		return false
	}
}

type APIToken struct {
	ID     uint   `json:"id" gorm:"primaryKey"`
	UserID uint   `json:"-" gorm:"not null;index"`
	Digest string `json:"-" gorm:"not null;uniqueIndex"`
	Name   string `json:"name" gorm:"not null"`
	// Retain the column name so the existing non-null column does not prevent inserts.
	Scopes     []APITokenScope `json:"scopes" gorm:"column:scope;serializer:json;not null"`
	CreatedAt  time.Time       `json:"created_at" gorm:"not null"`
	ExpiresAt  time.Time       `json:"expires_at" gorm:"not null"`
	LastUsedAt *time.Time      `json:"last_used_at"`
	RevokedAt  *time.Time      `json:"revoked_at"`
}
