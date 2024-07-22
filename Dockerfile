# Build the UI
FROM node:18.17.0-bullseye-slim AS nodework
WORKDIR /app
COPY ui/ .
RUN npm install
RUN npm run build

# Build the Go binary
FROM golang:1.22 AS gowork
WORKDIR /app
COPY go.mod .
COPY go.sum .
RUN go mod download

COPY . .
RUN go build -o /app/main .


# Run the binary in a alpine container
FROM ubuntu:22.04
WORKDIR /app
COPY --from=gowork /app/main .
CMD [ "./main" ]