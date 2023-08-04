package com.fulcanelly.curator.messaging.events;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class LoginSuccessEvent {
    @JsonProperty("session_name")
    String sessionName;

    @JsonProperty("user_id")
    String userId;

    @JsonProperty("linked_to")
    String linkedTo;
}
