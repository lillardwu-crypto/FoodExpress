package com.foodexpress.service;

import com.foodexpress.entity.Order;
import com.foodexpress.entity.OrderStatus;
import com.foodexpress.exception.ConflictException;
import com.foodexpress.exception.ResourceNotFoundException;
import com.foodexpress.repository.AddressRepository;
import com.foodexpress.repository.CartItemRepository;
import com.foodexpress.repository.CartRepository;
import com.foodexpress.repository.OrderRepository;
import com.foodexpress.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

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

    private OrderService orderService;

    @BeforeEach
    void setUp() {
        orderService = new OrderService(
                orderRepository,
                cartRepository,
                cartItemRepository,
                userRepository,
                addressRepository
        );
    }

    /**
     * 测试非法订单状态流转：
     * DELIVERED 订单不能重新变成 PREPARING。
     */
    @Test
    void updateOrderStatus_shouldRejectInvalidTransition() {

        Order order = Order.builder()
                .status(OrderStatus.DELIVERED)
                .build();

        when(orderRepository.findById(1L))
                .thenReturn(Optional.of(order));

        assertThrows(
                ConflictException.class,
                () -> orderService.updateOrderStatus(
                        1L,
                        OrderStatus.PREPARING
                )
        );

        verify(orderRepository, never())
                .save(any(Order.class));
    }

    /**
     * 测试更新不存在的订单：
     * 应抛出 ResourceNotFoundException。
     */
    @Test
    void updateOrderStatus_shouldThrowWhenOrderNotFound() {

        when(orderRepository.findById(999L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> orderService.updateOrderStatus(
                        999L,
                        OrderStatus.ACCEPTED
                )
        );

        verify(orderRepository, never())
                .save(any(Order.class));
    }
}
