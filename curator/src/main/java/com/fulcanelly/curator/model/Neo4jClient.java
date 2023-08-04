package com.fulcanelly.curator.model;

import java.net.URI;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.neo4j.ogm.config.Configuration;
import org.neo4j.ogm.session.Session;
import org.neo4j.ogm.session.SessionFactory;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.google.inject.name.Named;

import lombok.Data;
import lombok.SneakyThrows;
import org.neo4j.ogm.drivers.bolt.request.BoltRequest;;
@Singleton @Data
public class Neo4jClient {

    Session session;

    @Inject
    @SneakyThrows
    void configure(
            @Named("neo4.host") String host,
            @Named("neo4.username") String username,
            @Named("neo4.password") String password) {
        var uri = new URI("neo4j", null, host, 7687, null, null, null);

        var config = new Configuration.Builder()
                .uri(uri.toString())
                .credentials(username, password)
                .build();

                
        Logger.getLogger("org.neo4j.ogm.drivers.bolt.request.BoltRequest").setLevel(Level.ALL);
        Logger.getLogger("org.neo4j.ogm.drivers.bolt.request.EmbeddedRequest").setLevel(Level.ALL);

        var factory = new SessionFactory(config, Neo4jClient.class.getPackageName());

        factory.register(new CallbackLoggerListener());

        session = factory.openSession();
    }

}
