
package com.fulcanelly.curator.model.telegram;

import org.neo4j.ogm.annotation.GeneratedValue;
import org.neo4j.ogm.annotation.Id;
import org.neo4j.ogm.annotation.NodeEntity;
import org.neo4j.ogm.annotation.PostLoad;
import org.neo4j.ogm.annotation.Property;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.With;

@NodeEntity @Getter @Setter @ToString @NoArgsConstructor @AllArgsConstructor @With
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

