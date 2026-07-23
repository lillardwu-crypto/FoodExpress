package com.foodexpress.service;

import com.foodexpress.dto.address.AddressResponse;
import com.foodexpress.dto.address.CreateAddressRequest;
import com.foodexpress.dto.address.UpdateAddressRequest;
import com.foodexpress.entity.Address;
import com.foodexpress.entity.User;
import com.foodexpress.exception.ResourceNotFoundException;
import com.foodexpress.repository.AddressRepository;
import com.foodexpress.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    /**
     * 创建地址
     */
    @Transactional
    public AddressResponse createAddress(
            String email,
            CreateAddressRequest request
    ) {
        User user = getUserByEmail(email);
        Long userId = user.getId();

        List<Address> existingAddresses =
                addressRepository.findByUserId(userId);

        /*
         * 第一条地址自动设为默认地址。
         * 如果用户主动要求设置为默认地址，也需要取消原默认地址。
         */
        boolean shouldBeDefault =
                existingAddresses.isEmpty()
                        || request.isDefaultAddress();

        if (shouldBeDefault) {
            clearCurrentDefaultAddress(existingAddresses);
        }

        Address address = Address.builder()
                .user(user)
                .label(request.getLabel())
                .recipientName(request.getRecipientName())
                .phone(request.getPhone())
                .street(request.getStreet())
                .city(request.getCity())
                .state(request.getState())
                .zipCode(request.getZipCode())
                .isDefault(shouldBeDefault)
                .build();

        Address savedAddress = addressRepository.save(address);

        return buildAddressResponse(savedAddress);
    }

    /**
     * 查询当前登录用户的全部地址
     */
    @Transactional(readOnly = true)
    public List<AddressResponse> getAddresses(String email) {
        User user = getUserByEmail(email);

        return addressRepository.findByUserId(user.getId())
                .stream()
                .map(this::buildAddressResponse)
                .toList();
    }

    /**
     * 修改地址
     */
    @Transactional
    public AddressResponse updateAddress(
            String email,
            Long addressId,
            UpdateAddressRequest request
    ) {
        User user = getUserByEmail(email);
        Long userId = user.getId();

        Address address = getAddressOwnedByUser(
                addressId,
                userId
        );

        /*
         * 如果当前地址要被设置为默认地址，
         * 先取消该用户原来的默认地址。
         */
        if (request.isDefaultAddress() && !address.isDefault()) {
            List<Address> existingAddresses =
                    addressRepository.findByUserId(userId);

            clearCurrentDefaultAddress(existingAddresses);
            address.setDefault(true);
        }

        /*
         * 如果当前地址不是默认地址，
         * request 中传 false 时继续保持 false。
         *
         * 如果当前地址已经是默认地址，
         * 不通过普通 update 将它取消，避免用户没有默认地址。
         * 更换默认地址使用 setDefaultAddress 方法。
         */
        address.setLabel(request.getLabel());
        address.setRecipientName(request.getRecipientName());
        address.setPhone(request.getPhone());
        address.setStreet(request.getStreet());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setZipCode(request.getZipCode());

        Address updatedAddress =
                addressRepository.save(address);

        return buildAddressResponse(updatedAddress);
    }

    /**
     * 删除地址
     */
    @Transactional
    public void deleteAddress(
            String email,
            Long addressId
    ) {
        User user = getUserByEmail(email);
        Long userId = user.getId();

        Address address = getAddressOwnedByUser(
                addressId,
                userId
        );

        boolean wasDefaultAddress = address.isDefault();

        addressRepository.delete(address);
        addressRepository.flush();

        /*
         * 如果删除的是默认地址，
         * 从剩余地址中选择一条作为新的默认地址。
         */
        if (wasDefaultAddress) {
            List<Address> remainingAddresses =
                    addressRepository.findByUserId(userId);

            if (!remainingAddresses.isEmpty()) {
                Address newDefaultAddress =
                        remainingAddresses.get(0);

                newDefaultAddress.setDefault(true);
                addressRepository.save(newDefaultAddress);
            }
        }
    }

    /**
     * 单独设置默认地址
     */
    @Transactional
    public AddressResponse setDefaultAddress(
            String email,
            Long addressId
    ) {
        User user = getUserByEmail(email);
        Long userId = user.getId();

        Address targetAddress =
                getAddressOwnedByUser(
                        addressId,
                        userId
                );

        if (targetAddress.isDefault()) {
            return buildAddressResponse(targetAddress);
        }

        List<Address> existingAddresses =
                addressRepository.findByUserId(userId);

        clearCurrentDefaultAddress(existingAddresses);

        targetAddress.setDefault(true);

        Address savedAddress =
                addressRepository.save(targetAddress);

        return buildAddressResponse(savedAddress);
    }

    /**
     * 根据 JWT 中的 email 查询当前登录用户
     */
    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with email: "
                                        + email
                        )
                );
    }

    /**
     * 查询地址，同时验证地址属于当前用户
     */
    private Address getAddressOwnedByUser(
            Long addressId,
            Long userId
    ) {
        return addressRepository
                .findByIdAndUserId(addressId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Address not found with id: "
                                        + addressId
                        )
                );
    }

    /**
     * 取消用户当前的默认地址
     */
    private void clearCurrentDefaultAddress(
            List<Address> addresses
    ) {
        for (Address address : addresses) {
            if (address.isDefault()) {
                address.setDefault(false);
            }
        }

        addressRepository.saveAll(addresses);
    }

    /**
     * Entity -> Response DTO
     */
    private AddressResponse buildAddressResponse(
            Address address
    ) {
        return AddressResponse.builder()
                .addressId(address.getId())
                .label(address.getLabel())
                .recipientName(address.getRecipientName())
                .phone(address.getPhone())
                .street(address.getStreet())
                .city(address.getCity())
                .state(address.getState())
                .zipCode(address.getZipCode())
                .defaultAddress(address.isDefault())
                .createdAt(address.getCreatedAt())
                .updatedAt(address.getUpdatedAt())
                .build();
    }
}
