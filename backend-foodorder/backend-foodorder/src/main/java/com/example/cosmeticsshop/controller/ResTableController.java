package com.example.cosmeticsshop.controller;

import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.cosmeticsshop.domain.Product;
import com.example.cosmeticsshop.domain.ResTable;
import com.example.cosmeticsshop.domain.request.TableRequest;
import com.example.cosmeticsshop.domain.response.ResultPaginationDTO;
import com.example.cosmeticsshop.service.ResTableService;
import com.example.cosmeticsshop.util.annotation.ApiMessage;
import com.example.cosmeticsshop.util.constant.TableEnum;
import com.turkraft.springfilter.boot.Filter;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ResTableController {

    private final ResTableService tableService;

    // ✅ Thêm bàn mới (admin)
    @PostMapping("/tables")
    @ApiMessage("Create a new table")
    public ResponseEntity<ResTable> createTable(@RequestBody TableRequest request) {
        return ResponseEntity.ok(tableService.createTable(request));
    }

    // ✅ Lấy danh sách bàn
    @GetMapping("/tables")
    @ApiMessage("Get all tables")
    public ResponseEntity<ResultPaginationDTO> getAllTables(@Filter Specification<ResTable> spec,
            @ParameterObject Pageable pageable) {

        ResultPaginationDTO result = this.tableService.fetchAllTable(spec, pageable);
        return ResponseEntity.ok(result);

    }

    // @GetMapping("/tables")
    // @ApiMessage("Get all available tables")
    // public ResponseEntity<ResultPaginationDTO> getAllAvailableTables(@Filter
    // Specification<ResTable> spec,
    // @ParameterObject Pageable pageable) {

    // ResultPaginationDTO result = this.tableService.fetchAllAvailableTable(spec,
    // pageable);
    // return ResponseEntity.ok(result);

    // }

    // ✅ Lấy thông tin bàn theo ID
    @GetMapping("/tables/{id}")
    @ApiMessage("Get a table")
    public ResponseEntity<ResTable> getTableById(@PathVariable Long id) {
        return ResponseEntity.ok(tableService.getTableById(id));
    }

    // ✅ Cập nhật thông tin bàn (admin)
    @PutMapping("/tables/{id}")
    @ApiMessage("Update a table")
    public ResponseEntity<ResTable> updateTable(@PathVariable Long id, @RequestBody TableEnum request) {
        return ResponseEntity.ok(tableService.updateTable(id, request));
    }

    // ✅ Xóa bàn khỏi hệ thống (admin)
    @DeleteMapping("/tables/{id}")
    @ApiMessage("Delete a table")
    public ResponseEntity<String> deleteTable(@PathVariable Long id) {
        tableService.deleteTable(id);
        return ResponseEntity.ok("Bàn đã được xóa");
    }
}
