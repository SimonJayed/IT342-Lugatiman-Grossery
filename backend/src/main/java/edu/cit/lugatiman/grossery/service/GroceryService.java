package edu.cit.lugatiman.grossery.service;

import edu.cit.lugatiman.grossery.dto.GroceryDto;
import edu.cit.lugatiman.grossery.entity.Category;
import edu.cit.lugatiman.grossery.entity.GroceryItem;
import edu.cit.lugatiman.grossery.entity.User;
import edu.cit.lugatiman.grossery.repository.CategoryRepository;
import edu.cit.lugatiman.grossery.repository.GroceryItemRepository;
import edu.cit.lugatiman.grossery.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class GroceryService {

    @Autowired
    private GroceryItemRepository groceryRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

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

    public void deleteGrocery(String email, Long id) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        GroceryItem item = groceryRepository.findById(id).orElseThrow(() -> new RuntimeException("Item not found"));
        
        if (!item.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to delete this item");
        }
        
        groceryRepository.delete(item);
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
        return dto;
    }
}
