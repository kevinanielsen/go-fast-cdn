BINARY_NAME=go-fast-cdn
OS_NAME := $(shell uname -s | tr A-Z a-z)
ARCH := $(shell uname -m | tr A-Z a-z | sed 's/^aarch/arm/')

prep:
	go mod tidy
	go mod download
	cd ui && pnpm i
	go install github.com/air-verse/air@latest

build: build_ui build_bin

build_ui:
	pnpm --dir ./ui build

build_bin:
	GOARCH=${ARCH} GOOS=darwin CGO_ENABLED=0 go build -o bin/${BINARY_NAME}-darwin 
	CC="x86_64-linux-musl-gcc" GOARCH=${ARCH} GOOS=linux CGO_ENABLED=0 go build -o bin/${BINARY_NAME}-linux
	CC="x86_64-w64-mingw32-gcc" GOARCH=${ARCH} GOOS=windows CGO_ENABLED=0 go build -o bin/${BINARY_NAME}-windows

run: build
ifeq ($(OS_NAME),)
	bin/${BINARY_NAME}-windows
else
	bin/${BINARY_NAME}-${OS_NAME}
endif

dev:
	air

clean: 
	go clean
	rm -rf bin/*
	rm -rf ui/build/*

vet:
	go vet

test:
	go test ./...
