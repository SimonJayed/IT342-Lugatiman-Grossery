package edu.cit.lugatiman.grossery.features.receipt;

import edu.cit.lugatiman.grossery.features.auth.User;
import edu.cit.lugatiman.grossery.features.auth.UserRepository;
import edu.cit.lugatiman.grossery.features.grocery.GroceryItem;
import edu.cit.lugatiman.grossery.features.grocery.GroceryItemRepository;
import edu.cit.lugatiman.grossery.payload.ApiResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.Authentication;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ReceiptServiceTest {

    @Mock
    private ReceiptRepository receiptRepository;

    @Mock
    private GroceryItemRepository groceryItemRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private ReceiptController receiptController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testUploadReceipt_Unauthorized() {
        // Arrange
        String email = "test@example.com";
        Long groceryId = 1L;
        MockMultipartFile file = new MockMultipartFile("file", "test.jpg", "image/jpeg", "image-content".getBytes());

        User user = new User();
        user.setId(1L);
        user.setEmail(email);

        User otherUser = new User();
        otherUser.setId(2L);
        otherUser.setEmail("other@example.com");

        GroceryItem item = new GroceryItem();
        item.setId(groceryId);
        item.setItemName("Canned Tuna");
        item.setUser(otherUser); // belongs to other user

        when(authentication.getName()).thenReturn(email);
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(groceryItemRepository.findById(groceryId)).thenReturn(Optional.of(item));

        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            receiptController.uploadReceipt(groceryId, file, authentication);
        });

        verify(receiptRepository, never()).save(any());
    }

    @Test
    void testUploadReceipt_Success() {
        // Arrange
        String email = "test@example.com";
        Long groceryId = 1L;
        MockMultipartFile file = new MockMultipartFile("file", "receipt.jpg", "image/jpeg", "dummy-receipt-bytes".getBytes());

        User user = new User();
        user.setId(1L);
        user.setEmail(email);

        GroceryItem item = new GroceryItem();
        item.setId(groceryId);
        item.setItemName("Canned Tuna");
        item.setUser(user); // belongs to the logged-in user

        when(authentication.getName()).thenReturn(email);
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(groceryItemRepository.findById(groceryId)).thenReturn(Optional.of(item));

        Receipt mockSavedReceipt = new Receipt();
        mockSavedReceipt.setId(10L);
        mockSavedReceipt.setFilePath("/uploads/receipts/12345_receipt.jpg");
        when(receiptRepository.save(any(Receipt.class))).thenReturn(mockSavedReceipt);

        // Act
        ResponseEntity<ApiResponse> response = receiptController.uploadReceipt(groceryId, file, authentication);

        // Assert
        assertEquals(200, response.getStatusCode().value());
        assertEquals(true, response.getBody().getSuccess());
        verify(receiptRepository, times(1)).save(any(Receipt.class));
    }
}
