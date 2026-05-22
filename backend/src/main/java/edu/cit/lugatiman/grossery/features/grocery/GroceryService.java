package edu.cit.lugatiman.grossery.features.grocery;


import edu.cit.lugatiman.grossery.features.auth.User;
import edu.cit.lugatiman.grossery.features.auth.UserRepository;
import edu.cit.lugatiman.grossery.features.consumption.MonthlyConsumptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;

@Service
public class GroceryService {

    @Autowired
    private GroceryItemRepository groceryRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MonthlyConsumptionRepository consumptionRepository;

    public List<GroceryDto> getUserGroceries(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        return groceryRepository.findByUser(user).stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public GroceryDto addGrocery(String email, GroceryDto dto) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        
        Category category = null;
        if (dto.getCategoryName() != null) {
            category = categoryRepository.findByCategoryName(dto.getCategoryName())
                    .orElseGet(() -> {
                        Category newCat = new Category();
                        newCat.setCategoryName(dto.getCategoryName());
                        newCat.setCreatedBy(user.getId());
                        return categoryRepository.save(newCat);
                    });
        }

        GroceryItem item = new GroceryItem();
        item.setUser(user);
        item.setItemName(dto.getItemName());
        item.setCategory(category);
        item.setUnit(dto.getUnit());
        item.setExpectedMonthlyConsumption(dto.getExpectedMonthlyConsumption());
        item.setExpirationDate(dto.getExpirationDate());

        return mapToDto(groceryRepository.save(item));
    }

    public GroceryDto updateGrocery(String email, Long id, GroceryDto dto) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        GroceryItem item = groceryRepository.findById(id).orElseThrow(() -> new RuntimeException("Item not found"));
        
        if (!item.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to modify this item");
        }

        if (dto.getCategoryName() != null) {
            Category category = categoryRepository.findByCategoryName(dto.getCategoryName())
                    .orElseGet(() -> {
                        Category newCat = new Category();
                        newCat.setCategoryName(dto.getCategoryName());
                        newCat.setCreatedBy(user.getId());
                        return categoryRepository.save(newCat);
                    });
            item.setCategory(category);
        }

        item.setItemName(dto.getItemName());
        item.setUnit(dto.getUnit());
        item.setExpectedMonthlyConsumption(dto.getExpectedMonthlyConsumption());
        item.setExpirationDate(dto.getExpirationDate());

        return mapToDto(groceryRepository.save(item));
    }

    @Transactional
    public void deleteGrocery(String email, Long id) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        GroceryItem item = groceryRepository.findById(id).orElseThrow(() -> new RuntimeException("Item not found"));
        
        if (!item.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to delete this item");
        }
        
        // Manually delete logs first to be absolutely safe
        consumptionRepository.deleteByGroceryItem(item);
        groceryRepository.delete(item);
    }

    public List<String> getAllCategories(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        return categoryRepository.findAll().stream()
                .filter(c -> c.getCreatedBy() == null || c.getCreatedBy().equals(user.getId()))
                .map(Category::getCategoryName)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteCategory(String email, String categoryName) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!"ROLE_ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new org.springframework.security.access.AccessDeniedException("Only administrators are authorized to delete categories.");
        }
        
        Category category = categoryRepository.findByCategoryName(categoryName)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        // Only allow deleting categories created by this user (if we track it) or just allow any
        // In this system, we can just allow it if the user is authorized.
        
        // Nullify category in all items first
        List<GroceryItem> items = groceryRepository.findAll().stream()
                .filter(item -> item.getCategory() != null && item.getCategory().getCategoryName().equals(categoryName))
                .collect(Collectors.toList());
        
        for (GroceryItem item : items) {
            item.setCategory(null);
            groceryRepository.save(item);
        }

        categoryRepository.delete(category);
    }

    public List<GroceryDto> getExpiringSoonGroceries(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        LocalDate now = LocalDate.now();
        LocalDate inThreeDays = now.plusDays(3);
        
        // Find items expiring within the next 3 days
        return groceryRepository.findByUserAndExpirationDateBetween(user, now, inThreeDays)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    private GroceryDto mapToDto(GroceryItem item) {
        GroceryDto dto = new GroceryDto();
        dto.setId(item.getId());
        dto.setItemName(item.getItemName());
        dto.setCategoryName(item.getCategory() != null ? item.getCategory().getCategoryName() : null);
        dto.setUnit(item.getUnit());
        dto.setExpectedMonthlyConsumption(item.getExpectedMonthlyConsumption());
        dto.setExpirationDate(item.getExpirationDate());
        dto.setReceiptPaths(item.getReceipts() != null ? 
                item.getReceipts().stream()
                        .map(edu.cit.lugatiman.grossery.features.receipt.Receipt::getFilePath)
                        .collect(Collectors.toList()) : 
                new java.util.ArrayList<>()
        );
        return dto;
    }
}
