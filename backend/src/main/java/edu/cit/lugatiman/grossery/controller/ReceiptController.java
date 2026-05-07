package edu.cit.lugatiman.grossery.controller;

import edu.cit.lugatiman.grossery.entity.GroceryItem;
import edu.cit.lugatiman.grossery.entity.Receipt;
import edu.cit.lugatiman.grossery.entity.User;
import edu.cit.lugatiman.grossery.payload.ApiResponse;
import edu.cit.lugatiman.grossery.repository.GroceryItemRepository;
import edu.cit.lugatiman.grossery.repository.ReceiptRepository;
import edu.cit.lugatiman.grossery.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/groceries")
public class ReceiptController {

    private static final String UPLOAD_DIR = "uploads/receipts/";

    @Autowired
    private ReceiptRepository receiptRepository;

    @Autowired
    private GroceryItemRepository groceryItemRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/{id}/receipts")
    public ResponseEntity<ApiResponse> uploadReceipt(@PathVariable Long id, @RequestParam("file") MultipartFile file, Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        GroceryItem item = groceryItemRepository.findById(id).orElseThrow(() -> new RuntimeException("Item not found"));

        if (!item.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to modify this item");
        }

        try {
            File dir = new File(UPLOAD_DIR);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            String originalName = file.getOriginalFilename();
            String fileName = System.currentTimeMillis() + "_" + originalName;
            Path filePath = Paths.get(UPLOAD_DIR + fileName);
            Files.write(filePath, file.getBytes());

            Receipt receipt = new Receipt();
            receipt.setGroceryItem(item);
            receipt.setFilePath("/" + UPLOAD_DIR + fileName);
            receiptRepository.save(receipt);

            Map<String, Object> data = new HashMap<>();
            data.put("receiptId", receipt.getId());
            data.put("fileName", fileName);
            data.put("fileUrl", receipt.getFilePath());

            return ResponseEntity.ok(new ApiResponse(true, "Receipt uploaded successfully", data));

        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }
    }
}
