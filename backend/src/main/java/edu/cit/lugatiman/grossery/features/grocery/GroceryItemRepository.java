package edu.cit.lugatiman.grossery.features.grocery;


import edu.cit.lugatiman.grossery.features.auth.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface GroceryItemRepository extends JpaRepository<GroceryItem, Long> {
    List<GroceryItem> findByUser(User user);
    List<GroceryItem> findByUserAndExpirationDateBetween(User user, LocalDate start, LocalDate end);
}
