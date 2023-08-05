
package com.fulcanelly.curator.model.telegram;

import java.util.UUID;

import org.neo4j.ogm.annotation.GeneratedValue;
import org.neo4j.ogm.annotation.Id;
import org.neo4j.ogm.annotation.NodeEntity;
import org.neo4j.ogm.annotation.PostLoad;
import org.neo4j.ogm.annotation.Property;
import org.neo4j.ogm.id.UuidStrategy;

import com.fulcanelly.curator.events.SessionsRequestEvent;
import com.fulcanelly.curator.services.SingletonService;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.With;

@NodeEntity @Data @NoArgsConstructor @AllArgsConstructor @With
public class TelegramSession {
    @Id @GeneratedValue
    Long id;

    @PostLoad
    void postLoad() {
        // SingletonService.getInstance().getMainBus()
        //     .post(new SessionsRequestEvent());
        System.out.println("post load");
    }

    @Property(name="session_name")

    String sessionName;

    String phoneNum;

    String username;

    @Property(name="user_id")
    String userId;
}

