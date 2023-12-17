---
title: Development
description: How to help develop the go-fast-cdn.
---

## Installation

### Cloning the repo

You can clone this repo with either of the following commands:

```bash title="SSH"
git clone git@github.com:kevinanielsen/go-fast-cdn
```

```bash title="HTTPS"
git clone https://github.com:kevinanielsen/go-fast-cdn
```

### Setting up the project

This project uses [dotenv](https://dotenv.org) and you can access the `.env.example` [here](https://vault.dotenv.org/project/vlt_a602c18fc8f8fd898bfacba2ed8715a9deca301c87e06fbb3ea2cde40c41e109/example). You can go ahead and copy that, and insert it into your `.env` file.

## Building

This project uses a makefile, and you can use that to build the binaries.

```bash
make prep   # install dependencies
make clean  # clean the output files (don't use if first time building)
make build  # build the binaries
```

This will cross-compile to windows, darwin, and linux binaries, so make sure that you have the compilers installed on your machine if you run `make build`. If you don't have the compiler installed, instead run

```bash
go build .
```

### Running

Your binary should now be built and you can run it with one of the following commands, depending on your system:

```sh title="Windows"
.\bin\go-fast-cdn-windows
```

```bash title="MacOS"
/bin/go-fast-cdn-darwin
```

```bash title="Linux"
/bin/go-fast-cdn-linux
```
