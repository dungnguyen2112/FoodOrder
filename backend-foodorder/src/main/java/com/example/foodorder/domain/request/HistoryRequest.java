package com.example.foodorder.domain.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class HistoryRequest {
    private Long userId;
    private String action;
}