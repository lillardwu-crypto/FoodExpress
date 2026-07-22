package com.foodexpress.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice;

    /*
     * Delivery Address Snapshot
     *
     * Checkout 时从 Address 复制过来。
     * 不与 Address 建立外键关系。
     * 即使用户之后修改或删除地址，
     * 历史订单中的配送地址仍然保持不变。
     */

    @Column(
        name = "delivery_recipient_name",
        nullable = false
    )
    private String deliveryRecipientName;

    @Column(
        name = "delivery_phone",
        nullable = false
    )
    private String deliveryPhone;

    @Column(
        name = "delivery_street",
        nullable = false
    )
    private String deliveryStreet;

    @Column(
        name = "delivery_city",
        nullable = false
    )
    private String deliveryCity;

    @Column(
        name = "delivery_state",
        nullable = false
    )
    private String deliveryState;

    @Column(
        name = "delivery_zip_code",
        nullable = false
    )
    private String deliveryZipCode;

    @OneToMany(
        mappedBy = "order",
        cascade = CascadeType.ALL,
        orphanRemoval = true
    )
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public void addItem(OrderItem orderItem) {
        items.add(orderItem);
        orderItem.setOrder(this);
    }

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();

        createdAt = now;
        updatedAt = now;

        if (status == null) {
            status = OrderStatus.PENDING;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}