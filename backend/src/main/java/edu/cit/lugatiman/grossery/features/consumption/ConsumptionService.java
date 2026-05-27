package edu.cit.lugatiman.grossery.features.consumption;


import edu.cit.lugatiman.grossery.features.auth.EmailService;
import edu.cit.lugatiman.grossery.features.auth.User;
import edu.cit.lugatiman.grossery.features.auth.UserRepository;
import edu.cit.lugatiman.grossery.features.grocery.GroceryItem;
import edu.cit.lugatiman.grossery.features.grocery.GroceryItemRepository;
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
        
        // Check if there is already a record for this month/year and update or create
        Optional<MonthlyConsumption> existing = consumptionRepository.findByGroceryItemAndMonthAndYear(item, dto.getMonth(), dto.getYear());
        MonthlyConsumption consumption;
        double actual;
        
        if (existing.isPresent()) {
            consumption = existing.get();
            double incomingActual = dto.getActualConsumption() != null ? dto.getActualConsumption() : 0.0;
            actual = Boolean.TRUE.equals(dto.getIncremental())
                    ? (consumption.getActualConsumption() != null ? consumption.getActualConsumption() : 0.0) + incomingActual
                    : incomingActual;
        } else {
            consumption = new MonthlyConsumption();
            consumption.setGroceryItem(item);
            consumption.setMonth(dto.getMonth());
            consumption.setYear(dto.getYear());
            actual = dto.getActualConsumption() != null ? dto.getActualConsumption() : 0.0;
        }

        if (actual < 0.0) {
            actual = 0.0;
        }

        double variance = actual - expected;
        consumption.setActualConsumption(actual);
        consumption.setVariance(variance);

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

        consumptionRepository.save(consumption);

        return new ConsumptionResponseDto(variance, status);
    }
}
