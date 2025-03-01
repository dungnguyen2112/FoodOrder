package com.example.cosmeticsshop.domain.request;

import com.example.cosmeticsshop.util.constant.TableEnum;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TableRequest {
    private String tableNumber;
    private TableEnum status;
}
