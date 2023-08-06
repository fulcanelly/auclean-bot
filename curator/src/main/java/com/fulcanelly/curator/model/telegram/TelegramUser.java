package com.fulcanelly.curator.model.telegram;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.neo4j.ogm.annotation.GeneratedValue;
import org.neo4j.ogm.annotation.Id;
import org.neo4j.ogm.annotation.NodeEntity;
import org.neo4j.ogm.annotation.Relationship;
import org.neo4j.ogm.annotation.Transient;
import org.neo4j.ogm.annotation.Relationship.Direction;

import com.fulcanelly.curator.model.brainfuck.Many;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.With;


@NodeEntity @Getter @Setter @ToString @With @AllArgsConstructor @NoArgsConstructor
public class TelegramUser {
    @Id @GeneratedValue
    Long id;

    String userId;

    String firstName;
    String username;

    @Relationship(type="ONLINE_BELONGS_TO", direction = Direction.UNDIRECTED)
    public Iterable<OnlineLog> onlineLogs = new HashSet<>();
    // transient Many<OnlineLog> onlineLogs = new Many<>(this, "ONLINE_LOGGED_BY");
}
