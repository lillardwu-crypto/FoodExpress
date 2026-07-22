package com.foodexpress.dto.address;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AddressResponse {

    private Long addressId;

    private String label;

    private String recipientName;

    private String phone;

    private String street;

    private String city;

    private String state;

    private String zipCode;

    private boolean defaultAddress;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
