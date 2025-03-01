package com.example.foodorder.domain.request;

import com.example.foodorder.util.constant.TableEnum;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TableRequest {
    private String tableNumber;
    private TableEnum status;
}
