FROM node:alpine

LABEL name="api-service-controller"
LABEL title="Docker: Troven Example APIs"
LABEL author="cto@troven.co"

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh

# Prepare NPM
COPY package.json package.json
COPY package-lock.json package-lock.json
COPY tsconfig.json tsconfig.json
COPY VERSION VERSION

RUN npm install
RUN npm run build

# Add our default config
COPY config config

# Add our source files
COPY lib lib

# Launch NodeJS
CMD ["npm", "start"]

EXPOSE 5008
