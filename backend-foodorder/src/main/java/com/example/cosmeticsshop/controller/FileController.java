package com.example.cosmeticsshop.controller;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.net.URISyntaxException;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.cosmeticsshop.domain.file.ResUploadFileDTO;
import com.example.cosmeticsshop.service.FileService;
import com.example.cosmeticsshop.util.annotation.ApiMessage;
import com.example.cosmeticsshop.util.error.StorageException;

@RestController
@RequestMapping("/api/v1")
public class FileController {

    @Value("${upload-file.base-uri}")
    private String baseURI;

    private final FileService fileService;

    public FileController(FileService fileService) {
        this.fileService = fileService;
    }

    @PostMapping("/files")
    @ApiMessage("Upload single file")
    public ResponseEntity<ResUploadFileDTO> upload(
            @RequestParam(name = "file", required = false) MultipartFile file,
            @RequestParam("folder") String folder)
            throws URISyntaxException, IOException, StorageException {

        // DEBUG: log tham số folder gửi vào
        System.out.println(">>> ORIGINAL FOLDER PARAM: [" + folder + "]");

        // Nếu có dấu "," thì chỉ lấy phần folder thôi, loại bỏ phần file name (nếu có)
        if (folder.contains(",")) {
            String[] parts = folder.split(",");
            folder = parts[0].trim(); // Lấy phần folder sạch
            System.out.println(">>> CLEANED FOLDER: [" + folder + "]");
        }

        // Validate file
        if (file == null || file.isEmpty()) {
            throw new StorageException("File is empty. Please upload a file.");
        }

        String fileName = file.getOriginalFilename();

        List<String> allowedExtensions = Arrays.asList("pdf", "jpg", "jpeg", "png", "doc", "docx");
        boolean isValid = allowedExtensions.stream()
                .anyMatch(item -> fileName.toLowerCase().endsWith(item));

        if (!isValid) {
            throw new StorageException("Invalid file extension. Only allows " + allowedExtensions);
        }

        // Tạo thư mục nếu chưa có
        String directoryPath = baseURI + folder;

        System.out.println(">>> WILL CREATE DIRECTORY AT: " + directoryPath);

        this.fileService.createDirectory(directoryPath);

        // Lưu file vào thư mục đã tạo
        String uploadFilePath = this.fileService.store(file, folder);

        System.out.println(">>> FILE STORED AT: " + uploadFilePath);

        ResUploadFileDTO res = new ResUploadFileDTO(uploadFilePath, Instant.now());

        return ResponseEntity.ok().body(res);
    }

    @GetMapping("/files")
    @ApiMessage("Download a file")
    public ResponseEntity<Resource> download(
            @RequestParam(name = "fileName", required = false) String fileName,
            @RequestParam(name = "folder", required = false) String folder)
            throws StorageException, URISyntaxException, FileNotFoundException {
        if (fileName == null || folder == null) {
            throw new StorageException("Missing required params : (fileName or folder) in query params.");
        }

        // check file exist (and not a directory)
        long fileLength = this.fileService.getFileLength(fileName, folder);
        if (fileLength == 0) {
            throw new StorageException("File with name = " + fileName + " not found.");
        }

        // download a file
        InputStreamResource resource = this.fileService.getResource(fileName, folder);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentLength(fileLength)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }
}
