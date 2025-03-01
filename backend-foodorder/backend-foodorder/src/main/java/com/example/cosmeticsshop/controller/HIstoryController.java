package com.example.cosmeticsshop.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.cosmeticsshop.domain.User;
import com.example.cosmeticsshop.domain.response.HistoryDTO;
import com.example.cosmeticsshop.service.HistoryService;
import com.example.cosmeticsshop.service.UserService;
import com.example.cosmeticsshop.util.SecurityUtil;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class HIstoryController {

    @Autowired
    private HistoryService historyService;

    @Autowired
    private UserService userService;

    @GetMapping("/history")
    public ResponseEntity<List<HistoryDTO>> getAllHistories() {
        List<HistoryDTO> historyDTOs = historyService.getAllHistories();
        return ResponseEntity.ok(historyDTOs);
    }

    // @GetMapping("/history/user")
    // public ResponseEntity<List<HistoryDTO>> getHistoryByUser() {
    // String email = SecurityUtil.getCurrentUserLogin().isPresent() ?
    // SecurityUtil.getCurrentUserLogin().get() : "";
    // User currentUser = this.userService.handleGetUserByUsernameOrEmail(email);
    // List<HistoryDTO> historyDTOs =
    // historyService.getHistoryByUser(currentUser.getId());
    // return ResponseEntity.ok(historyDTOs);
    // }
}
