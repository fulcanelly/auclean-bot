package com.fulcanelly.curator.listeners;

import java.util.Map;
import java.util.stream.Collectors;

import org.neo4j.ogm.cypher.ComparisonOperator;
import org.neo4j.ogm.cypher.Filter;

import com.fulcanelly.curator.events.SessionsRequestEvent;
import com.fulcanelly.curator.events.StartupEvent;
import com.fulcanelly.curator.messaging.CuratorCommander;
import com.fulcanelly.curator.model.Neo4jClient;
import com.fulcanelly.curator.model.telegram.TelegramSession;
import com.google.common.eventbus.Subscribe;
import com.google.inject.Inject;

public class StartupListener {
    @Inject
    CuratorCommander curatorCommander;

    @Inject
    Neo4jClient client;

    @Subscribe
    void onStartup(StartupEvent event) {
        curatorCommander.send(event);
        System.out.println("startup");
    }

    @Subscribe
    void onSessionRequest(SessionsRequestEvent event) {
        var sessions = client.getSession().loadAll(
                TelegramSession.class,
                new Filter("user_id", ComparisonOperator.EXISTS)).stream()
                .collect(Collectors.toList());

        System.out.println(sessions);
        curatorCommander.send(Map.of("sessions", sessions));
    }
}
