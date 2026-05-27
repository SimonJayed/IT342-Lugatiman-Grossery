package edu.cit.lugatiman.grossery.features.dashboard;


import edu.cit.lugatiman.grossery.features.auth.User;
import edu.cit.lugatiman.grossery.features.auth.UserRepository;
import edu.cit.lugatiman.grossery.features.consumption.MonthlyConsumption;
import edu.cit.lugatiman.grossery.features.consumption.MonthlyConsumptionRepository;
import edu.cit.lugatiman.grossery.features.grocery.GroceryItem;
import edu.cit.lugatiman.grossery.features.grocery.GroceryItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
public class DashboardService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GroceryItemRepository groceryItemRepository;

    @Autowired
    private MonthlyConsumptionRepository consumptionRepository;

    public DashboardComparisonDto getComparisonData(String email, String month, Integer year) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        
        LocalDate now = LocalDate.now();
        String queryMonth = (month != null) ? month : now.getMonth().getDisplayName(TextStyle.FULL, Locale.ENGLISH);
        int queryYear = (year != null) ? year : now.getYear();

        DashboardComparisonDto dashboardDto = new DashboardComparisonDto();
        dashboardDto.setMonth(queryMonth);
        dashboardDto.setYear(queryYear);

        List<DashboardComparisonDto.ComparisonItemDto> itemDtos = new ArrayList<>();
        List<GroceryItem> userGroceries = groceryItemRepository.findByUser(user);

        for (GroceryItem item : userGroceries) {
            Optional<MonthlyConsumption> consumption = consumptionRepository.findByGroceryItemAndMonthAndYear(item, queryMonth, queryYear);
            
            double expected = item.getExpectedMonthlyConsumption() != null ? item.getExpectedMonthlyConsumption() : 0.0;
            // Default to 0.0 if not logged
            double actual = (consumption.isPresent() && consumption.get().getActualConsumption() != null)
                    ? consumption.get().getActualConsumption() 
                    : 0.0; 
            double variance = actual - expected;

            DashboardComparisonDto.ComparisonItemDto itemDto = new DashboardComparisonDto.ComparisonItemDto();
            itemDto.setId(item.getId());
            itemDto.setName(item.getItemName());
            itemDto.setExpected(expected);
            itemDto.setActual(actual);
            itemDto.setVariance(variance);
            itemDto.setUnit(item.getUnit());
            
            itemDtos.add(itemDto);
        }

        dashboardDto.setItems(itemDtos);
        return dashboardDto;
    }
}
