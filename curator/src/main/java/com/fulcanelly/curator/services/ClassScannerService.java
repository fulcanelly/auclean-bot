package com.fulcanelly.curator.services;

import java.io.File;

import io.github.classgraph.ClassGraph;
import io.github.classgraph.ScanResult;
import lombok.SneakyThrows;

public class ClassScannerService {
    @SneakyThrows
    public void scan(Class<?> clazz) {
        try (ScanResult scanResult = new ClassGraph().enableAllInfo().acceptPackages(clazz.getPackageName())
                .scan()) {
            var allClasses = scanResult.getAllClasses();
            var file = new File("classgraph.dot");

            allClasses.generateGraphVizDotFile(file);

        }
    }
}
