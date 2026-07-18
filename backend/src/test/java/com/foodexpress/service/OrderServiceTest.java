package com.foodexpress.service;

import com.foodexpress.entity.Order;
import com.foodexpress.entity.OrderStatus;
import com.foodexpress.exception.BadRequestException;
import com.foodexpress.exception.ResourceNotFoundException;
import com.foodexpress.repository.CartItemRepository;
import com.foodexpress.repository.CartRepository;
import com.foodexpress.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private CartRepository cartRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    private OrderService orderService;

    @BeforeEach
    void setUp() {
        orderService = new OrderService(
                orderRepository,
                cartRepository,
                cartItemRepository
        );
    }

    @Test
    void updateOrderStatus_shouldRejectInvalidTransition() {

        Order order = Order.builder()
                .status(OrderStatus.DELIVERED)
                .build();

        when(orderRepository.findById(1L))
                .thenReturn(Optional.of(order));

        assertThrows(
                BadRequestException.class,
                () -> orderService.updateOrderStatus(
                        1L,
                        OrderStatus.PREPARING
                )
        );

        verify(orderRepository, never()).save(any(Order.class));
    }

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

        verify(orderRepository, never()).save(any(Order.class));
    }
}
