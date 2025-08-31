---
title: Hosting
description: Learn to dockerize and host your CDN.
---

You can easily host a CDN for free using Docker and fly.io. In this guide you will learn how to do this with minimal requirements.

---

#### Requirements

You don't need to have a lot of experience with Docker or CDNs in general to host a go-fast-cdn for the first time. All you need is:

- very basic knowledge about your **terminal** of choice.
- **Docker** downloaded and running on your machine.

## Getting started

You could clone the [Github repository](https://github.com/kevinanielsen/go-fast-cdn) but you don't need to do that, as already built binaries are available in the [releases tab](https://github.com/kevinanielsen/go-fast-cdn/releases). So all you need to do is make a new directory on your machine where we will work from.

You can create a new directory by running the following command in your terminal:

```bash
mkdir go-fast-cdn
```

From there you need to make a new Dockerfile, which you can do either with the following command, or just by making the file with your favorite text-editor.

```bash
touch Dockerfile
```

From there you need to paste the following lines into the Dockerfile, which will copy the go-fast-cdn binary made for Linux distributions and serve it on port 8080.

```dockerfile
FROM alpine:latest

ARG GO_FAST_VERSION=0.1.6

RUN apk add --no-cache unzip openssh

# download and unzip go-fast-cdn
ADD https://github.com/kevinanielsen/go-fast-cdn/releases/download/${GO_FAST_VERSION}/go-fast-cdn_${GO_FAST_VERSION}_linux_amd64.zip /tmp/cdn.zip
RUN unzip /tmp/cdn.zip -d /cdn/

EXPOSE 8080

# start go-fast-cdn
CMD ["/cdn/go-fast-cdn"]

```

Now, when you have saved the file, you can test if it works as expected by building the container. For this step make sure that you have Docker running on your machine.

```bash
docker build . -t cdn
```

If it builds successfully, you can run it with the following command

```bash
docker run -p 8080:8080 cdn
```

If it runs, you have now officially containerized your own CDN and you can go to [localhost:8080](http://localhost:8080) and see if it works as expected.

## Hosting

From here, you can use your CDN as you wish, and host it where you want. If you want to host it for free, you can do so on [fly.io](https://fly.io/).

To do so, you need to install the flyctl cli-tool on your machine. To install the tool, just follow the instructions [here](https://fly.io/docs/hands-on/install-flyctl/).

When flyctl is installed, you can run

```bash
flyctl launch
```

A configuration menu should now appear, and you can follow the instructions listed. If everything goes well you should be greeted with the following text:

> _Visit your newly deployed app at https://{your-chosen-name}.fly.dev/_

**Congratulations!** You have now hosted your very own CDN.
