BINARY_NAME=go-fast-cdn

build:
	cd ui && pnpm build
	go build -o bin/${BINARY_NAME}

run: build
	bin/${BINARY_NAME}

clean: 
	go clean
	rm -rf bin/*

dep:
	go mod download

vet:
	go vet