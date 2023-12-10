# Go-Fast CDN

### A fast and easy-to-use CDN, built with Go.

My first large Go project. Utilizing the Gorm-ORM and the Gin web-framework.

## How to use

`/api/cdn/upload/image`<br>
Body: FormData with "image".<br>
Upload an image with the following MIME types:

- image/jpeg
- image/jpg
- image/png
- image/gif
- image/webp
- image/bmp

`/api/cdn/upload/doc`<br>
Body: FormData with "doc".<br>
Upload an image with the following MIME types:

- text/plain
- application/msword (.doc)
- application/vnd.openxmlformats-officedocument.wordprocessingml.document (.docx)
- application/vnd.openxmlformats-officedocument.presentationml.presentation (.ppx)
- application/vnd.openxmlformats-officedocument.spreadsheetml.sheet (.xlsx)
- application/pdf
- application/rtf
- application/x-freearc (.arc)

## Development

1. **Clone the Repository** <br>
   `git clone git@github.com:kevinanielsen/go-fast-cdn`
   or `git clone https://github.com:kevinanielsen/go-fast-cdn`
2. **Add env variables** <br>
   This project uses [dotenv](https://vault.dotenv.org/) and I recommend that you do the same. <br>
   Read more abou the usage on their page. <br><br>
   If you do not wish to use this, you can just rename `.example.env` to `.env` and fill in the fields.
