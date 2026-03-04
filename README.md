<p align="center">
  <a href="https://kevinanielsen.github.io/go-fast-cdn/" target="_blank" rel="noopener">
    <img src="https://i.imgur.com/zVNCMfV.png" alt="Go-Fast CDN - Fast and simple Open Source CDN" />
  </a>
  <a href="https://github.com/kevinanielsen/go-fast-cdn/actions/workflows/release.yml/" target="_blank" rel="noopener">
    <img src="https://github.com/kevinanielsen/go-fast-cdn/actions/workflows/release.yml/badge.svg?branch=main" />
  </a>
  <a href="https://goreportcard.com/report/github.com/kevinanielsen/go-fast-cdn" target="_blank" rel="noopener">
    <img src="https://goreportcard.com/badge/github.com/kevinanielsen/go-fast-cdn" />
  </a>
</p>

# Go-Fast CDN

_"The PocketBase of CDNs" - Me_

### A fast and easy-to-use CDN, built with Go.

Utilizing an SQLite database with GORM and the Gin web framework. UI built with [Vite](https://vite.js/) + [React](https://react.dev/) and [wouter](https://github.com/molefrog/wouter).

## How to use

See our documentation at [kevinanielsen.github.io/go-fast-cdn/](https://kevinanielsen.github.io/go-fast-cdn/)

## Community

Join the [discord](https://discord.gg/z9uqNtU6yS) to talk to fellow users and contributors!

## Development

### Clone the Repository

`git clone git@github.com:kevinanielsen/go-fast-cdn`
or `git clone https://github.com/kevinanielsen/go-fast-cdn`

### Add env variables

This project uses [dotenv](https://vault.dotenv.org/) and I recommend that you do the same. <br>
Read more about the usage on their page. <br><br>
If you do not wish to use this, you can just rename `.example.env` to `.env` and fill in the fields.

### Building the binary

1. Run `make prep`
2. Run `make clean`
3. Run `make test`
4. Run `make build`

Your binary should now be tested, built, and you can run it with `bin/go-fast-cdn-linux` or `bin/go-fast-cdn-windows` or `bin/go-fast-cdn-darwin`

### Quick start with Docker

`git clone git@github.com:kevinanielsen/go-fast-cdn`
or `git clone https://github.com/kevinanielsen/go-fast-cdn`

```
docker-compose up -d
```

### Docker Hub

The easiest way to get started without cloning the repo is to pull the image directly from Docker Hub:

```
docker pull kevinanielsen/go-fast-cdn
```

Or pin to a specific version:

```
docker pull kevinanielsen/go-fast-cdn:0.1.6
```

Run it with persistent storage:

```
docker run -d \
  -p 8080:8080 \
  -v go_fast_db:/app/db_data \
  -v go_fast_uploads:/app/uploads \
  kevinanielsen/go-fast-cdn
```

### Subdomain Separation (Optional)

For production deployments, you can separate admin UI from public CDN serving using subdomains.

**Nginx**: See `nginx/example.conf` for a basic configuration.

**Nginx Proxy Manager**:
1. Create proxy host for `admin.cdn.example.com` → `http://your-cdn:8080` (full access)
2. Create proxy host for `cdn.example.com` → `http://your-cdn:8080`
3. Edit the `cdn.example.com` proxy host → **Custom Locations** tab → Add:
   - Location: `/api/cdn/download/images/` → Forward to `http://your-cdn:8080`
   - Location: `/api/cdn/download/docs/` → Forward to `http://your-cdn:8080`
4. Click the **gear icon ⚙️** (top-right) → In **Custom Nginx Configuration**, add:
   ```
   location / {
       return 403;
   }
   ```
5. Save. This blocks admin UI access on `cdn.example.com`

## Releasing

This project uses [goreleaser-cross](https://github.com/goreleaser/goreleaser-cross) v1.27.0 to support CGO cross-compilation, which is required for WEBP image processing across all platforms.

**Note**: We use v1.27.0 which provides stable cross-compilation support with updated repositories. Earlier versions (v1.21.5) had outdated Ubuntu repositories that caused package installation failures.

### Prerequisites for Releases

- Docker installed and running
- GitHub token with appropriate permissions
- Push access to the repository

### Release Commands

```bash
# Test the release configuration
make test-release

# Dry run (test without publishing)
make release-dry-run

# Create and publish a release (requires GITHUB_TOKEN)
export GITHUB_TOKEN=your_github_token
make release
```

### Why goreleaser-cross?

This project requires CGO for WEBP support via:
- `github.com/chai2010/webp` (WEBP encoding)
- `golang.org/x/image/webp` (WEBP decoding)

Standard Go cross-compilation with `CGO_ENABLED=0` would disable WEBP functionality. goreleaser-cross provides the necessary cross-compilation toolchains to build CGO-enabled binaries for all supported platforms while maintaining WEBP support.

### Supported Release Platforms

- **Linux**: amd64, arm64, armv7
- **macOS**: amd64 (Intel), arm64 (M1/M2) - Universal binary
- **Windows**: amd64

All platforms include full WEBP support through CGO compilation using goreleaser-cross v1.27.0.

### Package Formats

In addition to binary archives, Linux platforms also provide:
- **Debian**: .deb packages
- **RedHat**: .rpm packages  
- **Alpine**: .apk packages
