package com.fulcanelly.curator.services;

import java.util.Map;
import java.util.stream.Collectors;

import org.neo4j.ogm.cypher.ComparisonOperator;
import org.neo4j.ogm.cypher.Filter;

import com.fulcanelly.curator.messaging.CuratorCommander;
import com.fulcanelly.curator.model.Neo4jClient;
import com.fulcanelly.curator.model.telegram.TelegramSession;
import com.google.inject.Inject;

public class SessionConfirmationService {
    @Inject
    Neo4jClient client;

    @Inject
    CuratorCommander curatorCommander;

    public void sendAllSessions() {
        var sessions = client.getSession().loadAll(
                TelegramSession.class,
                new Filter("user_id", ComparisonOperator.EXISTS)).stream()
                .collect(Collectors.toList());

        System.out.println(sessions);
        curatorCommander.send(Map.of("sessions", sessions));
    }
}
