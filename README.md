# Go-Fast CDN

### A fast and easy-to-use CDN, built with Go.

Utilizing a SQLite database with GORM and the Gin web-framework. UI built with [Vite](https://vite.js/) + [React](https://react.dev/) and [wouter](https://github.com/molefrog/wouter).

## How to use

See the API documentation at [go-fast-cdn.redoc.ly](https://go-fast-cdn.redoc.ly/)

## Development

### Clone the Repository

`git clone git@github.com:kevinanielsen/go-fast-cdn`
or `git clone https://github.com:kevinanielsen/go-fast-cdn`

### Add env variables

This project uses [dotenv](https://vault.dotenv.org/) and I recommend that you do the same. <br>
Read more abou the usage on their page. <br><br>
If you do not wish to use this, you can just rename `.example.env` to `.env` and fill in the fields.

### Set the main.db

This project uses an SQLite database. To start, you need to rename `.example.db` to `main.db`.

### Building the binary

1. Go to `/ui` and run `pnpm i`.
2. Run `pnpm build` to build the ui.
3. Go to the root of the project and run `go build` to build the binary. The ui files should be embedded in the binary automatically. Then you can run the binary with `./go-fast-cdn`
