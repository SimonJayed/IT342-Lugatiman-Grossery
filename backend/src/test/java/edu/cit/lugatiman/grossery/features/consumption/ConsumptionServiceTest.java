package edu.cit.lugatiman.grossery.features.consumption;

import edu.cit.lugatiman.grossery.features.auth.EmailService;
import edu.cit.lugatiman.grossery.features.auth.User;
import edu.cit.lugatiman.grossery.features.auth.UserRepository;
import edu.cit.lugatiman.grossery.features.grocery.GroceryItem;
import edu.cit.lugatiman.grossery.features.grocery.GroceryItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ConsumptionServiceTest {

    @Mock
    private MonthlyConsumptionRepository consumptionRepository;

    @Mock
    private GroceryItemRepository groceryItemRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private ConsumptionService consumptionService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testLogConsumption_Balanced() {
        // Arrange
        String email = "test@example.com";
        Long groceryId = 1L;
        ConsumptionDto dto = new ConsumptionDto();
        dto.setMonth("May");
        dto.setYear(2026);
        dto.setActualConsumption(10.0);

        User user = new User();
        user.setId(1L);
        user.setEmail(email);

        GroceryItem item = new GroceryItem();
        item.setId(groceryId);
        item.setItemName("Milk");
        item.setExpectedMonthlyConsumption(10.0);
        item.setUser(user);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(groceryItemRepository.findById(groceryId)).thenReturn(Optional.of(item));
        when(consumptionRepository.findByGroceryItemAndMonthAndYear(any(), any(), any())).thenReturn(Optional.empty());

        // Act
        ConsumptionResponseDto response = consumptionService.logConsumption(email, groceryId, dto);

        // Assert
        assertEquals(0.0, response.getVariance());
        assertEquals("Balanced", response.getStatus());
        verify(consumptionRepository, times(1)).save(any());
        verify(emailService, never()).sendOverconsumptionAlert(any(), any(), anyDouble(), anyDouble());
    }

    @Test
    void testLogConsumption_Overconsumed() {
        // Arrange
        String email = "test@example.com";
        Long groceryId = 1L;
        ConsumptionDto dto = new ConsumptionDto();
        dto.setMonth("May");
        dto.setYear(2026);
        dto.setActualConsumption(15.0);

        User user = new User();
        user.setId(1L);
        user.setEmail(email);

        GroceryItem item = new GroceryItem();
        item.setId(groceryId);
        item.setItemName("Milk");
        item.setExpectedMonthlyConsumption(10.0);
        item.setUser(user);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(groceryItemRepository.findById(groceryId)).thenReturn(Optional.of(item));
        when(consumptionRepository.findByGroceryItemAndMonthAndYear(any(), any(), any())).thenReturn(Optional.empty());

        // Act
        ConsumptionResponseDto response = consumptionService.logConsumption(email, groceryId, dto);

        // Assert
        assertEquals(5.0, response.getVariance());
        assertEquals("Overconsumed", response.getStatus());
        verify(emailService, times(1)).sendOverconsumptionAlert(eq(email), eq("Milk"), eq(15.0), eq(10.0));
    }
}
