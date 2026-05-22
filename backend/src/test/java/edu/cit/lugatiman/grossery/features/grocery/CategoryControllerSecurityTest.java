package edu.cit.lugatiman.grossery.features.grocery;

import edu.cit.lugatiman.grossery.features.auth.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

class CategoryControllerSecurityTest {

    @Mock
    private GroceryService groceryService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private GroceryController groceryController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testDeleteCategory_RegularUserDenied() {
        // Arrange
        String email = "user@example.com";
        String categoryName = "Beverages";

        when(authentication.getName()).thenReturn(email);
        
        // Mock service throwing AccessDeniedException for regular user
        doThrow(new AccessDeniedException("Only administrators are authorized to delete categories."))
                .when(groceryService).deleteCategory(email, categoryName);

        // Act & Assert
        assertThrows(AccessDeniedException.class, () -> {
            groceryController.deleteCategory(categoryName, authentication);
        });

        verify(groceryService, times(1)).deleteCategory(email, categoryName);
    }
}
