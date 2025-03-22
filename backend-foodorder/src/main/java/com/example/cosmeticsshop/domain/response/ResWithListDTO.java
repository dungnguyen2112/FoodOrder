package com.example.cosmeticsshop.domain.response;

import java.util.List;

public class ResWithListDTO {
    private List<?> list;

    public ResWithListDTO(List<?> list) {
        this.list = list;
    }

    public List<?> getList() {
        return list;
    }

    public void setList(List<?> list) {
        this.list = list;
    }
}
