package com.fulcanelly.curator;

import com.fulcanelly.curator.config.CuratorModule;
import com.fulcanelly.curator.messaging.RabbitMQRequestDispatcher;
import com.google.inject.Guice;
import com.google.inject.Inject;

import lombok.SneakyThrows;


public class CuratorApp {
    @Inject
    RabbitMQRequestDispatcher hz;
    public static void main(String[] args) throws Exception {
        new CuratorApp().run();
    }

    @SneakyThrows
    void run() {
        var i = Guice.createInjector(new CuratorModule());

        i.injectMembers(this);
                hz.start();

        i.getAllBindings();
        for (var k : i.getAllBindings().entrySet()) {
            var key = k.getKey();
            var value = k.getValue().getProvider().get();

            System.out.println(key);
            System.out.println(":");
            System.out.println(value);
            System.out.println();
        }

        // while (true) {
        //     Thread.sleep(2300);
        // }
    }


}



