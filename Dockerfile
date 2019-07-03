FROM node:alpine

LABEL name="api-service-controller"
LABEL title="API Controller"
LABEL author="cto@troven.co"

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh

# Prepare NPM
COPY package.json package.json
COPY tsconfig.json tsconfig.json
COPY VERSION VERSION

RUN npm install

# Add our default config
COPY config config

# Add our source files
COPY src src

# Launch NodeJS
CMD ["npm", "start"]

EXPOSE 5008
