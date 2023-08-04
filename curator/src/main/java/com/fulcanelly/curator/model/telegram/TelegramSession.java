package com.fulcanelly.curator.model.telegram;

import org.neo4j.ogm.annotation.NodeEntity;
import org.neo4j.ogm.annotation.PostLoad;

import lombok.Data;

@NodeEntity @Data
public class TelegramSession {
    @PostLoad
    void postLoad() {

    }
    
    String sessionPath;

    String username;

    String chatId;
}
