package com.example.cosmeticsshop.service;

import java.util.List;

import javax.naming.spi.DirStateFactory.Result;

import org.springframework.boot.autoconfigure.rsocket.RSocketProperties.Server.Spec;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.cosmeticsshop.domain.ResTable;
import com.example.cosmeticsshop.domain.request.TableRequest;
import com.example.cosmeticsshop.domain.response.ResultPaginationDTO;
import com.example.cosmeticsshop.repository.ResTableRepository;
import com.example.cosmeticsshop.util.constant.TableEnum;

import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class ResTableService {

    private final ResTableRepository tableRepository;

    public ResTableService(ResTableRepository tableRepository) {
        this.tableRepository = tableRepository;
    }

    // ✅ Thêm bàn mới
    public ResTable createTable(TableRequest request) {
        ResTable table = new ResTable();
        table.setTableNumber(request.getTableNumber());
        table.setStatus(request.getStatus());
        return tableRepository.save(table);
    }

    // ✅ Lấy danh sách bàn
    public ResultPaginationDTO fetchAllTable(Specification<ResTable> spec, Pageable pageable) {
        Page<ResTable> listTable = this.tableRepository.findAll(spec, pageable);
        ResultPaginationDTO rs = new ResultPaginationDTO();
        ResultPaginationDTO.Meta mt = new ResultPaginationDTO.Meta();

        mt.setPage(pageable.getPageNumber() + 1);
        mt.setPageSize(pageable.getPageSize());

        mt.setPages(listTable.getTotalPages());
        mt.setTotal(listTable.getTotalElements());

        rs.setMeta(mt);
        rs.setResult(listTable);
        return rs;
    }

    // ✅ Lấy danh sách bàn còn chỗ
    public List<ResTable> getAvailableTables() {
        return tableRepository.findByStatus(TableEnum.AVAILABLE);
    }

    // ✅ Lấy thông tin bàn theo ID
    public ResTable getTableById(Long id) {
        return tableRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bàn"));
    }

    // ✅ Cập nhật thông tin bàn
    public ResTable updateTable(Long id, TableEnum request) {
        ResTable table = getTableById(id);
        table.setStatus(request);
        return tableRepository.save(table);
    }

    // ✅ Xóa bàn
    public void deleteTable(Long id) {
        tableRepository.deleteById(id);
    }

    public Long getTotalAvailableTables() {
        return tableRepository.countByStatus(TableEnum.AVAILABLE);
    }
}
