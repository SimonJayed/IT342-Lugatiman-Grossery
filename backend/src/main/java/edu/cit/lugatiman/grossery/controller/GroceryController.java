package edu.cit.lugatiman.grossery.controller;

import edu.cit.lugatiman.grossery.dto.GroceryDto;
import edu.cit.lugatiman.grossery.payload.ApiResponse;
import edu.cit.lugatiman.grossery.service.GroceryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groceries")
public class GroceryController {

    @Autowired
    private GroceryService groceryService;

    @GetMapping
    public ResponseEntity<ApiResponse> getUserGroceries(Authentication authentication) {
        String email = authentication.getName();
        List<GroceryDto> groceries = groceryService.getUserGroceries(email);
        return ResponseEntity.ok(new ApiResponse(true, "Groceries retrieved successfully", groceries));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse> getCategories(Authentication authentication) {
        String email = authentication.getName();
        List<String> categories = groceryService.getAllCategories(email);
        return ResponseEntity.ok(new ApiResponse(true, "Categories retrieved", categories));
    }

    @GetMapping("/expiring-soon")
    public ResponseEntity<ApiResponse> getExpiringSoon(Authentication authentication) {
        String email = authentication.getName();
        List<GroceryDto> expiring = groceryService.getExpiringSoonGroceries(email);
        return ResponseEntity.ok(new ApiResponse(true, "Expiring soon items retrieved", expiring));
    }

    @PostMapping
    public ResponseEntity<ApiResponse> addGrocery(@RequestBody GroceryDto dto, Authentication authentication) {
        String email = authentication.getName();
        GroceryDto created = groceryService.addGrocery(email, dto);
        return ResponseEntity.ok(new ApiResponse(true, "Grocery item added successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updateGrocery(@PathVariable Long id, @RequestBody GroceryDto dto, Authentication authentication) {
        String email = authentication.getName();
        GroceryDto updated = groceryService.updateGrocery(email, id, dto);
        return ResponseEntity.ok(new ApiResponse(true, "Grocery item updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteGrocery(@PathVariable Long id, Authentication authentication) {
        String email = authentication.getName();
        groceryService.deleteGrocery(email, id);
        return ResponseEntity.ok(new ApiResponse(true, "Grocery item deleted successfully", null));
    }

    @DeleteMapping("/categories/{name}")
    public ResponseEntity<ApiResponse> deleteCategory(@PathVariable String name, Authentication authentication) {
        String email = authentication.getName();
        groceryService.deleteCategory(email, name);
        return ResponseEntity.ok(new ApiResponse(true, "Category deleted successfully", null));
    }
}
