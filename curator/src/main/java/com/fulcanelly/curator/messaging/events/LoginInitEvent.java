package com.fulcanelly.curator.messaging.events;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class LoginInitEvent {

    @JsonProperty("user_id")
    String userId;

    @JsonProperty("linked_to")
    String linkedTo;
}
