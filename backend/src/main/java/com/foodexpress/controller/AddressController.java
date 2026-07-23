package com.foodexpress.controller;

import com.foodexpress.dto.address.AddressResponse;
import com.foodexpress.dto.address.CreateAddressRequest;
import com.foodexpress.dto.address.UpdateAddressRequest;
import com.foodexpress.service.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    /**
     * 创建地址
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AddressResponse createAddress(
            Authentication authentication,
            @Valid @RequestBody CreateAddressRequest request
    ) {
        return addressService.createAddress(
            authentication.getName(),
            request
    );
    }

    /**
     * 查询用户的全部地址
     */
    @GetMapping
    public List<AddressResponse> getAddresses(
        Authentication authentication
    ) {
        return addressService.getAddresses(authentication.getName());
    }

    /**
     * 修改地址
     */
    @PutMapping("/{addressId}")
    public AddressResponse updateAddress(
            Authentication authentication,
            @PathVariable Long addressId,
            @Valid @RequestBody UpdateAddressRequest request
    ) {
        return addressService.updateAddress(
                authentication.getName(),
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
            Authentication authentication,
            @PathVariable Long addressId
    ) {
        addressService.deleteAddress(authentication.getName(), addressId);
    }

    /**
     * 设置默认地址
     */
    @PatchMapping("/{addressId}/default")
    public AddressResponse setDefaultAddress(
            Authentication authentication,
            @PathVariable Long addressId
    ) {
        return addressService.setDefaultAddress(
                authentication.getName(),
                addressId
        );
    }
}
