package com.archlens.samples;

import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;

@Component
public class SampleCodebaseProvider {

    public Map<String, String> getECommerceSampleCodebase() {
        Map<String, String> files = new LinkedHashMap<>();

        files.put("OrderController.java", """
            package com.example.ecommerce.controller;

            import com.example.ecommerce.model.Order;
            import com.example.ecommerce.service.OrderService;
            import org.springframework.http.ResponseEntity;
            import org.springframework.web.bind.annotation.*;

            @RestController
            @RequestMapping("/api/v1/orders")
            public class OrderController {

                private final OrderService orderService;

                public OrderController(OrderService orderService) {
                    this.orderService = orderService;
                }

                @PostMapping
                public ResponseEntity<Order> createOrder(@RequestBody Order order) {
                    Order created = orderService.createOrder(order);
                    return ResponseEntity.ok(created);
                }

                @GetMapping("/{id}")
                public ResponseEntity<Order> getOrder(@PathVariable String id) {
                    Order order = orderService.getOrderById(id);
                    return ResponseEntity.ok(order);
                }
            }
            """.stripIndent());

        files.put("AnalyticsController.java", """
            package com.example.ecommerce.controller;

            import com.example.ecommerce.repository.OrderRepository;
            import org.springframework.http.ResponseEntity;
            import org.springframework.web.bind.annotation.*;
            import java.util.Map;

            @RestController
            @RequestMapping("/api/v1/analytics")
            public class AnalyticsController {

                // ARCHITECTURE VIOLATION: Controller directly injecting repository, bypassing service layer!
                private final OrderRepository orderRepository;

                public AnalyticsController(OrderRepository orderRepository) {
                    this.orderRepository = orderRepository;
                }

                @GetMapping("/summary")
                public ResponseEntity<Map<String, Object>> getSummary() {
                    long totalOrders = orderRepository.count();
                    return ResponseEntity.ok(Map.of("totalOrders", totalOrders));
                }
            }
            """.stripIndent());

        files.put("OrderService.java", """
            package com.example.ecommerce.service;

            import com.example.ecommerce.model.Order;
            import com.example.ecommerce.repository.OrderRepository;
            import org.springframework.stereotype.Service;

            @Service
            public class OrderService {

                private final OrderRepository orderRepository;
                private final PaymentService paymentService;
                private final InventoryService inventoryService;

                public OrderService(OrderRepository orderRepository,
                                    PaymentService paymentService,
                                    InventoryService inventoryService) {
                    this.orderRepository = orderRepository;
                    this.paymentService = paymentService;
                    this.inventoryService = inventoryService;
                }

                // MISSING @Transactional boundary violation
                public Order createOrder(Order order) {
                    inventoryService.reserveStock(order.getProductId(), order.getQuantity());
                    paymentService.processPayment(order.getId(), order.getAmount());
                    return orderRepository.save(order);
                }

                public Order getOrderById(String id) {
                    return orderRepository.findById(id).orElse(null);
                }

                public void markOrderPaid(String orderId) {
                    Order order = orderRepository.findById(orderId).orElse(null);
                    if (order != null) {
                        order.setStatus("PAID");
                        orderRepository.save(order);
                    }
                }
            }
            """.stripIndent());

        files.put("PaymentService.java", """
            package com.example.ecommerce.service;

            import com.example.ecommerce.model.Payment;
            import com.example.ecommerce.repository.PaymentRepository;
            import org.springframework.stereotype.Service;

            @Service
            public class PaymentService {

                private final PaymentRepository paymentRepository;
                // CIRCULAR DEPENDENCY: PaymentService calls OrderService while OrderService calls PaymentService!
                private final OrderService orderService;

                public PaymentService(PaymentRepository paymentRepository, OrderService orderService) {
                    this.paymentRepository = paymentRepository;
                    this.orderService = orderService;
                }

                public Payment processPayment(String orderId, double amount) {
                    Payment payment = new Payment(orderId, amount, "SUCCESS");
                    Payment saved = paymentRepository.save(payment);
                    orderService.markOrderPaid(orderId);
                    return saved;
                }
            }
            """.stripIndent());

        files.put("InventoryService.java", """
            package com.example.ecommerce.service;

            import org.springframework.stereotype.Service;

            @Service
            public class InventoryService {

                public boolean reserveStock(String productId, int quantity) {
                    // Simulates inventory check
                    return true;
                }
            }
            """.stripIndent());

        files.put("OrderRepository.java", """
            package com.example.ecommerce.repository;

            import com.example.ecommerce.model.Order;
            import org.springframework.stereotype.Repository;

            @Repository
            public interface OrderRepository {
                Order save(Order order);
                java.util.Optional<Order> findById(String id);
                long count();
            }
            """.stripIndent());

        files.put("PaymentRepository.java", """
            package com.example.ecommerce.repository;

            import com.example.ecommerce.model.Payment;
            import org.springframework.stereotype.Repository;

            @Repository
            public interface PaymentRepository {
                Payment save(Payment payment);
            }
            """.stripIndent());

        files.put("Order.java", """
            package com.example.ecommerce.model;

            import jakarta.persistence.Entity;
            import jakarta.persistence.Id;
            import jakarta.persistence.Table;
            import java.time.Instant;

            @Entity
            @Table(name = "orders")
            public class Order {
                @Id
                private String id;
                private String customerId;
                private String productId;
                private int quantity;
                private double amount;
                private String status;
                private Instant createdAt;

                public Order() {}
                public String getId() { return id; }
                public void setId(String id) { this.id = id; }
                public String getCustomerId() { return customerId; }
                public void setCustomerId(String customerId) { this.customerId = customerId; }
                public String getProductId() { return productId; }
                public void setProductId(String productId) { this.productId = productId; }
                public int getQuantity() { return quantity; }
                public void setQuantity(int quantity) { this.quantity = quantity; }
                public double getAmount() { return amount; }
                public void setAmount(double amount) { this.amount = amount; }
                public String getStatus() { return status; }
                public void setStatus(String status) { this.status = status; }
                public Instant getCreatedAt() { return createdAt; }
                public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
            }
            """.stripIndent());

        files.put("Payment.java", """
            package com.example.ecommerce.model;

            import jakarta.persistence.Entity;
            import jakarta.persistence.Id;
            import jakarta.persistence.Table;

            @Entity
            @Table(name = "payments")
            public class Payment {
                @Id
                private String id;
                private String orderId;
                private double amount;
                private String status;

                public Payment() {}
                public Payment(String orderId, double amount, String status) {
                    this.orderId = orderId;
                    this.amount = amount;
                    this.status = status;
                }
                public String getId() { return id; }
                public void setId(String id) { this.id = id; }
                public String getOrderId() { return orderId; }
                public void setOrderId(String orderId) { this.orderId = orderId; }
                public double getAmount() { return amount; }
                public void setAmount(double amount) { this.amount = amount; }
                public String getStatus() { return status; }
                public void setStatus(String status) { this.status = status; }
            }
            """.stripIndent());

        files.put("OrderNotificationListener.java", """
            package com.example.ecommerce.listener;

            import org.springframework.kafka.annotation.KafkaListener;
            import org.springframework.stereotype.Component;

            @Component
            public class OrderNotificationListener {

                @KafkaListener(topics = "orders.created")
                public void handleOrderCreated(String eventPayload) {
                    System.out.println("Processing async notification for: " + eventPayload);
                }
            }
            """.stripIndent());

        return files;
    }
}
