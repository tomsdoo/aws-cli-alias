FROM node:22-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends curl unzip gnupg ca-certificates && \
    rm -rf /var/lib/apt/lists/*

ENV AWSCLI_VERSION="2.17.6"

# AWS CLI v2 for ARM64
# https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html#getting-started-install-linux
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-aarch64-${AWSCLI_VERSION}.zip" -o "awscliv2.zip" && \
    unzip awscliv2.zip && \
    ./aws/install && \
    rm awscliv2.zip && \
    rm -rf ./aws

RUN aws --version

RUN node -v
RUN npm -v

WORKDIR /usr/local/app

COPY ./work.sh /usr/local/app/

ENTRYPOINT ["/bin/bash"]
CMD ["work.sh"]
