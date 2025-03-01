package com.example.foodorder.util.constant;

public enum FeedBackStar {
    ONE(1), TWO(2), THREE(3), FOUR(4), FIVE(5);

    private final int value;

    FeedBackStar(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }
}
