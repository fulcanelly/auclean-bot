package com.fulcanelly.curator.messaging.events;

public interface EventExtractable<T> {
    Object extractEvent(T object);
}
