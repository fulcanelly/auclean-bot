package com.fulcanelly.curator.config;

import com.google.inject.AbstractModule;
import com.google.inject.Provides;
import com.google.inject.Singleton;
import com.google.inject.name.Named;

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

}
