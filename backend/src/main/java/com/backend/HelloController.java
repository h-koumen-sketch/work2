package com.backend;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * HelloControllerクラス。
 * <p>
 * サンプルのHello World APIを提供します。
 */
@RestController
public class HelloController {
    @GetMapping("/hello")

    public String hello() {
        return "Hello World";
    }
}
