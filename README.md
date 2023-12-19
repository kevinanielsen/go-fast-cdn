<p align="center">
  <a href="https://kevinanielsen.github.io/go-fast-cdn/" target="_blank" rel="noopener">
    <img src="https://i.imgur.com/aRBCyfv.png" alt="Go-Fast CDN - Fast and simple Open Source CDN" />
  </a>
</p>

# Go-Fast CDN
*"The PocketBase of CDNs" - Me*
### A fast and easy-to-use CDN, built with Go.

Utilizing an SQLite database with GORM and the Gin web framework. UI built with [Vite](https://vite.js/) + [React](https://react.dev/) and [wouter](https://github.com/molefrog/wouter).

## How to use

See our documentation at [kevinanielsen.github.io/go-fast-cdn/](https://kevinanielsen.github.io/go-fast-cdn/)

## Development

### Clone the Repository

`git clone git@github.com:kevinanielsen/go-fast-cdn`
or `git clone https://github.com:kevinanielsen/go-fast-cdn`

### Add env variables

This project uses [dotenv](https://vault.dotenv.org/) and I recommend that you do the same. <br>
Read more about the usage on their page. <br><br>
If you do not wish to use this, you can just rename `.example.env` to `.env` and fill in the fields.

### Building the binary

1. Run `make prep`
2. Run `make clean`
3. Run `make build` <br>

Your binary should now be built and you can run it with `bin/go-fast-cdn-linux` or `bin/go-fast-cdn-windows` or `bin/go-fast-cdn-darwin`
