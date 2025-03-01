package com.example.foodorder.domain.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DashboardDTO {

    private long totalCategories;
    private long totalProducts;
    private long totalOrders;
    private long totalTables;
}
