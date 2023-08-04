package com.fulcanelly.curator.model;

import org.neo4j.ogm.session.event.Event;
import org.neo4j.ogm.session.event.EventListener;

public class CallbackLoggerListener implements EventListener {
    @Override
    public void onPreSave(Event event) {
        System.out.println("presave ");
    }

    @Override
    public void onPostSave(Event event) {
        System.out.println("postsave ");

    }

    @Override
    public void onPreDelete(Event event) {
        System.out.println("predel");

    }

    @Override
    public void onPostDelete(Event event) {
        System.out.println("postdel");

    }
}
