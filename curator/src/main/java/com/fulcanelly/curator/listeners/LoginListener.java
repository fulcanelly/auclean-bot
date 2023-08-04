package com.fulcanelly.curator.listeners;

import java.util.stream.Collectors;

import org.neo4j.ogm.cypher.ComparisonOperator;
import org.neo4j.ogm.cypher.Filter;

import com.fulcanelly.curator.messaging.events.LoginInitEvent;
import com.fulcanelly.curator.messaging.events.LoginSuccessEvent;
import com.fulcanelly.curator.model.Neo4jClient;
import com.fulcanelly.curator.model.telegram.TelegramSession;
import com.google.common.eventbus.Subscribe;
import com.google.inject.Inject;

public class LoginListener {
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

}
