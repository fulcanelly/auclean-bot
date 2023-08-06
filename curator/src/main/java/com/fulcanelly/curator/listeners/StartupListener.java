package com.fulcanelly.curator.listeners;

import com.fulcanelly.curator.events.SessionsRequestEvent;
import com.fulcanelly.curator.events.StartupEvent;
import com.fulcanelly.curator.messaging.CuratorCommander;
import com.fulcanelly.curator.model.Neo4jClient;
import com.fulcanelly.curator.services.SessionConfirmationService;
import com.google.common.eventbus.Subscribe;
import com.google.inject.Inject;

public class StartupListener {
    @Inject
    CuratorCommander curatorCommander;

    @Inject
    Neo4jClient client;

    @Inject
    SessionConfirmationService sessionConfirmationService;

    @Subscribe
    void onStartup(StartupEvent event) {
        curatorCommander.send(event);
        System.out.println("startup");
    }

    @Subscribe
    void onSessionRequest(SessionsRequestEvent event) {
        sessionConfirmationService.sendAllSessions();
    }
}
