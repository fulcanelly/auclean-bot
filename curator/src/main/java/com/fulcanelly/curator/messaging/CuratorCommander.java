package com.fulcanelly.curator.messaging;

public class CuratorCommander extends RabbitMQSerializedSender {

    @Override
    String getQueueName() {
        return "curator:command";
    }

}
