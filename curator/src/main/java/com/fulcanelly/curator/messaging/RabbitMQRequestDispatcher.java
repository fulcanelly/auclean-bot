package com.fulcanelly.curator.messaging;

import com.google.inject.Inject;
import com.rabbitmq.client.DeliverCallback;
import com.rabbitmq.client.Delivery;

import lombok.SneakyThrows;

public class RabbitMQRequestDispatcher implements DeliverCallback {

    @Inject
    public RabbitMQClient client;

    @SneakyThrows
    public
    void start() {
        var channel = client.createNewChannel();
        channel.queueDeclare("products_queue", true, false, false, null);


        channel.basicConsume("products_queue", true, this::handle, consumerTag -> { });
    }

    @SneakyThrows
    public void handle(String consumerTag, Delivery delivery) {
        String message = new String(delivery.getBody(), "UTF-8");
        System.out.println(" [x] Received '" + message + "'");

    }
}
