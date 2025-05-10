package com.example.cosmeticsshop.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.example.cosmeticsshop.domain.Product;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    Product findByName(String name);

    boolean existsByName(String name);

    Page<Product> findByCategoryId(Long id, Pageable pageable);

    Page<Product> findByIdNotIn(List<Long> ids, Pageable pageable);
}
