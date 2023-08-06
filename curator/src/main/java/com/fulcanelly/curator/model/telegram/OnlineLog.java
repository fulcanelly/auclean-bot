package com.fulcanelly.curator.model.telegram;

import org.neo4j.ogm.annotation.GeneratedValue;
import org.neo4j.ogm.annotation.Id;
import org.neo4j.ogm.annotation.NodeEntity;
import org.neo4j.ogm.annotation.Relationship;
import org.neo4j.ogm.annotation.Relationship.Direction;

import com.fulcanelly.curator.model.brainfuck.Single;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.With;

@NodeEntity  @Getter @Setter @ToString @With @AllArgsConstructor @NoArgsConstructor
public class OnlineLog {
    @Id @GeneratedValue
    Long id;

    // @Relationship(type="ONLINE_REPORED_BY", direction = Direction.UNDIRECTED)
    transient Single<TelegramSession> reportedBy;


    @Relationship(type="ONLINE_BELONGS_TO", direction = Direction.UNDIRECTED)
    public TelegramUser user;


   // transient  Single<TelegramUser> belongsTo;

    Boolean online;
}
