package com.emenu.features.order.service;

import com.emenu.enums.order.OrderStatus;
import com.emenu.enums.payment.PaymentMethod;
import com.emenu.enums.payment.PaymentStatus;
import com.emenu.features.auth.models.Business;
import com.emenu.features.auth.models.User;
import com.emenu.features.auth.repository.BusinessRepository;
import com.emenu.features.auth.repository.UserRepository;
import com.emenu.features.main.models.Product;
import com.emenu.features.main.repository.ProductRepository;
import com.emenu.features.order.enums.OrderFromEnum;
import com.emenu.features.order.models.*;
import com.emenu.features.order.repository.OrderRepository;
import com.emenu.features.order.repository.OrderStatusHistoryRepository;
import com.emenu.features.order.repository.OrderDeliveryAddressRepository;
import com.emenu.features.order.repository.OrderDeliveryOptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderTestDataGeneratorService {

    private final OrderRepository orderRepository;
    private final OrderStatusHistoryRepository statusHistoryRepository;
    private final OrderDeliveryAddressRepository deliveryAddressRepository;
    private final OrderDeliveryOptionRepository deliveryOptionRepository;
    private final UserRepository userRepository;
    private final BusinessRepository businessRepository;
    private final ProductRepository productRepository;

    private static final String[] FIRST_NAMES = {
            "Phatmenghor", "Sophea", "Dara", "Sokha", "Piseth", "Chanthy", "Ratha",
            "Vibol", "Pheakdey", "Monirat", "Tida", "Serey", "Samnang", "Bunthian"
    };

    private static final String[] LAST_NAMES = {
            "Twenty", "Kiri", "Cham", "Sin", "Meng", "Rin", "Ouch",
            "Sam", "Thy", "Sary", "Bun", "Pom", "Lim", "Heng"
    };

    private static final String[] PROVINCES = {
            "Phnom Penh", "Kandal", "Takeo", "Kampong Speu", "Kampong Cham",
            "Svay Rieng", "Prey Veng", "Kratie", "Mondolkiri", "Ratanakiri"
    };

    private static final String[] DISTRICTS = {
            "Chbar Ampov", "Russei Keo", "Sen Sok", "Pur Senchey", "Chamcar Mon",
            "Boeng Keng Kang", "Toul Kouk", "Rokar", "Mean Chey", "Sau Nikhom"
    };

    @Transactional
    public int generateTestOrderData(int numberOfOrders) {
        log.info("🔄 Generating {} test orders...", numberOfOrders);

        try {
            List<Business> businesses = businessRepository.findAll();
            List<Product> products = productRepository.findAll();

            if (businesses.isEmpty()) {
                log.warn("❌ No businesses found. Cannot generate test orders.");
                return 0;
            }
            if (products.isEmpty()) {
                log.warn("❌ No products found. Cannot generate test orders.");
                return 0;
            }

            int generatedCount = 0;
            Random random = new Random();

            for (int i = 0; i < numberOfOrders; i++) {
                try {
                    boolean isCustomerOrder = i % 2 == 0;

                    Order order = new Order();
                    order.setOrderNumber(generateOrderNumber());
                    order.setOrderFrom(isCustomerOrder ? OrderFromEnum.CUSTOMER : OrderFromEnum.BUSINESS);
                    order.setSource(isCustomerOrder ? "PUBLIC" : "POS");

                    Business business = businesses.get(random.nextInt(businesses.size()));
                    order.setBusinessId(business.getId());

                    // Generate customer info
                    String firstName = FIRST_NAMES[random.nextInt(FIRST_NAMES.length)];
                    String lastName = LAST_NAMES[random.nextInt(LAST_NAMES.length)];
                    order.setCustomerName(firstName + " " + lastName);
                    order.setCustomerPhone("+855-" + (87 + random.nextInt(12)) + "-" + String.format("%06d", random.nextInt(1000000)));
                    order.setCustomerEmail(firstName.toLowerCase() + "." + lastName.toLowerCase() + random.nextInt(100) + "@gmail.com");
                    order.setCustomerNote("Fashion items please");
                    order.setBusinessNote(isCustomerOrder ? "VIP customer - priority delivery" : "POS Order - " + firstName);

                    // Create delivery address
                    OrderDeliveryAddress deliveryAddress = createDeliveryAddress(order, random);
                    order.setDeliveryAddress(deliveryAddress);

                    // Create delivery option
                    OrderDeliveryOption deliveryOption = createDeliveryOption(order);
                    order.setDeliveryOption(deliveryOption);

                    // Generate items (5-15 items)
                    int itemCount = 5 + random.nextInt(11);
                    List<OrderItem> items = generateOrderItems(order, products, itemCount, random);

                    BigDecimal subtotal = items.stream()
                            .map(OrderItem::getTotalPrice)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    BigDecimal customizationTotal = items.stream()
                            .map(item -> item.getCustomizationTotal() != null ? item.getCustomizationTotal() : BigDecimal.ZERO)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    order.setSubtotal(subtotal);
                    order.setCustomizationTotal(customizationTotal);

                    BigDecimal discountAmount = BigDecimal.ZERO;
                    if (random.nextInt(100) < 30) {
                        discountAmount = subtotal.multiply(BigDecimal.valueOf(0.1));
                        order.setDiscountAmount(discountAmount);
                        order.setDiscountType("percentage");
                        order.setDiscountReason("Promotion: Limited Time Offer");
                    }

                    BigDecimal deliveryFee = BigDecimal.valueOf(random.nextInt(3) + 1);
                    order.setDeliveryFee(deliveryFee);

                    BigDecimal totalAmount = subtotal.add(customizationTotal).add(deliveryFee).subtract(discountAmount);
                    order.setTotalAmount(totalAmount);

                    OrderStatus[] statuses = {OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.COMPLETED, OrderStatus.CANCELLED};
                    order.setOrderStatus(statuses[random.nextInt(statuses.length)]);

                    PaymentMethod[] methods = PaymentMethod.values();
                    order.setPaymentMethod(methods[random.nextInt(methods.length)]);
                    order.setPaymentStatus(order.getOrderStatus() == OrderStatus.COMPLETED ? PaymentStatus.PAID : PaymentStatus.UNPAID);

                    order = orderRepository.save(order);
                    createStatusHistory(order, random);

                    generatedCount++;
                    log.info("✅ Generated order: {} ({}/{})", order.getOrderNumber(), generatedCount, numberOfOrders);

                } catch (Exception e) {
                    log.error("❌ Error generating order {}: {}", i, e.getMessage(), e);
                }
            }

            log.info("🎉 Successfully generated {} test orders", generatedCount);
            return generatedCount;

        } catch (Exception e) {
            log.error("❌ Error during test data generation: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate test order data", e);
        }
    }

    private String generateOrderNumber() {
        LocalDateTime now = LocalDateTime.now();
        String prefix = "FH-" + String.format("%04d%02d", now.getYear(), now.getMonthValue());
        long suffix = System.nanoTime() % 100000;
        return prefix + "-" + String.format("%05d", suffix);
    }

    private OrderDeliveryAddress createDeliveryAddress(Order order, Random random) {
        OrderDeliveryAddress address = new OrderDeliveryAddress();
        address.setOrder(order);
        address.setHouseNumber(String.valueOf(random.nextInt(1000) + 1));
        address.setStreetNumber(String.valueOf(random.nextInt(200) + 1));
        address.setVillage("Village " + (random.nextInt(50) + 1));
        address.setCommune("Commune " + (random.nextInt(30) + 1));
        address.setDistrict(DISTRICTS[random.nextInt(DISTRICTS.length)]);
        address.setProvince(PROVINCES[random.nextInt(PROVINCES.length)]);
        address.setLatitude(BigDecimal.valueOf(11.5 + random.nextDouble() * 2));
        address.setLongitude(BigDecimal.valueOf(104 + random.nextDouble() * 2));
        address.setNote("Delivery instruction: Ring doorbell twice");
        return deliveryAddressRepository.save(address);
    }

    private OrderDeliveryOption createDeliveryOption(Order order) {
        OrderDeliveryOption option = new OrderDeliveryOption();
        option.setOrder(order);
        option.setName("Standard Delivery");
        option.setDescription("Standard delivery service");
        option.setPrice(BigDecimal.valueOf(2.0));
        return deliveryOptionRepository.save(option);
    }

    private List<OrderItem> generateOrderItems(Order order, List<Product> products, int count, Random random) {
        List<OrderItem> items = new ArrayList<>();

        for (int i = 0; i < count; i++) {
            try {
                Product product = products.get(random.nextInt(products.size()));
                OrderItem item = new OrderItem();
                item.setOrderId(order.getId());
                item.setProductId(product.getId());
                item.setProductName(product.getName());
                item.setProductImageUrl(product.getMainImageUrl() != null ? product.getMainImageUrl() : "");
                item.setSku(product.getSku());
                item.setBarcode(product.getBarcode());

                BigDecimal basePrice = BigDecimal.valueOf(50 + random.nextInt(200));
                item.setCurrentPrice(basePrice);

                if (random.nextInt(100) < 40) {
                    item.setHasPromotion(true);
                    item.setPromotionType(random.nextBoolean() ? "PERCENTAGE" : "FIXED_AMOUNT");
                    if ("PERCENTAGE".equals(item.getPromotionType())) {
                        item.setPromotionValue(BigDecimal.valueOf(10 + random.nextInt(30)));
                        item.setFinalPrice(basePrice.multiply(BigDecimal.ONE.subtract(item.getPromotionValue().divide(BigDecimal.valueOf(100)))));
                    } else {
                        item.setPromotionValue(BigDecimal.valueOf(5 + random.nextInt(20)));
                        item.setFinalPrice(basePrice.subtract(item.getPromotionValue()));
                    }
                    item.setPromotionFromDate(LocalDateTime.now().minusDays(random.nextInt(7)));
                    item.setPromotionToDate(LocalDateTime.now().plusDays(random.nextInt(30) + 1));
                } else {
                    item.setHasPromotion(false);
                    item.setFinalPrice(basePrice);
                }

                int quantity = 1 + random.nextInt(5);
                item.setQuantity(quantity);
                item.setUnitPrice(item.getFinalPrice());
                item.setTotalPrice(item.getFinalPrice().multiply(BigDecimal.valueOf(quantity)));

                if (random.nextInt(100) < 30) {
                    BigDecimal customizationTotal = BigDecimal.valueOf(5 + random.nextInt(15));
                    item.setCustomizationTotal(customizationTotal);
                    item.setCustomizations("[{\"productCustomizationId\": \"" + UUID.randomUUID() + "\", \"name\": \"Extra Toppings\", \"priceAdjustment\": " + customizationTotal + "}]");
                }

                items.add(item);
            } catch (Exception e) {
                log.warn("Error generating item {}: {}", i, e.getMessage());
            }
        }

        return items;
    }

    private void createStatusHistory(Order order, Random random) {
        OrderStatus[] statuses = {OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.COMPLETED, OrderStatus.CANCELLED};
        List<OrderStatus> statusSequence = new ArrayList<>();

        int historyCount = 7 + random.nextInt(4);
        for (int i = 0; i < historyCount; i++) {
            statusSequence.add(statuses[random.nextInt(statuses.length)]);
        }

        LocalDateTime currentTime = order.getCreatedAt() != null ? order.getCreatedAt() : LocalDateTime.now();
        List<User> businessUsers = userRepository.findAllByBusinessIdAndIsDeletedFalse(order.getBusinessId());

        for (int i = 0; i < statusSequence.size(); i++) {
            OrderStatusHistory history = new OrderStatusHistory(
                    order.getId(),
                    statusSequence.get(i),
                    "Status update " + (i + 1) + ": " + statusSequence.get(i).getDisplayName(),
                    !businessUsers.isEmpty() ? businessUsers.get(random.nextInt(businessUsers.size())).getId() : null,
                    !businessUsers.isEmpty() ? businessUsers.get(random.nextInt(businessUsers.size())).getProfile() != null ?
                            businessUsers.get(0).getProfile().getFirstName() + " " + businessUsers.get(0).getProfile().getLastName() : "Admin" : "System"
            );
            statusHistoryRepository.save(history);
        }
    }
}
