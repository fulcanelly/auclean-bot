package com.fulcanelly.curator.messaging;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.google.inject.name.Named;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;

import lombok.SneakyThrows;

@Singleton
public class RabbitMQClient {

    Connection connection;

    @SneakyThrows
    @Inject
    void configure(
            @Named("rmq.host") String host,
            @Named("rmq.username") String username,
            @Named("rmq.password") String password) {
        var factory = new ConnectionFactory();
        factory.setHost(host);
        factory.setUsername(username);
        factory.setPassword(password);
        connection = factory.newConnection();
    }

    @SneakyThrows
    public Channel createNewChannel() {
        return connection.createChannel();
    }

}
