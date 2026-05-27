package edu.cit.lugatiman.grossery.features.grocery;

import edu.cit.lugatiman.grossery.features.auth.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class ExpiryScheduler {

    @Autowired
    private GroceryItemRepository groceryItemRepository;

    @Autowired
    private EmailService emailService;

    // Runs every day at 8:00 AM
    @Scheduled(cron = "0 0 8 * * ?")
    public void checkExpiringItems() {
        System.out.println("ExpiryScheduler: Checking for items expiring in exactly 3 days...");
        
        LocalDate targetDate = LocalDate.now().plusDays(3);
        List<GroceryItem> expiringItems = groceryItemRepository.findByExpirationDate(targetDate);
        
        if (expiringItems.isEmpty()) {
            System.out.println("ExpiryScheduler: No items found expiring on " + targetDate);
            return;
        }

        System.out.println("ExpiryScheduler: Found " + expiringItems.size() + " items expiring on " + targetDate);
        
        for (GroceryItem item : expiringItems) {
            if (item.getUser() != null && item.getUser().getEmail() != null) {
                try {
                    emailService.sendExpiryAlert(
                            item.getUser().getEmail(),
                            item.getItemName(),
                            targetDate.toString()
                    );
                    System.out.println("ExpiryScheduler: Sent expiry alert to " + item.getUser().getEmail() + " for item: " + item.getItemName());
                } catch (Exception e) {
                    System.err.println("ExpiryScheduler: Failed to send expiry alert to " + item.getUser().getEmail() + ": " + e.getMessage());
                }
            }
        }
    }
}
