FROM node:alpine

LABEL name="api-service-controller"
LABEL title="API Controller"
LABEL author="cto@troven.co"

RUN apk add nodejs yarn npm curl bash

WORKDIR /opt/troven/

# Prepare NPM

COPY package.json package.json
COPY AS-BUILT-VERSION AS-BUILT-VERSION
RUN npm install

# Compile our source
COPY tsconfig.json tsconfig.json
COPY src src
RUN tsc

# Copy default runtime configs
COPY config config

# Run node without compiling
CMD ["npm", "run", "boot"]

EXPOSE 5008
