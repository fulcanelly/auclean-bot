package com.fulcanelly.curator.model;

import org.neo4j.driver.AuthTokens;
import org.neo4j.driver.GraphDatabase;
import org.neo4j.ogm.drivers.bolt.driver.BoltDriver;
import org.neo4j.ogm.session.Session;
import org.neo4j.ogm.session.SessionFactory;

import com.fulcanelly.curator.model.brainfuck.Neo4jLogToDriverInjector;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.google.inject.name.Named;

import lombok.Data;
import lombok.SneakyThrows;

@Singleton @Data
public class Neo4jClient {

    Session session;

    @Inject
    @SneakyThrows
    void configure(
            @Named("neo4.host") String host,
            @Named("neo4.username") String username,
            @Named("neo4.password") String password) {


        // var uri = new URI("neo4j", null, host, 7687, null, null, null);
        // String uri = "bolt://" + username + ":" + password + "@" + host;
        String uri = "bolt://" +  host;


        var driver = new Neo4jLogToDriverInjector().inject(
            GraphDatabase.driver(uri, AuthTokens.basic(username, password))
        );


        // new SessionFactory(new BoltDriver(driver), "null");
        // var config = new Configuration.Builder()
        //         .uri(uri.toString())
        //         .credentials(username, password)
        //         .build();

        var factory =  new SessionFactory(new BoltDriver(driver), Neo4jClient.class.getPackageName());
        // new SessionFactory(config, Neo4jClient.class.getPackageName());

        factory.register(new CallbackLoggerListener());

        session = factory.openSession();
    }

}
