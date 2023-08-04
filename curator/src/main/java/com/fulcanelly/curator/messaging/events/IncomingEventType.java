package com.fulcanelly.curator.messaging.events;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum IncomingEventType implements EventExtractable<CuratorEvent> {
    @JsonProperty("login_success")
    LOGIN_SUCCESS {

        @Override
        public Object extractEvent(CuratorEvent event) {
            return event.getLoginSuccess();
        }

    },
    @JsonProperty("login_init")
    LOGIN_INIT {

        @Override
        public Object extractEvent(CuratorEvent event) {
            return event.getLoginInit();
        }

    }
}
