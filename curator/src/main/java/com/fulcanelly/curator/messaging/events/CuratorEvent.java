package com.fulcanelly.curator.messaging.events;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class CuratorEvent {
    @JsonProperty("event")
    public IncomingEventType eventType;

    @JsonProperty("login_success")
    LoginSuccessEvent loginSuccess;

    @JsonProperty("login_init")
    LoginInitEvent loginInit;
}
