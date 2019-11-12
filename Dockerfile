FROM node:alpine

LABEL name="api-service-controller"
LABEL title="API Controller"
LABEL author="cto@troven.co"

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh

WORKDIR /opt/a6s

# Prepare NPM
COPY package.json package.json
COPY tsconfig.json tsconfig.json
COPY VERSION VERSION

RUN npm install
RUN npm install typescript -g

# Add our default config
COPY config config

# Add our source files
COPY src src
RUN tsc

# Launch NodeJS
CMD ["npm", "run", "boot"]

EXPOSE 5008
