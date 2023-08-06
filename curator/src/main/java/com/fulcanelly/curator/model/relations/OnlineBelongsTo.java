package com.fulcanelly.curator.model.relations;

import org.neo4j.ogm.annotation.EndNode;
import org.neo4j.ogm.annotation.GeneratedValue;
import org.neo4j.ogm.annotation.Id;
import org.neo4j.ogm.annotation.RelationshipEntity;
import org.neo4j.ogm.annotation.StartNode;

import com.fulcanelly.curator.model.telegram.OnlineLog;
import com.fulcanelly.curator.model.telegram.TelegramUser;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.With;

@Getter @Setter @ToString
@RelationshipEntity(type = "ONLINE_BELONGS_TO")
@AllArgsConstructor
@NoArgsConstructor
@With
public class OnlineBelongsTo {

    @Id
    @GeneratedValue
    Long id;

    @StartNode
    TelegramUser user;

    @EndNode
    OnlineLog log;

}
