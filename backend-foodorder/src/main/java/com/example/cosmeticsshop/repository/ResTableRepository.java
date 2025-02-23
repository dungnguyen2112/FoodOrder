package com.example.cosmeticsshop.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.example.cosmeticsshop.domain.Order;
import com.example.cosmeticsshop.domain.ResTable;
import com.example.cosmeticsshop.util.constant.TableEnum;

@Repository
public interface ResTableRepository extends JpaRepository<ResTable, Long>, JpaSpecificationExecutor<ResTable> {

    List<ResTable> findByStatus(TableEnum status);

    Long countByStatus(TableEnum string);

    ResTable findByTableNumber(String tableNumber);

}
