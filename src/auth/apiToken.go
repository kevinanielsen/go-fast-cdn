package auth

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"strings"
)

const apiTokenPrefix = "gfc_pat_"

func GenerateAPIToken() string {
	var secret [32]byte
	rand.Read(secret[:])
	return apiTokenPrefix + base64.RawURLEncoding.EncodeToString(secret[:])
}

func APITokenDigest(token string) (string, bool) {
	encoded, ok := strings.CutPrefix(token, apiTokenPrefix)
	if !ok || len(encoded) != base64.RawURLEncoding.EncodedLen(32) ||
		strings.ContainsAny(encoded, "\r\n") {
		return "", false
	}
	if _, err := base64.RawURLEncoding.Strict().DecodeString(encoded); err != nil {
		return "", false
	}
	// A uniformly random 256-bit secret does not need password stretching.
	digest := sha256.Sum256([]byte(token))
	return hex.EncodeToString(digest[:]), true
}
