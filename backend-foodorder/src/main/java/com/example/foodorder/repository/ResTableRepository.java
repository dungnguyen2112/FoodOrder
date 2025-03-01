package com.example.foodorder.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.example.foodorder.domain.Order;
import com.example.foodorder.domain.ResTable;
import com.example.foodorder.util.constant.TableEnum;

@Repository
public interface ResTableRepository extends JpaRepository<ResTable, Long>, JpaSpecificationExecutor<ResTable> {

    List<ResTable> findByStatus(TableEnum status);

    Long countByStatus(TableEnum string);

    ResTable findByTableNumber(String tableNumber);

}
