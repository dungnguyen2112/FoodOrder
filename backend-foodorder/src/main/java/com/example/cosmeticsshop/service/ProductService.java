package com.example.cosmeticsshop.service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.cosmeticsshop.domain.Category;
import com.example.cosmeticsshop.domain.Product;
import com.example.cosmeticsshop.domain.User;
import com.example.cosmeticsshop.domain.request.ReqProductDTO;
import com.example.cosmeticsshop.domain.response.ResProductDTO;
import com.example.cosmeticsshop.domain.response.ResUserDTO;
import com.example.cosmeticsshop.domain.response.ResultPaginationDTO;
import com.example.cosmeticsshop.domain.ProductImage;
import com.example.cosmeticsshop.domain.response.ResProductDTO.ProductImageDTO;
import com.example.cosmeticsshop.repository.CategoryRepository;
import com.example.cosmeticsshop.repository.ProductRepository;
import com.example.cosmeticsshop.repository.ProductImageRepository;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductImageRepository productImageRepository;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository,
            ProductImageRepository productImageRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.productImageRepository = productImageRepository;
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

        // Chuyển đổi danh sách hình ảnh phụ
        if (product.getImages() != null && !product.getImages().isEmpty()) {
            List<ProductImageDTO> imageDTOs = product.getImages().stream()
                    .map(img -> new ProductImageDTO(
                            img.getId(),
                            img.getImageUrl(),
                            img.getAlt(),
                            img.getDisplayOrder()))
                    .collect(Collectors.toList());
            resProductDTO.setAdditionalImages(imageDTOs);
        }

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

    public List<ResProductDTO> getTopSellingProducts(int limit, Long excludeId) {
        // Tăng giới hạn lên để đảm bảo có đủ sản phẩm sau khi lọc
        int fetchLimit = excludeId != null ? limit + 5 : limit;

        // Tạo PageRequest để lấy các sản phẩm được sắp xếp theo số lượng bán giảm dần
        PageRequest pageRequest = PageRequest.of(0, fetchLimit,
                org.springframework.data.domain.Sort.by("sold").descending());

        // Lấy sản phẩm từ repository
        Page<Product> topProductsPage = this.productRepository.findAll(pageRequest);
        List<Product> topProducts = topProductsPage.getContent();

        // Lọc sản phẩm theo excludeId nếu được cung cấp
        if (excludeId != null) {
            final long excludeIdValue = excludeId.longValue();
            topProducts = topProducts.stream()
                    .filter(product -> product.getId() != excludeIdValue)
                    .collect(Collectors.toList());
        }

        // Nếu không đủ sản phẩm sau khi lọc, lấy thêm sản phẩm khác
        if (topProducts.size() < limit && excludeId != null) {
            // Tìm thêm sản phẩm không thuộc danh sách hiện tại
            List<Long> existingIds = topProducts.stream()
                    .map(product -> Long.valueOf(product.getId()))
                    .collect(Collectors.toList());
            existingIds.add(excludeId); // Thêm ID cần loại trừ

            // Lấy thêm sản phẩm không thuộc danh sách hiện tại
            Page<Product> additionalProductsPage = this.productRepository.findByIdNotIn(
                    existingIds,
                    PageRequest.of(0, limit - topProducts.size()));

            topProducts.addAll(additionalProductsPage.getContent());
        }

        // Chuyển đổi thành DTO và giới hạn số lượng trả về
        return topProducts.stream()
                .limit(limit)
                .map(this::convertToResProductDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void addProductImages(Long productId, List<String> imageUrls) {
        Product product = this.fetchProductById1(productId);
        if (product != null) {
            int order = product.getImages().size(); // Bắt đầu với số thứ tự tiếp theo
            for (String imageUrl : imageUrls) {
                ProductImage image = new ProductImage(imageUrl, product.getName(), order++, product);
                product.getImages().add(image);
            }
            productRepository.save(product);
        }
    }

    @Transactional
    public void updateProductImages(Long productId, List<String> imageUrls) {
        Product product = this.fetchProductById1(productId);
        if (product != null) {
            // Get existing images
            List<ProductImage> existingImages = product.getImages();

            // Update existing images with new URLs
            for (int i = 0; i < Math.min(existingImages.size(), imageUrls.size()); i++) {
                ProductImage existingImage = existingImages.get(i);
                existingImage.setImageUrl(imageUrls.get(i));
            }

            // If we have more new URLs than existing images, add new ones
            if (imageUrls.size() > existingImages.size()) {
                for (int i = existingImages.size(); i < imageUrls.size(); i++) {
                    ProductImage newImage = new ProductImage(imageUrls.get(i), product.getName(), i, product);
                    existingImages.add(newImage);
                }
            }
            // If we have fewer new URLs than existing images, remove the extra ones
            else if (imageUrls.size() < existingImages.size()) {
                existingImages.subList(imageUrls.size(), existingImages.size()).clear();
            }

            // Save the product with its updated images
            productRepository.save(product);
        }
    }

    @Transactional
    public void removeAllProductImages(Long productId) {
        Product product = this.fetchProductById1(productId);
        if (product != null) {
            // Clear the images collection
            product.getImages().clear();
            // Save the product to persist the changes
            productRepository.save(product);
            // Delete from repository
            productImageRepository.deleteByProductId(productId);
        }
    }

    // Xóa một hình ảnh phụ cụ thể
    public void removeProductImage(Long imageId) {
        try {
            // Trước khi xóa, kiểm tra xem hình ảnh có tồn tại không
            Optional<ProductImage> imageOpt = productImageRepository.findById(imageId);
            if (imageOpt.isPresent()) {
                ProductImage image = imageOpt.get();
                log.info("Removing product image with ID: {}, URL: {}", imageId, image.getImageUrl());

                // Lấy product để có thể gọi removeImage helper method
                Product product = image.getProduct();
                if (product != null) {
                    product.removeImage(image);
                    productRepository.save(product);
                    log.info("Successfully removed image from product relationship");
                } else {
                    // Nếu không tìm thấy product, chỉ xóa image trực tiếp
                    productImageRepository.deleteById(imageId);
                    log.info("Deleted image directly without product reference");
                }
            } else {
                log.warn("Image with ID {} not found for deletion", imageId);
            }
        } catch (Exception e) {
            log.error("Error deleting product image with ID: {}", imageId, e);
            throw e;
        }
    }
}
