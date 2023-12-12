BINARY_NAME=go-fast-cdn

prep:
	go mod tidy
	go mod download
	cd ui && pnpm i

build:
	cd ui && pnpm build
	go build -o bin/${BINARY_NAME}

run: build
	bin/${BINARY_NAME}

clean: 
	go clean
	rm -rf bin/*

vet:
	go vet