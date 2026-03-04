BINARY_NAME=go-fast-cdn
OS_NAME := $(shell uname -s | tr A-Z a-z)
ARCH := $(shell uname -m | tr A-Z a-z | sed 's/^aarch/arm/' | sed 's/^x86_64/amd64/')

.PHONY: help prep build build_ui build_bin run dev clean vet test release release-dry-run

help: ## Show this help message
	@echo "Available commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "Release commands require GITHUB_TOKEN environment variable:"
	@echo "  export GITHUB_TOKEN=your_github_token"
	@echo "  make release          # Create and publish a new release"
	@echo "  make release-dry-run  # Test release without publishing"

prep: ## Install dependencies and prepare development environment
	go mod tidy
	go mod download
	cd ui && pnpm i
	go install github.com/air-verse/air@latest

build: build_ui build_bin ## Build the complete application (UI + binary)

build_ui: ## Build the UI dashboard
	pnpm --dir ./ui build

build_bin: ## Build the binary for current platform with CGO enabled
ifeq ($(OS_NAME),darwin)
	GOARCH=${ARCH} GOOS=darwin CGO_ENABLED=1 go build -o bin/${BINARY_NAME}-darwin
else ifeq ($(OS_NAME),linux)
	GOARCH=${ARCH} GOOS=${OS_NAME} CGO_ENABLED=1 go build -o bin/${BINARY_NAME}-${OS_NAME}
else ifeq ($(OS_NAME),windows)
	CC="x86_64-w64-mingw32-gcc" GOARCH=${ARCH} GOOS=windows CGO_ENABLED=1 go build -o bin/${BINARY_NAME}-windows
endif

run: build ## Build and run the application
ifeq ($(OS_NAME),)
	bin/${BINARY_NAME}-windows
else
	bin/${BINARY_NAME}-${OS_NAME}
endif

dev: ## Start development server with hot reload
	air

clean: ## Clean build artifacts
	go clean
	rm -rf bin/*
	rm -rf ui/build/*

vet: ## Run go vet
	go vet

test: ## Run tests
	go test ./...

release: ## Create and publish a new release using goreleaser-cross (requires GITHUB_TOKEN)
	@echo "Building and releasing with goreleaser-cross for CGO and WEBP support..."
	@if [ -z "$(GITHUB_TOKEN)" ]; then \
		echo "Error: GITHUB_TOKEN is not set"; \
		exit 1; \
	fi
	docker run --rm --privileged \
		-v $(PWD):/go/src/github.com/kevinanielsen/go-fast-cdn \
		-v /var/run/docker.sock:/var/run/docker.sock \
		-w /go/src/github.com/kevinanielsen/go-fast-cdn \
		-e GITHUB_TOKEN=$(GITHUB_TOKEN) \
		-e CGO_ENABLED=1 \
		goreleaser/goreleaser-cross:v1.27.0 \
		release --clean

release-dry-run: ## Test release process without publishing using goreleaser-cross
	@echo "Running goreleaser-cross snapshot build with CGO and WEBP support..."
	docker run --rm --privileged \
		-v $(PWD):/go/src/github.com/kevinanielsen/go-fast-cdn \
		-v /var/run/docker.sock:/var/run/docker.sock \
		-w /go/src/github.com/kevinanielsen/go-fast-cdn \
		-e CGO_ENABLED=1 \
		goreleaser/goreleaser-cross:v1.27.0 \
		release --snapshot --clean

test-release: ## Test goreleaser-cross configuration and CGO compilation
	@echo "Testing goreleaser-cross setup for CGO and WEBP support..."
	@echo "Pulling latest goreleaser-cross image..."
	docker pull goreleaser/goreleaser-cross:v1.27.0
	@echo "Testing configuration..."
	docker run --rm --privileged \
		-v $(PWD):/go/src/github.com/kevinanielsen/go-fast-cdn \
		-w /go/src/github.com/kevinanielsen/go-fast-cdn \
		-e CGO_ENABLED=1 \
		goreleaser/goreleaser-cross:v1.27.0 \
		check
	@echo "Testing build for linux/amd64 with CGO..."
	docker run --rm --privileged \
		-v $(PWD):/go/src/github.com/kevinanielsen/go-fast-cdn \
		-w /go/src/github.com/kevinanielsen/go-fast-cdn \
		-e CGO_ENABLED=1 \
		-e GOOS=linux \
		-e GOARCH=amd64 \
		-e CC=x86_64-linux-gnu-gcc \
		--entrypoint sh \
		goreleaser/goreleaser-cross:v1.27.0 \
		-c "go build -v -x -o test-binary ./main.go && ldd test-binary || true && rm -f test-binary"
	@echo "✅ goreleaser-cross setup test completed successfully!"
