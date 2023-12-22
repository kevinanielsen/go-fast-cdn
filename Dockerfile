FROM node:18-alpine as front

RUN npm config set registry https://registry.npm.taobao.org

WORKDIR /ui

COPY ./ui/ .

RUN npm i
RUN npm run build

# Fix Docker build due to sqlite3 and alpine 3.19 incompatibility
# more n see https://github.com/mattn/go-sqlite3/issues/1164
FROM golang:1.21-alpine3.18 as cdn

ENV GO111MODULE="on" \
    GOPROXY="https://goproxy.cn,direct" \
    GOARCH=amd64 \
    GOOS=linux \
    CGO_ENABLED=1

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g' /etc/apk/repositories
#RUN apk add build-base
RUN apk add --no-cache \
    # Important: required for go-sqlite3
    gcc \
    # Required for Alpine
    musl-dev

WORKDIR /cdn

COPY . .
COPY --from=front /ui/build/ /cdn/ui/build/

RUN go mod download
RUN go build -o go-fast-cdn

FROM alpine:latest

WORKDIR /app

COPY --from=cdn /cdn/go-fast-cdn /app/

EXPOSE 8080

CMD ["/app/go-fast-cdn"]
