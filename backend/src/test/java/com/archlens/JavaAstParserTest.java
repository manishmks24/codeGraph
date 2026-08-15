package com.archlens;

import com.archlens.model.CodeNode;
import com.archlens.model.NodeType;
import com.archlens.parser.JavaAstParser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class JavaAstParserTest {

    private JavaAstParser parser;

    @BeforeEach
    public void setUp() {
        parser = new JavaAstParser();
    }

    @Test
    public void testParseRestControllerAndEndpoints() {
        String code = """
            package com.example.demo;
            import org.springframework.web.bind.annotation.*;

            @RestController
            public class UserController {
                @GetMapping("/users")
                public String getUsers() {
                    return "users";
                }
            }
            """;

        JavaAstParser.ParsedFileResult result = parser.parseJavaCode("UserController.java", code);

        assertNotNull(result);
        assertFalse(result.getNodes().isEmpty());

        CodeNode controllerNode = result.getNodes().stream()
                .filter(n -> n.getType() == NodeType.CONTROLLER)
                .findFirst()
                .orElse(null);

        assertNotNull(controllerNode);
        assertEquals("UserController", controllerNode.getName());
        assertEquals("com.example.demo", controllerNode.getPackageName());

        CodeNode endpointNode = result.getNodes().stream()
                .filter(n -> n.getType() == NodeType.ENDPOINT)
                .findFirst()
                .orElse(null);

        assertNotNull(endpointNode);
        assertTrue(endpointNode.getName().contains("/users") || endpointNode.getSignature().contains("/users"));
    }

    @Test
    public void testParseServiceAndDependencies() {
        String code = """
            package com.example.demo;
            import org.springframework.stereotype.Service;

            @Service
            public class PaymentService {
                private final OrderRepository orderRepository;

                public PaymentService(OrderRepository orderRepository) {
                    this.orderRepository = orderRepository;
                }

                public void pay() {
                    orderRepository.save();
                }
            }
            """;

        JavaAstParser.ParsedFileResult result = parser.parseJavaCode("PaymentService.java", code);

        assertNotNull(result);
        assertTrue(result.getFieldTypes().contains("OrderRepository"));
    }
}
