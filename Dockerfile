FROM node:alpine

LABEL name="api-service-warden"
LABEL title="Docker: a6s Example APIs"
LABEL author="cto@troven.co"

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh

COPY package.json package.json
COPY .npmrc .
RUN npm install

# RUN npm install --global bower
# COPY bower.json bower.json
# RUN echo '{ "allow_root": true }' > /root/.bowerrc
# RUN bower install --allow-root

# Add our source files
COPY config config
COPY lib lib
COPY public public
COPY views views

# Launch NodeJS
CMD ["npm", "start"]

EXPOSE 6102
