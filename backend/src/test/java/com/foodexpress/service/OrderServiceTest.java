package com.foodexpress.service;

import com.foodexpress.dto.order.OrderResponse;
import com.foodexpress.dto.tracking.OrderTrackingMessage;
import com.foodexpress.entity.Order;
import com.foodexpress.entity.OrderStatus;
import com.foodexpress.entity.Restaurant;
import com.foodexpress.entity.User;
import com.foodexpress.exception.ConflictException;
import com.foodexpress.exception.ResourceNotFoundException;
import com.foodexpress.repository.AddressRepository;
import com.foodexpress.repository.CartItemRepository;
import com.foodexpress.repository.CartRepository;
import com.foodexpress.repository.OrderRepository;
import com.foodexpress.repository.RestaurantRepository;
import com.foodexpress.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    private static final String EMAIL =
            "day9test@example.com";

    private static final Long USER_ID =
            1L;

    private static final Long RESTAURANT_ID =
            1L;

    private static final Long ORDER_ID =
            1L;

    private static final String TRACKING_DESTINATION =
            "/topic/orders/" + ORDER_ID;

    @Mock
    private RestaurantRepository restaurantRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private CartRepository cartRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AddressRepository addressRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @Mock
    private User user;

    private OrderService orderService;

    @BeforeEach
    void setUp() {
        orderService = new OrderService(
                orderRepository,
                cartRepository,
                cartItemRepository,
                userRepository,
                addressRepository,
                restaurantRepository,
                messagingTemplate
        );
    }

    /**
     * 测试 Customer 可以取消 PENDING 状态订单。
     *
     * PENDING -> CANCELLED
     */
    @Test
    void cancelCustomerOrder_shouldCancelPendingOrder() {
        when(userRepository.findByEmail(EMAIL))
                .thenReturn(
                        Optional.of(user)
                );

        when(user.getId())
                .thenReturn(USER_ID);

        Order order = createOrder(
                OrderStatus.PENDING
        );

        when(orderRepository.findById(ORDER_ID))
                .thenReturn(
                        Optional.of(order)
                );

        when(orderRepository.save(order))
                .thenReturn(order);

        OrderResponse response =
                orderService.cancelCustomerOrder(
                        EMAIL,
                        ORDER_ID
                );

        assertEquals(
                OrderStatus.CANCELLED,
                order.getStatus()
        );

        assertEquals(
                OrderStatus.CANCELLED,
                response.getStatus()
        );

        assertEquals(
                ORDER_ID,
                response.getOrderId()
        );

        verify(orderRepository)
                .save(order);

        verify(messagingTemplate)
                .convertAndSend(
                        eq(TRACKING_DESTINATION),
                        any(
                                OrderTrackingMessage.class
                        )
                );
    }

    /**
     * 测试 Customer 可以取消 ACCEPTED 状态订单。
     *
     * ACCEPTED -> CANCELLED
     */
    @Test
    void cancelCustomerOrder_shouldCancelAcceptedOrder() {
        when(userRepository.findByEmail(EMAIL))
                .thenReturn(
                        Optional.of(user)
                );

        when(user.getId())
                .thenReturn(USER_ID);

        Order order = createOrder(
                OrderStatus.ACCEPTED
        );

        when(orderRepository.findById(ORDER_ID))
                .thenReturn(
                        Optional.of(order)
                );

        when(orderRepository.save(order))
                .thenReturn(order);

        OrderResponse response =
                orderService.cancelCustomerOrder(
                        EMAIL,
                        ORDER_ID
                );

        assertEquals(
                OrderStatus.CANCELLED,
                order.getStatus()
        );

        assertEquals(
                OrderStatus.CANCELLED,
                response.getStatus()
        );

        verify(orderRepository)
                .save(order);

        verify(messagingTemplate)
                .convertAndSend(
                        eq(TRACKING_DESTINATION),
                        any(
                                OrderTrackingMessage.class
                        )
                );
    }

    /**
     * 测试 Customer 不能取消 DELIVERED 状态订单。
     *
     * DELIVERED -> CANCELLED 不合法。
     */
    @Test
    void cancelCustomerOrder_shouldRejectDeliveredOrder() {
        when(userRepository.findByEmail(EMAIL))
                .thenReturn(
                        Optional.of(user)
                );

        when(user.getId())
                .thenReturn(USER_ID);

        Order order = createOrder(
                OrderStatus.DELIVERED
        );

        when(orderRepository.findById(ORDER_ID))
                .thenReturn(
                        Optional.of(order)
                );

        assertThrows(
                ConflictException.class,
                () ->
                        orderService.cancelCustomerOrder(
                                EMAIL,
                                ORDER_ID
                        )
        );

        assertEquals(
                OrderStatus.DELIVERED,
                order.getStatus()
        );

        verify(
                orderRepository,
                never()
        ).save(
                any(Order.class)
        );

        verify(
                messagingTemplate,
                never()
        ).convertAndSend(
                any(String.class),
                any(
                        OrderTrackingMessage.class
                )
        );
    }

    /**
     * 测试 Customer 不能取消 PREPARING 状态订单。
     *
     * PREPARING -> CANCELLED 不合法。
     */
    @Test
    void cancelCustomerOrder_shouldRejectPreparingOrder() {
        when(userRepository.findByEmail(EMAIL))
                .thenReturn(
                        Optional.of(user)
                );

        when(user.getId())
                .thenReturn(USER_ID);

        Order order = createOrder(
                OrderStatus.PREPARING
        );

        when(orderRepository.findById(ORDER_ID))
                .thenReturn(
                        Optional.of(order)
                );

        assertThrows(
                ConflictException.class,
                () ->
                        orderService.cancelCustomerOrder(
                                EMAIL,
                                ORDER_ID
                        )
        );

        assertEquals(
                OrderStatus.PREPARING,
                order.getStatus()
        );

        verify(
                orderRepository,
                never()
        ).save(
                any(Order.class)
        );

        verify(
                messagingTemplate,
                never()
        ).convertAndSend(
                any(String.class),
                any(
                        OrderTrackingMessage.class
                )
        );
    }

    /**
     * 测试取消不存在的订单：
     * 应抛出 ResourceNotFoundException。
     */
    @Test
    void cancelCustomerOrder_shouldThrowWhenOrderNotFound() {
        when(userRepository.findByEmail(EMAIL))
                .thenReturn(
                        Optional.of(user)
                );

        when(user.getId())
                .thenReturn(USER_ID);

        when(orderRepository.findById(999L))
                .thenReturn(
                        Optional.empty()
                );

        assertThrows(
                ResourceNotFoundException.class,
                () ->
                        orderService.cancelCustomerOrder(
                                EMAIL,
                                999L
                        )
        );

        verify(
                orderRepository,
                never()
        ).save(
                any(Order.class)
        );

        verify(
                messagingTemplate,
                never()
        ).convertAndSend(
                any(String.class),
                any(
                        OrderTrackingMessage.class
                )
        );
    }

    /**
     * 创建测试使用的完整 Order。
     *
     * 因为 cancelCustomerOrder() 最后会调用
     * buildOrderResponse()，所以成功测试需要提供
     * Restaurant、Items 和订单金额等字段。
     */
    private Order createOrder(
            OrderStatus status
    ) {
        Restaurant restaurant =
                Restaurant.builder()
                        .id(RESTAURANT_ID)
                        .name("Test Restaurant")
                        .build();

        return Order.builder()
                .id(ORDER_ID)
                .user(user)
                .restaurant(restaurant)
                .status(status)
                .totalPrice(
                        new BigDecimal("25.98")
                )
                .items(
                        new ArrayList<>()
                )
                .deliveryRecipientName(
                        "Test User"
                )
                .deliveryPhone(
                        "6171234567"
                )
                .deliveryStreet(
                        "123 Test Street"
                )
                .deliveryCity(
                        "Boston"
                )
                .deliveryState(
                        "MA"
                )
                .deliveryZipCode(
                        "02118"
                )
                .build();
    }
}
