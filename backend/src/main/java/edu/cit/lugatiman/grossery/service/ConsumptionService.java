package edu.cit.lugatiman.grossery.service;

import edu.cit.lugatiman.grossery.dto.ConsumptionDto;
import edu.cit.lugatiman.grossery.dto.ConsumptionResponseDto;
import edu.cit.lugatiman.grossery.entity.GroceryItem;
import edu.cit.lugatiman.grossery.entity.MonthlyConsumption;
import edu.cit.lugatiman.grossery.entity.User;
import edu.cit.lugatiman.grossery.repository.GroceryItemRepository;
import edu.cit.lugatiman.grossery.repository.MonthlyConsumptionRepository;
import edu.cit.lugatiman.grossery.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ConsumptionService {

    @Autowired
    private MonthlyConsumptionRepository consumptionRepository;

    @Autowired
    private GroceryItemRepository groceryItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    public ConsumptionResponseDto logConsumption(String email, Long groceryId, ConsumptionDto dto) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        GroceryItem item = groceryItemRepository.findById(groceryId).orElseThrow(() -> new RuntimeException("Item not found"));

        if (!item.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to modify this item");
        }

        double expected = item.getExpectedMonthlyConsumption() != null ? item.getExpectedMonthlyConsumption() : 0.0;
        double actual = dto.getActualConsumption() != null ? dto.getActualConsumption() : 0.0;
        double variance = actual - expected;
        
        String status;
        if (variance > 0) {
            status = "Overconsumed";
            // Trigger SMTP alert
            emailService.sendOverconsumptionAlert(user.getEmail(), item.getItemName(), actual, expected);
        } else if (variance < 0) {
            status = "Underconsumed";
        } else {
            status = "Balanced";
        }

        // Check if there is already a record for this month/year and update or create
        Optional<MonthlyConsumption> existing = consumptionRepository.findByGroceryItemAndMonthAndYear(item, dto.getMonth(), dto.getYear());
        MonthlyConsumption consumption;
        if (existing.isPresent()) {
            consumption = existing.get();
            consumption.setActualConsumption(actual);
            consumption.setVariance(variance);
        } else {
            consumption = new MonthlyConsumption();
            consumption.setGroceryItem(item);
            consumption.setMonth(dto.getMonth());
            consumption.setYear(dto.getYear());
            consumption.setActualConsumption(actual);
            consumption.setVariance(variance);
        }

        consumptionRepository.save(consumption);

        return new ConsumptionResponseDto(variance, status);
    }
}
