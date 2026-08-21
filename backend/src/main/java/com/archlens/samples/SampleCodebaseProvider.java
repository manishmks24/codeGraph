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

    public Map<String, String> getNextJsExpressSampleCodebase() {
        Map<String, String> files = new LinkedHashMap<>();

        files.put("src/controllers/PaymentController.ts", """
            import { PaymentService } from '../services/PaymentService';
            import { StripeClient } from '../services/StripeClient';

            export class PaymentController {
                constructor(private paymentService: PaymentService) {}

                async checkout(req: any, res: any) {
                    const session = await this.paymentService.createSession(req.body);
                    return res.json(session);
                }
            }
            """.stripIndent());

        files.put("src/services/PaymentService.ts", """
            import { OrderRepository } from '../repositories/OrderRepository';
            import { StripeClient } from './StripeClient';
            import { NotificationService } from './NotificationService';

            export class PaymentService {
                constructor(
                    private orderRepository: OrderRepository,
                    private stripeClient: StripeClient,
                    private notificationService: NotificationService
                ) {}

                async createSession(data: any) {
                    const order = await this.orderRepository.findById(data.orderId);
                    const charge = await this.stripeClient.charge(order);
                    await this.notificationService.sendReceipt(order);
                    return charge;
                }
            }
            """.stripIndent());

        files.put("src/services/StripeClient.ts", """
            export class StripeClient {
                async charge(order: any) {
                    return { id: 'ch_123', status: 'SUCCESS' };
                }
            }
            """.stripIndent());

        files.put("src/services/NotificationService.ts", """
            import { OrderRepository } from '../repositories/OrderRepository';

            export class NotificationService {
                constructor(private orderRepository: OrderRepository) {}

                async sendReceipt(order: any) {
                    console.log('Sending receipt for order', order);
                }
            }
            """.stripIndent());

        files.put("src/repositories/OrderRepository.ts", """
            import { Order } from '../models/Order';

            export class OrderRepository {
                async findById(id: string): Promise<Order | null> {
                    return null;
                }

                async save(order: Order): Promise<Order> {
                    return order;
                }
            }
            """.stripIndent());

        files.put("src/models/Order.ts", """
            export class Order {
                id: string;
                userId: string;
                amount: number;
                status: string;
                createdAt: Date;
            }
            """.stripIndent());

        files.put("src/app/api/checkout/route.ts", """
            import { PaymentController } from '../../../controllers/PaymentController';

            export async function POST(request: Request) {
                return Response.json({ status: 'OK' });
            }

            export async function GET(request: Request) {
                return Response.json({ activeSessions: [] });
            }
            """.stripIndent());

        return files;
    }

    public Map<String, String> getFastApiAiSampleCodebase() {
        Map<String, String> files = new LinkedHashMap<>();

        files.put("app/routers/agent_router.py", """
            from fastapi import APIRouter, Depends
            from app.services.rag_agent_service import RagAgentService
            from app.models.query_request import QueryRequest

            router = APIRouter(prefix="/api/v1/agent")

            @router.post("/query")
            async def query_agent(req: QueryRequest, agent_service: RagAgentService = Depends()):
                return await agent_service.execute_query(req.prompt, req.user_id)

            @router.get("/status/{task_id}")
            async def get_task_status(task_id: str):
                return {"task_id": task_id, "status": "COMPLETED"}
            """.stripIndent());

        files.put("app/services/rag_agent_service.py", """
            from app.repositories.vector_store_repository import VectorStoreRepository
            from app.services.llm_inference_service import LlmInferenceService
            from app.repositories.user_session_repository import UserSessionRepository

            class RagAgentService:
                def __init__(self, vector_store: VectorStoreRepository, llm: LlmInferenceService, session_repo: UserSessionRepository):
                    self.vector_store = vector_store
                    self.llm = llm
                    self.session_repo = session_repo

                async def execute_query(self, prompt: str, user_id: str):
                    context = await self.vector_store.similarity_search(prompt)
                    response = await self.llm.generate(prompt, context)
                    await self.session_repo.record_interaction(user_id, prompt, response)
                    return response
            """.stripIndent());

        files.put("app/services/llm_inference_service.py", """
            class LlmInferenceService:
                async def generate(self, prompt: str, context: list):
                    return {"answer": "Synthesized AI response"}
            """.stripIndent());

        files.put("app/repositories/vector_store_repository.py", """
            class VectorStoreRepository:
                async def similarity_search(self, query: str):
                    return ["Relevant chunk A", "Relevant chunk B"]
            """.stripIndent());

        files.put("app/repositories/user_session_repository.py", """
            from app.models.user_session import UserSession

            class UserSessionRepository:
                async def record_interaction(self, user_id: str, prompt: str, response: dict):
                    pass
            """.stripIndent());

        files.put("app/models/user_session.py", """
            class UserSession:
                id: str
                user_id: str
                interaction_count: int
            """.stripIndent());

        files.put("app/models/query_request.py", """
            class QueryRequest:
                prompt: str
                user_id: str
            """.stripIndent());

        return files;
    }

    public Map<String, String> getSampleCodebase(String type) {
        if (type == null) return getECommerceSampleCodebase();
        return switch (type.toLowerCase().trim()) {
            case "nextjs", "typescript", "react" -> getNextJsExpressSampleCodebase();
            case "fastapi", "python", "ai" -> getFastApiAiSampleCodebase();
            default -> getECommerceSampleCodebase();
        };
    }

    public String getSampleProjectName(String type) {
        if (type == null) return "E-Commerce Order & Payment Microservice";
        return switch (type.toLowerCase().trim()) {
            case "nextjs", "typescript", "react" -> "Next.js & Express Fullstack API";
            case "fastapi", "python", "ai" -> "FastAPI Generative AI Agent Service";
            default -> "E-Commerce Order & Payment Microservice";
        };
    }
}
