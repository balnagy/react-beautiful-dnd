FROM node:7-alpine

COPY . /opt/service/
WORKDIR /opt/service

RUN yarn install

EXPOSE 9002

ENTRYPOINT ["yarn", "storybook"]
