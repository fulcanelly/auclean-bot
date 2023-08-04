
package com.fulcanelly.curator.model.telegram;

import org.neo4j.ogm.annotation.GeneratedValue;
import org.neo4j.ogm.annotation.Id;
import org.neo4j.ogm.annotation.NodeEntity;
import org.neo4j.ogm.annotation.PostLoad;
import org.neo4j.ogm.annotation.Property;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.With;

@NodeEntity @Data @NoArgsConstructor @AllArgsConstructor @With
public class TelegramSession {
    @Id @GeneratedValue
    protected long id;

    @PostLoad
    void postLoad() {
        
        System.out.println("post load");
    }

    @Property(name="session_name")

    String sessionName;

    String username;

    @Property(name="user_id")
    String userId;
}

