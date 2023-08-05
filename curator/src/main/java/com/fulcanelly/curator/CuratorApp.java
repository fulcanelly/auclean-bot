package com.fulcanelly.curator;

import java.util.Set;

import com.fulcanelly.curator.config.CuratorModule;
import com.fulcanelly.curator.events.StartupEvent;
import com.fulcanelly.curator.messaging.RabbitMQRequestDispatcher;
import com.google.common.eventbus.EventBus;
import com.google.inject.Guice;
import com.google.inject.Inject;
import com.google.inject.name.Named;

import lombok.SneakyThrows;


public class CuratorApp {

    @Inject
    RabbitMQRequestDispatcher dispatcher;

    @Inject @Named("all")
    EventBus eventBus;

    public static void main(String[] args) throws Exception {
        new CuratorApp().run();
    }

    @Inject
    void setupListeners(@Named("all") EventBus eventBus, @Named("all") Set<Object> listeners) {
        listeners.forEach(eventBus::register);
    }

    @SneakyThrows
    void run() {
        Guice.createInjector(new CuratorModule()).injectMembers(this);
        eventBus.post(new StartupEvent());
        dispatcher.start();
    }

}
