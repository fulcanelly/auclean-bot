package com.fulcanelly.curator.messaging;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fulcanelly.curator.messaging.events.CuratorEvent;
import com.google.common.eventbus.EventBus;
import com.google.inject.Inject;
import com.google.inject.name.Named;
import com.rabbitmq.client.DeliverCallback;
import com.rabbitmq.client.Delivery;

import lombok.SneakyThrows;

public class RabbitMQRequestDispatcher implements DeliverCallback {

    @Inject
    RabbitMQClient client;

    @Inject
    ObjectMapper mapper;

    @Inject @Named("all")
    EventBus eventBus;

    @SneakyThrows
    public void start() {
        var channel = client.createNewChannel();
        channel.queueDeclare("curator:event", true, false, false, null);
        channel.basicConsume("curator:event", true, this::handle, consumerTag -> {
        });
    }

    @SneakyThrows
    public void handle(String consumerTag, Delivery delivery) {
        try {
            String message = new String(delivery.getBody(), "UTF-8");
            System.out.println(" [x] Received '" + message + "'");

            var event = mapper.readValue(message, CuratorEvent.class);
            eventBus.post(event.eventType.extractEvent(event));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
