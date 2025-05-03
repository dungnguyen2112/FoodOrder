package com.example.cosmeticsshop.service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.example.cosmeticsshop.domain.Category;
import com.example.cosmeticsshop.domain.Product;
import com.example.cosmeticsshop.domain.User;
import com.example.cosmeticsshop.domain.request.ReqProductDTO;
import com.example.cosmeticsshop.domain.response.ResProductDTO;
import com.example.cosmeticsshop.domain.response.ResUserDTO;
import com.example.cosmeticsshop.domain.response.ResultPaginationDTO;
import com.example.cosmeticsshop.repository.CategoryRepository;
import com.example.cosmeticsshop.repository.ProductRepository;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    public ResProductDTO handleCreateProduct(ReqProductDTO product) {
        Category category = this.categoryRepository.findByName(product.getCategoryName());
        Product newProduct = new Product();
        newProduct.setName(product.getName());
        newProduct.setPrice(product.getPrice());
        newProduct.setQuantity(product.getQuantity());
        newProduct.setDetailDesc(product.getDetailDesc());
        newProduct.setShortDesc(product.getShortDesc());
        newProduct.setCategory(category);
        newProduct.setCategoryName(product.getCategoryName());
        newProduct.setImage(product.getImage());
        newProduct.setFactory(product.getFactory());
        newProduct.setTarget(product.getTarget());
        newProduct.setCreatedAt(Instant.now());
        ResProductDTO resProductDTO = this.convertToResProductDTO(this.productRepository.save(newProduct));
        return resProductDTO;
    }

    public void handleDeleteProduct(long id) {
        this.productRepository.deleteById(id);
    }

    // public List<String> fetchAllCategory() {
    // List<Product> listProduct = this.productRepository.findAll();
    // List<String> listCategory = listProduct.stream().map(item ->
    // item.getCategory()).collect(Collectors.toList());
    // return listCategory;
    // }

    public Product fetchProductById1(long id) {
        Optional<Product> productOptional = this.productRepository.findById(id);
        if (productOptional.isPresent()) {
            return productOptional.get();
        }
        return null;
    }

    public ResProductDTO fetchProductById(long id) {
        Optional<Product> productOptional = this.productRepository.findById(id);
        if (productOptional.isPresent()) {
            ResProductDTO resProductDTO = this.convertToResProductDTO(productOptional.get());
            return resProductDTO;
        }
        return null;
    }

    public ResultPaginationDTO fetchAllProduct(Specification<Product> spec, Pageable pageable) {
        Page<Product> pageUser = this.productRepository.findAll(spec, pageable);
        ResultPaginationDTO rs = new ResultPaginationDTO();
        ResultPaginationDTO.Meta mt = new ResultPaginationDTO.Meta();

        mt.setPage(pageable.getPageNumber() + 1);
        mt.setPageSize(pageable.getPageSize());

        mt.setPages(pageUser.getTotalPages());
        mt.setTotal(pageUser.getTotalElements());

        rs.setMeta(mt);

        // remove sensitive data
        List<ResProductDTO> listUser = pageUser.getContent()
                .stream().map(item -> this.convertToResProductDTO(item))
                .collect(Collectors.toList());
        rs.setResult(listUser);

        return rs;
    }

    public ResultPaginationDTO fetchAllProductByCategoryId(Long id, Pageable pageable) {
        Page<Product> pageProduct = this.productRepository.findByCategoryId(id, pageable);
        ResultPaginationDTO rs = new ResultPaginationDTO();
        ResultPaginationDTO.Meta mt = new ResultPaginationDTO.Meta();

        mt.setPage(pageable.getPageNumber() + 1);
        mt.setPageSize(pageable.getPageSize());

        mt.setPages(pageProduct.getTotalPages());
        mt.setTotal(pageProduct.getTotalElements());

        rs.setMeta(mt);

        // remove sensitive data
        List<ResProductDTO> listProduct = pageProduct.getContent()
                .stream().map(item -> this.convertToResProductDTO(item))
                .collect(Collectors.toList());
        rs.setResult(listProduct);

        return rs;
    }

    public ResProductDTO convertToResProductDTO(Product product) {
        ResProductDTO resProductDTO = new ResProductDTO();
        resProductDTO.setId(product.getId());
        resProductDTO.setName(product.getName());
        resProductDTO.setPrice(product.getPrice());
        resProductDTO.setQuantity(product.getQuantity());
        resProductDTO.setDetailDesc(product.getDetailDesc());
        resProductDTO.setShortDesc(product.getShortDesc());
        resProductDTO.setImage(product.getImage());
        resProductDTO.setSold(product.getSold());
        resProductDTO.setCategoryName(product.getCategory().getName());
        resProductDTO.setFactory(product.getFactory());
        resProductDTO.setTarget(product.getTarget());
        resProductDTO.setCreatedAt(product.getCreatedAt());
        resProductDTO.setUpdatedAt(product.getUpdatedAt());
        return resProductDTO;
    }

    public ResProductDTO handleUpdateProduct(Long id, ReqProductDTO product) {
        Product currentProduct = this.fetchProductById1(id);
        Category category = this.categoryRepository.findByName(product.getCategoryName());
        if (currentProduct != null) {
            currentProduct.setName(product.getName());
            currentProduct.setPrice(product.getPrice());
            currentProduct.setQuantity(product.getQuantity());
            currentProduct.setDetailDesc(product.getDetailDesc());
            currentProduct.setShortDesc(product.getShortDesc());
            currentProduct.setCategory(category);
            currentProduct.setCategoryName(product.getCategoryName());
            currentProduct.setImage(product.getImage());
            currentProduct.setFactory(product.getFactory());
            currentProduct.setTarget(product.getTarget());
            currentProduct.setUpdatedAt(Instant.now());
            // update
            ResProductDTO resProductDTO = this.convertToResProductDTO(this.productRepository.save(currentProduct));
            return resProductDTO;
        }
        return null;

    }

    public boolean isProductExist(String name) {
        return this.productRepository.existsByName(name);
    }

    public Long getTotalProducts() {
        return this.productRepository.count();
    }

}
