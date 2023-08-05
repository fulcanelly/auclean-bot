package com.fulcanelly.curator.messaging;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.inject.Inject;
import com.rabbitmq.client.Channel;

import lombok.SneakyThrows;

public abstract class RabbitMQSerializedSender {

    @Inject
    ObjectMapper objectMapper;

    @Inject
    RabbitMQClient client;

    abstract String getQueueName();

    Channel channel;

    @Inject @SneakyThrows
    void setup() {
        channel = client.createNewChannel();
        channel.queueDeclare(getQueueName(), true, false, false, null);
    }

    @SneakyThrows
    public <T>void send(T object) {
        var json = objectMapper.writeValueAsString(object);

        System.out.println(json);
        channel.basicPublish("", getQueueName(), null, json.getBytes());
    }
}
