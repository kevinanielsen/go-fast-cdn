BINARY_NAME=go-fast-cdn

prep:
	go mod tidy
	go mod download
	cd ui && pnpm i

build: build_ui build_bin

build_ui:
	pnpm --dir ./ui build

build_bin:
	GOARCH=amd64 GOOS=darwin go build -o bin/${BINARY_NAME}-darwin 
	CC="x86_64-linux-musl-gcc" GOARCH=amd64 GOOS=linux go build -o bin/${BINARY_NAME}-linux
	CC="x86_64-w64-mingw32-gcc" GOARCH=amd64 GOOS=windows go build -o bin/${BINARY_NAME}-windows

run: build
	bin/${BINARY_NAME}-darwin

clean: 
	go clean
	rm -rf bin/*
	rm -rf ui/build/*

vet:
	go vet