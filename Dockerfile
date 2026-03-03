# Build the UI
FROM node:24-slim AS nodework
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV CI=TRUE
RUN corepack enable

WORKDIR /app
COPY ui/ .
RUN pnpm install
RUN pnpm run build

# Build the Go binary
FROM golang:1.25 AS gowork
WORKDIR /app
COPY go.mod .
COPY go.sum .
RUN go mod download

COPY . .
COPY --from=nodework /app/build ui/build
RUN go build -o /app/main .


# Run the binary in a alpine container
FROM ubuntu:22.04
WORKDIR /app
COPY --from=gowork /app/main .
CMD [ "./main" ]
