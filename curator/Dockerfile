FROM openjdk:17-buster

WORKDIR /app

RUN apt-get update

RUN apt-get -qq -y install \
    curl \
    unzip \
    zip

RUN curl -s "https://get.sdkman.io" | bash


RUN /bin/bash -c "source /root/.sdkman/bin/sdkman-init.sh; sdk install maven 3.6.3"

# RUN apt-get update
# RUN apt-get install -y maven

# RUN apt-get install -y tmux

COPY pom.xml .

# RUN /bin/bash -c "source /root/.sdkman/bin/sdkman-init.sh /root/.sdkman/bin/sdkman-init.sh && mvn install"

COPY . .

CMD sh start.sh
# java -jar target/curator*.jar
