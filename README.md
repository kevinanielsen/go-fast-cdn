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

1. Run `make prep`
2. Run `make clean`
3. Run `make build` <br>

Your binary should now be built and you can run it with `bin/go-fast-cdn`
