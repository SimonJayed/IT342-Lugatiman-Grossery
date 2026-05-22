package edu.cit.lugatiman.grossery.features.market;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MarketPriceRepository extends JpaRepository<MarketPrice, Long> {
    Optional<MarketPrice> findByItemNameIgnoreCase(String itemName);
    List<MarketPrice> findByItemNameContainingIgnoreCase(String itemName);
}
