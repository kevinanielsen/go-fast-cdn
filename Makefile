BINARY_NAME=go-fast-cdn
OS_NAME := $(shell uname -s | tr A-Z a-z)

prep:
	go mod tidy
	go mod download
	cd ui && pnpm i

build: build_ui build_bin

build_ui:
	pnpm --dir ./ui build

build_bin:
	GOARCH=amd64 GOOS=darwin CGO_ENABLED=0 go build -o ./bin/${BINARY_NAME}-darwin ./cmd/
	CC="x86_64-linux-musl-gcc" GOARCH=amd64 GOOS=linux CGO_ENABLED=0 go build -o ./bin/${BINARY_NAME}-linux ./cmd/
	CC="x86_64-w64-mingw32-gcc" GOARCH=amd64 GOOS=windows CGO_ENABLED=0 go build -o ./bin/${BINARY_NAME}-windows ./cmd/

run: build
ifeq ($(OS_NAME),)
	bin/${BINARY_NAME}-windows
else
	bin/${BINARY_NAME}-${OS_NAME}
endif

clean: 
	go clean
	rm -rf bin/*
	rm -rf ui/build/*

vet:
	go vet

test:
	go test ./...
