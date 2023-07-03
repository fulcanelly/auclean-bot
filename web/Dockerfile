FROM ruby:3.2-buster
# RUN apk add --no-cache mariadb-dev nodejs npm build-base bash git tzdata gcompat

# RUN npm install -g yarn


WORKDIR /app

COPY Gemfile* ./


RUN gem install bundler

RUN bundle config set force_ruby_platform true
# RUN bundle config set --local without 'test development'
RUN bundle install


ENV PORT=8080
ENV RAILS_LOG_TO_STDOUT=1
ENV RAILS_SERVE_STATIC_FILES=true
ENV RAILS_HOST $RAILS_HOST

ENV RAILS_ENV=development
