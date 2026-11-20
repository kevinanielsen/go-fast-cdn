package router

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"slices"
	"strings"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/glebarez/sqlite"
	"github.com/kevinanielsen/go-fast-cdn/src/auth"
	"github.com/kevinanielsen/go-fast-cdn/src/database"
	"github.com/kevinanielsen/go-fast-cdn/src/models"
	"github.com/pquerna/otp/totp"
	"gorm.io/gorm"
)

func TestAPITokenLifecycle(t *testing.T) {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatal(err)
	}
	sqlDB, err := db.DB()
	if err != nil {
		t.Fatal(err)
	}
	sqlDB.SetMaxOpenConns(1)
	t.Cleanup(func() { _ = sqlDB.Close() })
	previousDB := database.DB
	database.DB = db
	t.Cleanup(func() { database.DB = previousDB })
	if err := database.Migrate(); err != nil {
		t.Fatal(err)
	}
	if err := db.AutoMigrate(&models.Config{}); err != nil {
		t.Fatal(err)
	}
	t.Setenv("JWT_SECRET", "test-key-not-used-in-production")
	gin.SetMode(gin.TestMode)
	server := &Server{Engine: gin.New()}
	server.AddApiRoutes()

	const password = "test password for API token"
	newUser := func(email string, use2FA bool) (*models.User, string) {
		t.Helper()
		user := &models.User{Email: email, Role: "admin"}
		if use2FA {
			secret, _, err := auth.GenerateTOTPSecret(email)
			if err != nil {
				t.Fatal(err)
			}
			user.Is2FAEnabled, user.TwoFASecret = &use2FA, &secret
		}
		if err := user.HashPassword(password); err != nil {
			t.Fatal(err)
		}
		if err := db.Create(user).Error; err != nil {
			t.Fatal(err)
		}
		jwt, err := auth.NewJWTService().GenerateAccessToken(user, 15)
		if err != nil {
			t.Fatal(err)
		}
		return user, jwt
	}
	owner, ownerJWT := newUser("owner@example.test", true)
	_, otherJWT := newUser("other@example.test", false)

	request := func(method, path, bearer, body string, status int) *httptest.ResponseRecorder {
		t.Helper()
		req := httptest.NewRequest(method, path, strings.NewReader(body))
		if bearer != "" {
			req.Header.Set("Authorization", "Bearer "+bearer)
		}
		req.Header.Set("Content-Type", "application/json")
		res := httptest.NewRecorder()
		server.Engine.ServeHTTP(res, req)
		if res.Code != status {
			t.Fatalf("%s %s: got status %d, want %d", method, path, res.Code, status)
		}
		return res
	}

	const tokens = "/api/auth/profile/api-tokens"
	const upload = "/api/cdn/upload/doc"
	currentCode := func() string {
		t.Helper()
		code, err := totp.GenerateCode(*owner.TwoFASecret, time.Now())
		if err != nil {
			t.Fatal(err)
		}
		return code
	}
	scopeBody := func(scopes, currentPassword, code string, days int) string {
		return fmt.Sprintf(`{"name":"CI","scopes":%s,"expires_in_days":%d,"current_password":%q,"two_fa_token":%q}`, scopes, days, currentPassword, code)
	}
	tokenBody := func(currentPassword, code string, days int) string {
		return scopeBody(`["cdn:upload"]`, currentPassword, code, days)
	}
	type created struct {
		Token    string          `json:"token"`
		Metadata models.APIToken `json:"metadata"`
	}
	createToken := func() created {
		t.Helper()
		res := request(http.MethodPost, tokens, ownerJWT, tokenBody(password, currentCode(), 7), http.StatusCreated)
		var data created
		if err := json.Unmarshal(res.Body.Bytes(), &data); err != nil {
			t.Fatal(err)
		}
		if res.Header().Get("Cache-Control") != "no-store" || data.Token == "" ||
			data.Metadata.ExpiresAt.Sub(data.Metadata.CreatedAt) != 7*24*time.Hour {
			t.Fatal("creation must return a one-time, non-cacheable secret with the requested expiry")
		}
		return data
	}

	request(http.MethodPost, tokens, ownerJWT, tokenBody(password, "", 7), http.StatusForbidden)
	request(http.MethodPost, tokens, ownerJWT, tokenBody("wrong password", currentCode(), 7), http.StatusForbidden)
	request(http.MethodPost, tokens, ownerJWT, tokenBody(password, currentCode(), 91), http.StatusBadRequest)
	for _, invalidScopes := range []string{
		`[]`, `null`, `["cdn:upload","cdn:unknown"]`, `["cdn:upload","cdn:upload"]`,
	} {
		request(http.MethodPost, tokens, ownerJWT, scopeBody(invalidScopes, password, currentCode(), 7), http.StatusBadRequest)
	}

	selected := []models.APITokenScope{models.ScopeUpload, models.ScopeRename}
	multiResponse := request(http.MethodPost, tokens, ownerJWT,
		scopeBody(`["cdn:upload","cdn:rename"]`, password, currentCode(), 7), http.StatusCreated)
	var multi created
	if err := json.Unmarshal(multiResponse.Body.Bytes(), &multi); err != nil {
		t.Fatal(err)
	}
	if !slices.Equal(multi.Metadata.Scopes, selected) {
		t.Fatalf("created token scopes = %v, want %v", multi.Metadata.Scopes, selected)
	}
	var persisted models.APIToken
	if err := db.First(&persisted, multi.Metadata.ID).Error; err != nil {
		t.Fatal(err)
	}
	if !slices.Equal(persisted.Scopes, selected) {
		t.Fatalf("persisted token scopes = %v, want %v", persisted.Scopes, selected)
	}
	multiList := request(http.MethodGet, tokens, ownerJWT, "", http.StatusOK)
	var listed []models.APIToken
	if err := json.Unmarshal(multiList.Body.Bytes(), &listed); err != nil {
		t.Fatal(err)
	}
	if len(listed) != 1 || !slices.Equal(listed[0].Scopes, selected) {
		t.Fatalf("listed token scopes = %v, want %v", listed, selected)
	}
	// Invalid request bodies reach handlers for selected scopes but are forbidden for others.
	request(http.MethodPost, upload, multi.Token, "", http.StatusBadRequest)
	request(http.MethodPut, "/api/cdn/rename/doc", multi.Token, "", http.StatusBadRequest)
	request(http.MethodPut, "/api/cdn/resize/image", multi.Token, "", http.StatusForbidden)
	request(http.MethodDelete, "/api/cdn/delete/doc/missing.txt", multi.Token, "", http.StatusForbidden)
	request(http.MethodDelete, fmt.Sprintf("%s/%d", tokens, multi.Metadata.ID), ownerJWT, "", http.StatusNoContent)
	request(http.MethodPost, upload, multi.Token, "", http.StatusUnauthorized)
	request(http.MethodPut, "/api/cdn/rename/doc", multi.Token, "", http.StatusUnauthorized)

	allResponse := request(http.MethodPost, tokens, ownerJWT,
		scopeBody(`["cdn:upload","cdn:rename","cdn:resize","cdn:delete"]`, password, currentCode(), 7), http.StatusCreated)
	var all created
	if err := json.Unmarshal(allResponse.Body.Bytes(), &all); err != nil {
		t.Fatal(err)
	}
	request(http.MethodPut, "/api/cdn/resize/image", all.Token, "", http.StatusBadRequest)
	request(http.MethodDelete, "/api/cdn/delete/doc/missing.txt", all.Token, "", http.StatusNotFound)
	request(http.MethodDelete, fmt.Sprintf("%s/%d", tokens, all.Metadata.ID), ownerJWT, "", http.StatusNoContent)

	token := createToken()
	path := fmt.Sprintf("%s/%d", tokens, token.Metadata.ID)
	var stored models.APIToken
	digest, ok := auth.APITokenDigest(token.Token)
	if err := db.First(&stored, token.Metadata.ID).Error; err != nil || !ok || stored.Digest != digest || stored.Digest == token.Token {
		t.Fatal("database must contain only the digest")
	}
	res := request(http.MethodGet, tokens, ownerJWT, "", http.StatusOK)
	if strings.Contains(res.Body.String(), token.Token) || strings.Contains(res.Body.String(), digest) {
		t.Fatal("listing exposed token credentials")
	}
	res = request(http.MethodGet, tokens, otherJWT, "", http.StatusOK)
	if strings.TrimSpace(res.Body.String()) != "[]" {
		t.Fatal("another user can see the token")
	}
	request(http.MethodDelete, path, otherJWT, "", http.StatusNotFound)
	request(http.MethodGet, tokens, token.Token, "", http.StatusUnauthorized)
	request(http.MethodGet, "/api/admin/users", token.Token, "", http.StatusUnauthorized)
	request(http.MethodPut, "/api/cdn/rename/doc", token.Token, "", http.StatusForbidden)
	request(http.MethodPost, upload+"?token="+token.Token, "", "", http.StatusUnauthorized)
	// No file: a 400 shows the request reached the upload handler.
	request(http.MethodPost, upload, token.Token, "", http.StatusBadRequest)
	request(http.MethodPost, upload, ownerJWT, "", http.StatusBadRequest)
	if err := db.First(&stored, token.Metadata.ID).Error; err != nil || stored.LastUsedAt == nil {
		t.Fatal("token use was not recorded")
	}
	request(http.MethodDelete, path, ownerJWT, "", http.StatusNoContent)
	request(http.MethodPost, upload, token.Token, "", http.StatusUnauthorized)

	expired := createToken()
	if err := db.Model(&models.APIToken{}).Where("id = ?", expired.Metadata.ID).
		Update("expires_at", time.Now().UTC().Add(-time.Minute)).Error; err != nil {
		t.Fatal(err)
	}
	request(http.MethodPost, upload, expired.Token, "", http.StatusUnauthorized)

	var active created
	for range database.MaxActiveAPITokens {
		active = createToken()
	}
	request(http.MethodPost, tokens, ownerJWT, tokenBody(password, currentCode(), 7), http.StatusConflict)
	request(http.MethodPut, "/api/auth/change-password", ownerJWT,
		fmt.Sprintf(`{"current_password":%q,"new_password":"different password for API tokens"}`, password), http.StatusOK)
	request(http.MethodPost, upload, active.Token, "", http.StatusUnauthorized)

	if err := database.NewUserRepo(db).DeleteUser(owner.ID); err != nil {
		t.Fatal(err)
	}
	var count int64
	if err := db.Model(&models.APIToken{}).Where("user_id = ?", owner.ID).Count(&count).Error; err != nil || count != 0 {
		t.Fatal("account deletion did not remove token records")
	}
}
