package com.emenu.features.stock.loader;

import com.emenu.enums.product.ProductStatus;
import com.emenu.features.main.models.Product;
import com.emenu.features.main.models.ProductSize;
import com.emenu.features.main.repository.ProductRepository;
import com.emenu.features.main.repository.ProductSizeRepository;
import com.emenu.features.stock.models.ProductStock;
import com.emenu.features.stock.repository.ProductStockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Loads test data for product stock.
 * Only runs in 'dev' profile to avoid generating test data in production.
 *
 * For each product with sizes, creates stock records with:
 * - Initial quantity on hand
 * - Cost price (priceIn)
 * - Location info
 * - Status tracking
 */
@Component
@RequiredArgsConstructor
@Profile("dev")
public class ProductStockDataLoader implements ApplicationRunner {

    private final ProductRepository productRepository;
    private final ProductSizeRepository productSizeRepository;
    private final ProductStockRepository productStockRepository;

    private static final Map<String, int[]> STOCK_QUANTITIES = Map.of(
        "Small", new int[]{50, 100},
        "Medium", new int[]{100, 150},
        "Large", new int[]{75, 125},
        "XL", new int[]{40, 80},
        "XXL", new int[]{30, 60},
        "Regular", new int[]{100, 200},
        "Extra", new int[]{50, 100}
    );

    @Override
    @Transactional
    public void run(ApplicationArguments args) throws Exception {

        try {
            loadProductStockData();
        } catch (Exception e) {
        }
    }

    /**
     * Load product stock data for all products with sizes
     */
    private int loadProductStockData() {
        // Get all non-deleted products with sizes
        List<Product> productsWithSizes = productRepository.findAll().stream()
            .filter(p -> !p.getIsDeleted() && Boolean.TRUE.equals(p.getHasSizes()))
            .collect(Collectors.toList());


        int totalCreated = 0;

        for (Product product : productsWithSizes) {
            // Get sizes for this product using the repository
            List<ProductSize> sizes = productSizeRepository.findByProductId(product.getId());

            if (sizes.isEmpty()) {
                continue;
            }

            // Create stock for each size
            for (ProductSize size : sizes) {
                boolean stockExists = productStockRepository
                    .findByProductIdAndProductSizeIdAndBusinessId(
                        product.getId(),
                        size.getId(),
                        product.getBusinessId()
                    )
                    .isPresent();

                if (!stockExists) {
                    ProductStock stock = createProductStock(product, size);
                    productStockRepository.save(stock);
                    totalCreated++;
                }
            }
        }

        return totalCreated;
    }

    /**
     * Create a ProductStock entity with test data
     */
    private ProductStock createProductStock(Product product, ProductSize size) {
        ProductStock stock = new ProductStock();
        stock.setId(UUID.randomUUID());
        stock.setBusinessId(product.getBusinessId());
        stock.setProductId(product.getId());
        stock.setProductSizeId(size.getId());

        // Generate random stock quantities
        int[] quantityRange = STOCK_QUANTITIES.getOrDefault(size.getName(), new int[]{50, 100});
        int quantity = getRandomQuantity(quantityRange[0], quantityRange[1]);

        stock.setQuantityOnHand(quantity);
        stock.setQuantityReserved(0);
        stock.setQuantityAvailable(quantity);

        // Set cost price (slightly lower than selling price)
        BigDecimal costPrice = calculateCostPrice(size.getPrice());
        stock.setPriceIn(costPrice);

        // Set dates
        stock.setDateIn(LocalDateTime.now().minusDays(getRandomDays(1, 30)));
        stock.setStatus(ProductStatus.ACTIVE);
        stock.setIsExpired(false);
        stock.setLocation(getRandomLocation());

        return stock;
    }

    /**
     * Calculate cost price as 60-80% of selling price
     */
    private BigDecimal calculateCostPrice(BigDecimal sellingPrice) {
        if (sellingPrice == null) {
            return BigDecimal.valueOf(1.0);
        }
        double discountPercentage = getRandomDouble(60, 80);
        return sellingPrice.multiply(BigDecimal.valueOf(discountPercentage / 100));
    }

    /**
     * Get random quantity within range
     */
    private int getRandomQuantity(int min, int max) {
        return min + (int) (Math.random() * (max - min + 1));
    }

    /**
     * Get random days offset
     */
    private int getRandomDays(int min, int max) {
        return min + (int) (Math.random() * (max - min + 1));
    }

    /**
     * Get random double value within range
     */
    private double getRandomDouble(double min, double max) {
        return min + (Math.random() * (max - min));
    }

    /**
     * Get random storage location
     */
    private String getRandomLocation() {
        String[] locations = {
            "Warehouse A - Shelf 1",
            "Warehouse A - Shelf 2",
            "Warehouse B - Cold Storage",
            "Warehouse B - Shelf 3",
            "Storage Room 1",
            "Storage Room 2",
            "Counter Display",
            "Back Room"
        };
        return locations[(int) (Math.random() * locations.length)];
    }
}
