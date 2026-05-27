package edu.cit.lugatiman.grossery.features.grocery;

import edu.cit.lugatiman.grossery.features.auth.EmailService;
import edu.cit.lugatiman.grossery.features.auth.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ExpirySchedulerTest {

    @Mock
    private GroceryItemRepository groceryItemRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private ExpiryScheduler expiryScheduler;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testCheckExpiringItems_NoItems() {
        LocalDate targetDate = LocalDate.now().plusDays(3);
        when(groceryItemRepository.findByExpirationDate(targetDate)).thenReturn(Collections.emptyList());

        expiryScheduler.checkExpiringItems();

        verify(emailService, never()).sendExpiryAlert(any(), any(), any());
    }

    @Test
    void testCheckExpiringItems_WithItems() {
        LocalDate targetDate = LocalDate.now().plusDays(3);
        
        User user = new User();
        user.setId(1L);
        user.setEmail("user@example.com");

        GroceryItem item = new GroceryItem();
        item.setId(1L);
        item.setItemName("Pancit Canton");
        item.setExpirationDate(targetDate);
        item.setUser(user);

        when(groceryItemRepository.findByExpirationDate(targetDate)).thenReturn(List.of(item));

        expiryScheduler.checkExpiringItems();

        verify(emailService, times(1)).sendExpiryAlert("user@example.com", "Pancit Canton", targetDate.toString());
    }
}
