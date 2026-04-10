package edu.cit.lugatiman.grossery.repository;

import edu.cit.lugatiman.grossery.entity.Receipt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReceiptRepository extends JpaRepository<Receipt, Long> {
}
