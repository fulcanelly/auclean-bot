package com.fulcanelly.curator.services;

import com.google.common.eventbus.EventBus;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.google.inject.name.Named;

import lombok.Data;
import lombok.Getter;

@Data @Singleton
public class SingletonService {

    SingletonService() {
        SingletonService.instance = this;
    }

    @Getter
    public static SingletonService instance;

    @Inject
    @Named("all")
    EventBus mainBus;
}
