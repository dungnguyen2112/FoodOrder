package com.example.cosmeticsshop.domain.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class HistoryRequest {
    private Long userId;
    private String action;
}