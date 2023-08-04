package com.fulcanelly.curator.messaging;

import java.util.Map;
import java.util.stream.Collector;
import java.util.stream.Collectors;

import org.neo4j.ogm.cypher.ComparisonOperator;
import org.neo4j.ogm.cypher.Filter;
import org.neo4j.ogm.cypher.function.FilterFunction;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fulcanelly.curator.model.Neo4jClient;
import com.fulcanelly.curator.model.telegram.TelegramSession;
import com.google.common.eventbus.EventBus;
import com.google.common.eventbus.Subscribe;
import com.google.inject.Inject;
import com.rabbitmq.client.DeliverCallback;
import com.rabbitmq.client.Delivery;

import lombok.Data;
import lombok.SneakyThrows;

interface EventExtractable<T> {
    Object extractEvent(T object);
}

enum IncomingEventType implements EventExtractable<CuratorEvent> {
    @JsonProperty("login_success")
    LOGIN_SUCCESS {

        @Override
        public Object extractEvent(CuratorEvent event) {
            return event.getLoginSuccess();
        }

    },
    @JsonProperty("login_init")
    LOGIN_INIT {

        @Override
        public Object extractEvent(CuratorEvent event) {
            return event.loginInit;
        }

    }
}

@Data
class LoginSuccessEvent {
    @JsonProperty("session_name")
    String sessionName;

    @JsonProperty("user_id")
    String userId;

    @JsonProperty("linked_to")
    String linkedTo;
}

@Data
class LoginInitEvent {

    @JsonProperty("user_id")
    String userId;

    @JsonProperty("linked_to")
    String linkedTo;
}

@Data
class CuratorEvent {
    IncomingEventType event;

    @JsonProperty("login_success")
    LoginSuccessEvent loginSuccess;

    @JsonProperty("login_init")
    LoginInitEvent loginInit;
}

class TOdoListener {
    @Inject
    Neo4jClient client;

    @Subscribe
    void onLoginFinish(LoginSuccessEvent event) {
        var telegramSessions = client.getSession().loadAll(
            TelegramSession.class,
            new Filter("user_id", ComparisonOperator.EQUALS, event.getUserId()));

        if (telegramSessions.stream().findAny().isPresent()) {
            System.out.println("Already existis");
            return;
        }

        System.out.println("Creating new session");


        var telegramSession = new TelegramSession()
            .withSessionName(event.getSessionName())
            .withUserId(event.getUserId());

        client.getSession().save(telegramSession);
    }

    @Subscribe
    void onNewLoginAttempt(LoginInitEvent event) {
        // TODO
        var telegramSession = client.getSession().loadAll(
            TelegramSession.class,
            new Filter("user_id", ComparisonOperator.EQUALS, event.getUserId()));

        System.out.println(telegramSession.stream().collect(Collectors.toList()));
        if (telegramSession.isEmpty()) {
            // TODO

        } else {
            // TODO already logined -> write new dispatch in fiel:
            // @file src/main.js

        }
    }

    @Subscribe
    void test(Object a) {
        System.out.println("OK");
    }
}

public class RabbitMQRequestDispatcher implements DeliverCallback {

    @Inject
    public RabbitMQClient client;

    @Inject
    Neo4jClient dbClient;

    ObjectMapper mapper = new ObjectMapper();

    EventBus eventBus = new EventBus();

    @Inject
    TOdoListener tOdoListener;

    @Inject
    void setupListeners() {
        System.out.println("SUB");
        eventBus.register(tOdoListener);
    }

    @SneakyThrows
    public void start() {
        var channel = client.createNewChannel();
        // todo curator:command
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
            eventBus.post(event.event.extractEvent(event));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
