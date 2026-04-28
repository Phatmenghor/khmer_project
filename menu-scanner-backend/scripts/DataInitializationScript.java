package com.emenu.scripts;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Complete Test Data Initialization Script
 * Fashion Hub - Clothing Store with ALL Features Enabled
 * User: phatmenghor20@gmail.com (BUSINESS_OWNER)
 * Features: Categories ✓ | Subcategories ✓ | Brands ✓
 *
 * Usage: Run this in DataInitializationService or use the SQL file directly
 */
public class DataInitializationScript {

    // ============================================================================
    // UUIDs for Test Data (Fixed for reproducibility)
    // ============================================================================

    // Business
    public static final UUID BUSINESS_ID = UUID.fromString("550e8400-e29b-41d4-a716-446655440000");

    // User
    public static final UUID USER_ID = UUID.fromString("660e8400-e29b-41d4-a716-446655440001");

    // Business Settings
    public static final UUID BUSINESS_SETTING_ID = UUID.fromString("770e8400-e29b-41d4-a716-446655440002");

    // Categories
    public static final UUID CATEGORY_MEN_ID = UUID.fromString("880e8400-e29b-41d4-a716-446655440010");
    public static final UUID CATEGORY_WOMEN_ID = UUID.fromString("880e8400-e29b-41d4-a716-446655440011");
    public static final UUID CATEGORY_KIDS_ID = UUID.fromString("880e8400-e29b-41d4-a716-446655440012");

    // Subcategories - Men
    public static final UUID SUBCAT_MEN_SHIRTS_ID = UUID.fromString("990e8400-e29b-41d4-a716-446655440020");
    public static final UUID SUBCAT_MEN_PANTS_ID = UUID.fromString("990e8400-e29b-41d4-a716-446655440021");
    public static final UUID SUBCAT_MEN_SHOES_ID = UUID.fromString("990e8400-e29b-41d4-a716-446655440022");

    // Subcategories - Women
    public static final UUID SUBCAT_WOMEN_DRESSES_ID = UUID.fromString("990e8400-e29b-41d4-a716-446655440030");
    public static final UUID SUBCAT_WOMEN_TOPS_ID = UUID.fromString("990e8400-e29b-41d4-a716-446655440031");
    public static final UUID SUBCAT_WOMEN_ACCESSORIES_ID = UUID.fromString("990e8400-e29b-41d4-a716-446655440032");

    // Brands
    public static final UUID BRAND_NIKE_ID = UUID.fromString("aa0e8400-e29b-41d4-a716-446655440040");
    public static final UUID BRAND_ADIDAS_ID = UUID.fromString("aa0e8400-e29b-41d4-a716-446655440041");
    public static final UUID BRAND_GUCCI_ID = UUID.fromString("aa0e8400-e29b-41d4-a716-446655440042");

    // Products
    public static final UUID PRODUCT_TSHIRT_ID = UUID.fromString("bb0e8400-e29b-41d4-a716-446655440050");
    public static final UUID PRODUCT_POLO_ID = UUID.fromString("bb0e8400-e29b-41d4-a716-446655440051");
    public static final UUID PRODUCT_BLOUSE_ID = UUID.fromString("bb0e8400-e29b-41d4-a716-446655440052");

    // ============================================================================
    // TEST DATA STRUCTURE
    // ============================================================================

    public static class TestDataStructure {

        // BUSINESS
        public static final String BUSINESS_NAME = "Fashion Hub";
        public static final String BUSINESS_EMAIL = "fashion@example.com";
        public static final String BUSINESS_PHONE = "+855-12-345-678";

        // USER
        public static final String USER_EMAIL = "phatmenghor20@gmail.com";
        public static final String USER_IDENTIFIER = "phatmenghor20";
        public static final String USER_PASSWORD = "$2a$10$VIIvBQp8EySmNrY3Zs.aAeZmOSjkY2LkYmF1F.V1RjWlBGxHN1pAm"; // Admin@123

        // BUSINESS SETTINGS (ALL ENABLED)
        public static final boolean USE_CATEGORIES = true;
        public static final boolean USE_SUBCATEGORIES = true;
        public static final boolean USE_BRANDS = true;
        public static final double TAX_PERCENTAGE = 10.0;

        // ====================================================================
        // CATEGORIES
        // ====================================================================
        public static class Category {
            public String id;
            public String name;
            public String description;
            public String imageUrl;

            public Category(String id, String name, String description, String imageUrl) {
                this.id = id;
                this.name = name;
                this.description = description;
                this.imageUrl = imageUrl;
            }
        }

        public static final Category[] CATEGORIES = {
            new Category("Men", "Men", "Men's clothing collection", "https://cdn.example.com/men-category.jpg"),
            new Category("Women", "Women", "Women's clothing collection", "https://cdn.example.com/women-category.jpg"),
            new Category("Kids", "Kids", "Kids' clothing collection", "https://cdn.example.com/kids-category.jpg")
        };

        // ====================================================================
        // SUBCATEGORIES
        // ====================================================================
        public static class Subcategory {
            public String parentCategory;
            public String name;
            public String imageUrl;

            public Subcategory(String parentCategory, String name, String imageUrl) {
                this.parentCategory = parentCategory;
                this.name = name;
                this.imageUrl = imageUrl;
            }
        }

        public static final Subcategory[] SUBCATEGORIES = {
            // Under Men
            new Subcategory("Men", "Shirts", "https://cdn.example.com/men-shirts.jpg"),
            new Subcategory("Men", "Pants", "https://cdn.example.com/men-pants.jpg"),
            new Subcategory("Men", "Shoes", "https://cdn.example.com/men-shoes.jpg"),
            // Under Women
            new Subcategory("Women", "Dresses", "https://cdn.example.com/women-dresses.jpg"),
            new Subcategory("Women", "Tops", "https://cdn.example.com/women-tops.jpg"),
            new Subcategory("Women", "Accessories", "https://cdn.example.com/women-accessories.jpg")
        };

        // ====================================================================
        // BRANDS
        // ====================================================================
        public static class Brand {
            public String name;
            public String logoUrl;
            public String description;

            public Brand(String name, String logoUrl, String description) {
                this.name = name;
                this.logoUrl = logoUrl;
                this.description = description;
            }
        }

        public static final Brand[] BRANDS = {
            new Brand("Nike", "https://cdn.example.com/nike-logo.png", "Nike athletic brand"),
            new Brand("Adidas", "https://cdn.example.com/adidas-logo.png", "Adidas sports brand"),
            new Brand("Gucci", "https://cdn.example.com/gucci-logo.png", "Gucci luxury brand")
        };

        // ====================================================================
        // PRODUCTS
        // ====================================================================
        public static class Product {
            public String name;
            public String description;
            public BigDecimal price;
            public String category;
            public String subcategory;
            public String brand;
            public String sku;
            public String barcode;
            public String mainImageUrl;
            public String[] sizes;
            public BigDecimal[] sizeAdjustments;
            public String[] customizations;
            public BigDecimal[] customizationPrices;
            public String[] images;

            public Product(String name, String description, BigDecimal price, String category, String subcategory, String brand) {
                this.name = name;
                this.description = description;
                this.price = price;
                this.category = category;
                this.subcategory = subcategory;
                this.brand = brand;
            }
        }

        public static final Product CLASSIC_TSHIRT;
        public static final Product ATHLETIC_POLO;
        public static final Product SILK_BLOUSE;

        static {
            // Classic T-Shirt
            CLASSIC_TSHIRT = new Product(
                "Classic T-Shirt",
                "Premium cotton t-shirt available in multiple colors",
                new BigDecimal("25.00"),
                "Men",
                "Shirts",
                "Nike"
            );
            CLASSIC_TSHIRT.sku = "TSHIRT-NIKE-001";
            CLASSIC_TSHIRT.barcode = "1234567890123";
            CLASSIC_TSHIRT.mainImageUrl = "https://cdn.example.com/tshirt-main.jpg";
            CLASSIC_TSHIRT.sizes = new String[]{"Small", "Medium", "Large", "XL", "XXL"};
            CLASSIC_TSHIRT.sizeAdjustments = new BigDecimal[]{
                BigDecimal.ZERO, BigDecimal.ZERO, new BigDecimal("2.00"),
                new BigDecimal("3.00"), new BigDecimal("5.00")
            };
            CLASSIC_TSHIRT.customizations = new String[]{"Custom Color", "Embroidery Logo", "Gift Wrap"};
            CLASSIC_TSHIRT.customizationPrices = new BigDecimal[]{
                new BigDecimal("3.00"), new BigDecimal("2.00"), new BigDecimal("2.00")
            };
            CLASSIC_TSHIRT.images = new String[]{
                "https://cdn.example.com/tshirt-front.jpg",
                "https://cdn.example.com/tshirt-back.jpg",
                "https://cdn.example.com/tshirt-detail.jpg"
            };

            // Athletic Polo Shirt
            ATHLETIC_POLO = new Product(
                "Athletic Polo Shirt",
                "Comfortable polo shirt for sports and casual wear",
                new BigDecimal("35.00"),
                "Men",
                "Shirts",
                "Adidas"
            );
            ATHLETIC_POLO.sku = "POLO-ADIDAS-001";
            ATHLETIC_POLO.barcode = "1234567890124";
            ATHLETIC_POLO.mainImageUrl = "https://cdn.example.com/polo-main.jpg";
            ATHLETIC_POLO.sizes = new String[]{"Small", "Medium", "Large", "XL"};
            ATHLETIC_POLO.sizeAdjustments = new BigDecimal[]{
                BigDecimal.ZERO, BigDecimal.ZERO, new BigDecimal("2.00"), new BigDecimal("3.00")
            };
            ATHLETIC_POLO.customizations = new String[]{"Team Logo Print", "Name Embroidery", "Premium Packaging"};
            ATHLETIC_POLO.customizationPrices = new BigDecimal[]{
                new BigDecimal("4.00"), new BigDecimal("3.50"), new BigDecimal("2.50")
            };
            ATHLETIC_POLO.images = new String[]{
                "https://cdn.example.com/polo-front.jpg",
                "https://cdn.example.com/polo-back.jpg"
            };

            // Silk Evening Blouse
            SILK_BLOUSE = new Product(
                "Silk Evening Blouse",
                "Elegant silk blouse perfect for evening events",
                new BigDecimal("89.00"),
                "Women",
                "Tops",
                "Gucci"
            );
            SILK_BLOUSE.sku = "BLOUSE-GUCCI-001";
            SILK_BLOUSE.barcode = "1234567890125";
            SILK_BLOUSE.mainImageUrl = "https://cdn.example.com/blouse-main.jpg";
            SILK_BLOUSE.sizes = new String[]{"XS", "Small", "Medium", "Large"};
            SILK_BLOUSE.sizeAdjustments = new BigDecimal[]{
                BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, new BigDecimal("5.00")
            };
            SILK_BLOUSE.customizations = new String[]{"Custom Alteration", "Monogram Embroidery", "Luxury Gift Box"};
            SILK_BLOUSE.customizationPrices = new BigDecimal[]{
                new BigDecimal("10.00"), new BigDecimal("8.00"), new BigDecimal("5.00")
            };
            SILK_BLOUSE.images = new String[]{
                "https://cdn.example.com/blouse-front.jpg",
                "https://cdn.example.com/blouse-side.jpg",
                "https://cdn.example.com/blouse-detail.jpg"
            };
        }
    }

    // ============================================================================
    // SUMMARY
    // ============================================================================

    public static void printSummary() {
        System.out.println("============================================================================");
        System.out.println("TEST DATA INITIALIZATION SUMMARY");
        System.out.println("============================================================================");
        System.out.println("✓ Business: " + TestDataStructure.BUSINESS_NAME);
        System.out.println("✓ User: " + TestDataStructure.USER_EMAIL + " (BUSINESS_OWNER)");
        System.out.println("✓ Settings: Categories (TRUE) | Subcategories (TRUE) | Brands (TRUE)");
        System.out.println("✓ Categories: 3 (Men, Women, Kids)");
        System.out.println("✓ Subcategories: 6 (Shirts, Pants, Shoes under Men; Dresses, Tops, Accessories under Women)");
        System.out.println("✓ Brands: 3 (Nike, Adidas, Gucci)");
        System.out.println("✓ Products: 3 (Classic T-Shirt, Athletic Polo, Silk Evening Blouse)");
        System.out.println("✓ Sizes: 14 (S, M, L, XL, XXL variations)");
        System.out.println("✓ Customizations: 9 (Custom Color, Embroidery, Gift Wrap, etc.)");
        System.out.println("✓ Images: 8 (Front, Back, Detail views)");
        System.out.println("============================================================================");
    }

    public static void main(String[] args) {
        printSummary();
    }
}
