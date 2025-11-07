FROM node:24-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends curl unzip gnupg ca-certificates && \
    rm -rf /var/lib/apt/lists/*

ARG TARGETARCH
ENV AWSCLI_VERSION="2.17.6"

RUN if [ "${TARGETARCH}" = "arm64" ]; then \
      ARCH_TAG="aarch64"; \
    else \
      ARCH_TAG="x86_64"; \
    fi && \
    curl "https://awscli.amazonaws.com/awscli-exe-linux-${ARCH_TAG}-${AWSCLI_VERSION}.zip" -o "awscliv2.zip" && \
    unzip awscliv2.zip && \
    ./aws/install -i /usr/local/aws-cli -b /usr/local/bin && \
    rm awscliv2.zip && \
    rm -rf ./aws

RUN aws --version

RUN node -v
RUN npm -v

RUN mkdir -p /usr/local/scripts
COPY geta.js /usr/local/scripts/geta.js

WORKDIR /usr/local/app

ENTRYPOINT ["node", "/usr/local/scripts/geta.js"]
