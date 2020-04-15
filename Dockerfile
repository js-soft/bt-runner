FROM node:lts

RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb 
RUN apt update -y && apt upgrade -y
RUN apt install -y -f ./google-chrome-stable_current_amd64.deb
RUN rm -f google-chrome-stable_current_amd64.deb

RUN npm i -g --unsafe-perm chromedriver

WORKDIR /usr/app
