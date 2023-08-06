package com.fulcanelly.curator;

import java.util.Set;

import org.neo4j.ogm.cypher.query.Pagination;
import org.neo4j.ogm.session.Neo4jSession;
import org.neo4j.ogm.session.Session;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fulcanelly.curator.config.CuratorModule;
import com.fulcanelly.curator.events.StartupEvent;
import com.fulcanelly.curator.messaging.RabbitMQRequestDispatcher;
import com.fulcanelly.curator.model.Neo4jClient;
import com.fulcanelly.curator.model.relations.OnlineBelongsTo;
import com.fulcanelly.curator.model.telegram.OnlineLog;
import com.fulcanelly.curator.model.telegram.TelegramUser;
import com.fulcanelly.curator.services.ClassScannerService;
import com.fulcanelly.curator.services.SingletonService;
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

    @Inject
    SingletonService singletonService;

    public static void main(String[] args) throws Exception {
        new CuratorApp().run();
    }

    @Inject
    void setupListeners(@Named("all") EventBus eventBus, @Named("all") Set<Object> listeners) {
        listeners.forEach(eventBus::register);
    }


    // void okCreateLog(Session session, TelegramUser user) {

    //     var log = new OnlineLog();
    //     session.save(log, 1);

    //     var online = new OnlineBelongsTo().withUser(user).withLog(log);

    //     session.save(online, 1);
    // }


    void okCreateLog(Session session, Long user_) {

       var user = session.load(TelegramUser.class, user_, 0);
        Neo4jSession s = null;

        var ss = s.queryStatementsFor(Class.class, 0);

        System.out.println();
        System.out.println();
        System.out.println("START");

        var log = new OnlineLog().withOnline(true).withUser(user);

        session.save( new OnlineBelongsTo().withLog(new OnlineLog()).withUser(user), 1);
    //     var online = new OnlineBelongsTo().withUser(user).withLog(log);

    //     session.save(online, 1);
    // }
        System.out.println("END");

        System.out.println();
        System.out.println();

    }

    @Inject @SneakyThrows
    void testSessions(Neo4jClient client, ObjectMapper mapper) {
        var session = client.getSession();


        var robert = new TelegramUser().withFirstName("Robert");
        session.save(robert);
        var id = robert.getId();
        robert = null;
        System.gc();

        try {
            for (int i = 0; i <= 100000; i++) {



                okCreateLog(session, id);
                okCreateLog(session, id);
            }
        } finally {
            // var x = session.load(TelegramUser.class, robert.getId(), 1);
            // System.out.println(x.onlineLogs.size());
        }




        // x = session.load(TelegramUser.class, robert.getId(), 1);
        // System.out.println(x.onlineLogs.size());
        // okCreateLog(session, robert);


        // x = session.load(TelegramUser.class, robert.getId(), 1);
        // System.out.println(x.onlineLogs.size());

        // okCreateLog(session, robert);


    //  var y = session.load(TelegramUser.class, robert.getId());
        // System.out.println(x.getOnlineLogs().size());

        // System.out.println(
        //     (session.load(TelegramUser.class, robert.getId()))
        // );

        //     session.save(new OnlineLog().withBelongsTo(robert), 1);
        // System.out.println(
        //     mapper.writeValueAsString(session.load(TelegramUser.class, robert.getId(), 1))
        // );

        //       session.save(new OnlineLog().withBelongsTo(robert), 1);
        // System.out.println(
        //     mapper.writeValueAsString(session.load(TelegramUser.class, robert.getId(), 1))
        // );

    }

    @SneakyThrows
    void run() {
        new ClassScannerService().scan(this.getClass());
        Guice.createInjector(new CuratorModule()).injectMembers(this);

        System.out.println("A");
        var sql = "SELECT * FROM users";
        sql.hashCode();
        if (true) {
            return;
        }
        eventBus.post(new StartupEvent());
        dispatcher.start();
    }

}
