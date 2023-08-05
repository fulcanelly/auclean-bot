package com.fulcanelly.curator.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fulcanelly.curator.listeners.LoginListener;
import com.fulcanelly.curator.listeners.StartupListener;
import com.google.common.eventbus.EventBus;
import com.google.inject.AbstractModule;
import com.google.inject.Provides;
import com.google.inject.Singleton;
import com.google.inject.multibindings.Multibinder;
import com.google.inject.name.Named;
import com.google.inject.name.Names;

public class CuratorModule extends AbstractModule {

    @Provides
    @Singleton
    @Named("neo4.host")
    String provideNeo4jHost() {
        return System.getenv("NEO4J_HOST");
    }

    @Provides
    @Singleton
    @Named("neo4.username")
    String provideNeo4jUsername() {
        return System.getenv("NEO4J_USERNAME");
    }

    @Provides
    @Singleton
    @Named("neo4.password")
    String provide() {
        return System.getenv("NEO4J_PASSWORD");
    }

    @Provides
    @Singleton
    @Named("rmq.host")
    String provideRabbitMQHost() {
        return System.getenv("RMQ_HOST");
    }

    @Provides
    @Singleton
    @Named("rmq.username")
    String provideRabbitMQUsername() {
        return System.getenv("RMQ_USERNAME");
    }

    @Provides
    @Singleton
    @Named("rmq.password")
    String provideRabbitMQPassword() {
        return System.getenv("RMQ_PASSWORD");
    }

    @Provides
    @Singleton
    @Named("all")
    EventBus providEventBus() {
        return new EventBus("all");
    }

    @Provides
    @Singleton
    ObjectMapper providMapper() {
        var mapper = new ObjectMapper();
        mapper.disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);
        return mapper;
    }

    protected void configure() {
        // TODO: scan root package to find listeners
        var multibinder = Multibinder.newSetBinder(binder(), Object.class, Names.named("all"));
        multibinder.addBinding().to(LoginListener.class);
        multibinder.addBinding().to(StartupListener.class);
    }

}
