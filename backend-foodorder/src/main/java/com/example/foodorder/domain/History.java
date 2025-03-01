package com.example.foodorder.domain;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "histories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class History {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // The user who triggered the action (e.g., the customer)

    @OneToMany(mappedBy = "history", cascade = { CascadeType.PERSIST, CascadeType.MERGE }, fetch = FetchType.LAZY)
    private List<Order> orders = new ArrayList<>(); // The orders associated with the action

    @Column(nullable = false)
    private String action; // Describes the action: "Place Order", "Cancel Order", "Payment", etc.

    @Column(nullable = false)
    private LocalDateTime timestamp; // The time the action occurred

    // Optionally, you can store additional info as a JSON or text column
    @Column(length = 500)
    private String details; // Any extra information about the action (e.g., the reason for cancellation,
                            // payment method, etc.)

    private double totalPrice;
}
