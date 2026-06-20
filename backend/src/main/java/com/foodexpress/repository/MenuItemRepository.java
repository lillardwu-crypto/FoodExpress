package com.foodexpress.repository;

import com.foodexpress.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MenuItemRepository
        extends JpaRepository<MenuItem, Long> {

}
