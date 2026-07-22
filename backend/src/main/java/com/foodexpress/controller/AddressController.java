package com.foodexpress.controller;

import com.foodexpress.dto.address.AddressResponse;
import com.foodexpress.dto.address.CreateAddressRequest;
import com.foodexpress.dto.address.UpdateAddressRequest;
import com.foodexpress.service.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users/{userId}/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    /**
     * 创建地址
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AddressResponse createAddress(
            @PathVariable Long userId,
            @Valid @RequestBody CreateAddressRequest request
    ) {
        return addressService.createAddress(userId, request);
    }

    /**
     * 查询用户的全部地址
     */
    @GetMapping
    public List<AddressResponse> getAddresses(
            @PathVariable Long userId
    ) {
        return addressService.getAddresses(userId);
    }

    /**
     * 修改地址
     */
    @PutMapping("/{addressId}")
    public AddressResponse updateAddress(
            @PathVariable Long userId,
            @PathVariable Long addressId,
            @Valid @RequestBody UpdateAddressRequest request
    ) {
        return addressService.updateAddress(
                userId,
                addressId,
                request
        );
    }

    /**
     * 删除地址
     */
    @DeleteMapping("/{addressId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAddress(
            @PathVariable Long userId,
            @PathVariable Long addressId
    ) {
        addressService.deleteAddress(userId, addressId);
    }

    /**
     * 设置默认地址
     */
    @PatchMapping("/{addressId}/default")
    public AddressResponse setDefaultAddress(
            @PathVariable Long userId,
            @PathVariable Long addressId
    ) {
        return addressService.setDefaultAddress(
                userId,
                addressId
        );
    }
}
