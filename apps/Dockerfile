# docker build -t ghcr.io/jbatonnet/rinkhals/build -f build/Dockerfile build
# docker push ghcr.io/jbatonnet/rinkhals/build

FROM debian:12.8

RUN apt update && \
    apt install -y git wget jq rclone zip xz-utils python3 && \
    rm -rf /var/lib/apt/lists/*
