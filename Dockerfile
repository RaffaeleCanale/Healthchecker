FROM node:10
WORKDIR /etc/wx/

COPY package.json yarn.lock tsconfig.json ./

RUN yarn install

COPY src/ src/

RUN yarn run build

COPY config.js targets.js ./

CMD ["yarn", "start"]
