# ☕ Coffee Shop - Size + Customization Example

This shows how to handle **size** + **sugar level** + **milk type** + **extra shots** in one system using flexible attributes.

---

## 🎯 The Problem

Coffee shops have TWO types of options:

1. **Size variants** (Small, Medium, Large) - Different prices
2. **Customizations** (Sugar, Milk, Shots) - Add during order

How do we handle this?

**Answer:** Use base **variants** for sizes + **customizable attributes** during checkout.

---

## ☕ ICED LATTE - Complete Example

### Database Structure

**Product:**
```sql
INSERT INTO products (id, name, business_id, price) VALUES
('p1', 'Iced Latte', 'biz-coffee-1', 3.50);
```

**Variants (Size-based pricing):**
```sql
INSERT INTO product_variants (id, product_id, name, price, sku, attributes) VALUES
('v1', 'p1', 'Small', 2.50, 'ILATTE-S', '{"size": "small", "volume": "12oz"}'),
('v2', 'p1', 'Medium', 3.50, 'ILATTE-M', '{"size": "medium", "volume": "16oz"}'),
('v3', 'p1', 'Large', 4.50, 'ILATTE-L', '{"size": "large", "volume": "20oz"}');
```

---

## 📱 CUSTOMER JOURNEY

### Step 1: Customer Selects Product

```
Frontend shows:
┌─────────────────────┐
│ Iced Latte          │
│ $2.50 - $4.50      │
│                    │
│ Select Size:       │
│ ○ Small  - $2.50  │
│ ○ Medium - $3.50  │
│ ○ Large  - $4.50  │
│                    │
│ [Next → Customize] │
└─────────────────────┘
```

**Customer selects:** Medium ($3.50)

---

### Step 2: Customer Customizes

When customer clicks "Medium", show customization options:

```
┌─────────────────────┐
│ Iced Latte - Medium │
│ Base Price: $3.50  │
├─────────────────────┤
│                    │
│ Sugar Level:       │
│ ○ No Sugar    (+$0) │
│ ○ Normal      (+$0) │
│ ◉ Extra Sugar (+$0.25) │
│ ○ Very Sweet  (+$0.50) │
│                    │
│ Milk Type:         │
│ ○ Regular Milk (+$0) │
│ ○ Almond Milk  (+$0.50) │
│ ◉ Oat Milk    (+$0.75) │
│ ○ Coconut      (+$0.75) │
│                    │
│ Extra Shots:       │
│ ○ No Extra    (+$0) │
│ ◉ +1 Shot    (+$0.75) │
│ ○ +2 Shots   (+$1.50) │
│                    │
│ Total: $5.00       │
│ [Add to Cart]      │
└─────────────────────┘
```

---

## 🔌 API Responses

### 1. GET Product (Initial)

```json
{
  "id": "p1",
  "name": "Iced Latte",
  "basePrice": 3.50,
  
  "variants": [
    {
      "id": "v1",
      "name": "Small",
      "price": 2.50,
      "attributes": {
        "size": "small",
        "volume": "12oz"
      }
    },
    {
      "id": "v2",
      "name": "Medium",
      "price": 3.50,
      "attributes": {
        "size": "medium",
        "volume": "16oz"
      }
    },
    {
      "id": "v3",
      "name": "Large",
      "price": 4.50,
      "attributes": {
        "size": "large",
        "volume": "20oz"
      }
    }
  ],
  
  "customizationOptions": [
    {
      "id": "sugar",
      "name": "Sugar Level",
      "type": "CHOICE",
      "required": false,
      "options": [
        {
          "id": "no-sugar",
          "name": "No Sugar",
          "priceAdjustment": 0.00
        },
        {
          "id": "normal",
          "name": "Normal",
          "priceAdjustment": 0.00,
          "default": true
        },
        {
          "id": "extra-sugar",
          "name": "Extra Sugar",
          "priceAdjustment": 0.25
        },
        {
          "id": "very-sweet",
          "name": "Very Sweet",
          "priceAdjustment": 0.50
        }
      ]
    },
    {
      "id": "milk",
      "name": "Milk Type",
      "type": "CHOICE",
      "required": false,
      "options": [
        {
          "id": "regular",
          "name": "Regular Milk",
          "priceAdjustment": 0.00,
          "default": true
        },
        {
          "id": "almond",
          "name": "Almond Milk",
          "priceAdjustment": 0.50
        },
        {
          "id": "oat",
          "name": "Oat Milk",
          "priceAdjustment": 0.75
        },
        {
          "id": "coconut",
          "name": "Coconut Milk",
          "priceAdjustment": 0.75
        }
      ]
    },
    {
      "id": "shots",
      "name": "Extra Shots",
      "type": "CHOICE",
      "required": false,
      "options": [
        {
          "id": "no-extra",
          "name": "No Extra",
          "priceAdjustment": 0.00,
          "default": true
        },
        {
          "id": "plus-1",
          "name": "+1 Shot",
          "priceAdjustment": 0.75
        },
        {
          "id": "plus-2",
          "name": "+2 Shots",
          "priceAdjustment": 1.50
        }
      ]
    }
  ]
}
```

---

### 2. Add to Cart (Customer Selection)

**Frontend sends:**
```json
{
  "productId": "p1",
  "variantId": "v2",
  "quantity": 1,
  
  "customizations": {
    "sugar": "extra-sugar",
    "milk": "oat",
    "shots": "plus-1"
  }
}
```

**Backend calculates:**
```
Base variant price (Medium):    $3.50
+ Extra sugar:                   $0.25
+ Oat milk:                      $0.75
+ 1 extra shot:                  $0.75
─────────────────────────────
Total:                           $5.25
```

---

### 3. Cart Response

```json
{
  "cartItems": [
    {
      "id": "item-1",
      "productId": "p1",
      "productName": "Iced Latte",
      "variantId": "v2",
      "variantName": "Medium",
      "basePrice": 3.50,
      "quantity": 1,
      
      "customizations": {
        "sugar": {
          "id": "extra-sugar",
          "name": "Extra Sugar",
          "priceAdjustment": 0.25
        },
        "milk": {
          "id": "oat",
          "name": "Oat Milk",
          "priceAdjustment": 0.75
        },
        "shots": {
          "id": "plus-1",
          "name": "+1 Shot",
          "priceAdjustment": 0.75
        }
      },
      
      "customizationPrice": 1.75,
      "finalPrice": 5.25,
      "totalPrice": 5.25,
      
      "displayText": "Iced Latte (Medium) - Extra Sugar, Oat Milk, +1 Shot"
    }
  ],
  
  "subtotal": 5.25
}
```

---

## 🗄️ Database Schema

### Products Table
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  name VARCHAR(255),        -- "Iced Latte"
  business_id UUID,
  price DECIMAL(10, 2),     -- Base price (cheapest variant)
  created_at TIMESTAMP
);
```

### Product Variants (Sizes)
```sql
CREATE TABLE product_variants (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  name VARCHAR(255),        -- "Small", "Medium", "Large"
  price DECIMAL(10, 2),     -- Size-specific price
  sku VARCHAR(255),
  attributes JSONB,         -- {"size": "medium", "volume": "16oz"}
  created_at TIMESTAMP
);
```

### NEW: Product Customizations
```sql
CREATE TABLE product_customizations (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  customization_key VARCHAR(100),  -- "sugar", "milk", "shots"
  name VARCHAR(255),               -- "Sugar Level", "Milk Type"
  customization_type VARCHAR(50),  -- "CHOICE", "QUANTITY"
  required BOOLEAN DEFAULT false,
  created_at TIMESTAMP
);

CREATE TABLE customization_options (
  id UUID PRIMARY KEY,
  customization_id UUID REFERENCES product_customizations(id),
  option_key VARCHAR(100),         -- "extra-sugar", "oat"
  option_name VARCHAR(255),        -- "Extra Sugar", "Oat Milk"
  price_adjustment DECIMAL(10, 2), -- +0.25, +0.75
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP
);
```

---

## ☕ MORE COFFEE EXAMPLES

### HOT ESPRESSO

**Variants (Temperature + Shots):**
```json
"variants": [
  {
    "id": "v1",
    "name": "Single Shot",
    "price": 1.50,
    "attributes": {
      "shots": 1,
      "temperature": "hot"
    }
  },
  {
    "id": "v2",
    "name": "Double Shot",
    "price": 2.50,
    "attributes": {
      "shots": 2,
      "temperature": "hot"
    }
  },
  {
    "id": "v3",
    "name": "Triple Shot",
    "price": 3.50,
    "attributes": {
      "shots": 3,
      "temperature": "hot"
    }
  }
]
```

**Customizations:**
```json
"customizationOptions": [
  {
    "id": "cup-size",
    "name": "Cup Size",
    "options": [
      {"name": "Shot (1oz)", "priceAdjustment": 0},
      {"name": "Small Cup (4oz)", "priceAdjustment": 0.25},
      {"name": "Medium Cup (8oz)", "priceAdjustment": 0.50}
    ]
  },
  {
    "id": "milk-foam",
    "name": "Milk & Foam",
    "options": [
      {"name": "No Milk", "priceAdjustment": 0},
      {"name": "Light Foam", "priceAdjustment": 0.25},
      {"name": "Extra Foam", "priceAdjustment": 0.25}
    ]
  }
]
```

---

### CAPPUCCINO

**Variants (Temperature):**
```json
"variants": [
  {
    "id": "v1",
    "name": "Hot",
    "price": 3.50,
    "attributes": {
      "temperature": "hot"
    }
  },
  {
    "id": "v2",
    "name": "Iced",
    "price": 4.00,
    "attributes": {
      "temperature": "cold"
    }
  }
]
```

**Customizations:**
```json
"customizationOptions": [
  {
    "id": "milk-type",
    "name": "Milk Type",
    "options": [
      {"name": "Regular", "priceAdjustment": 0},
      {"name": "Almond", "priceAdjustment": 0.50},
      {"name": "Oat", "priceAdjustment": 0.75},
      {"name": "Soy", "priceAdjustment": 0.50}
    ]
  },
  {
    "id": "flavor",
    "name": "Flavor Shot",
    "options": [
      {"name": "None", "priceAdjustment": 0},
      {"name": "Vanilla", "priceAdjustment": 0.50},
      {"name": "Hazelnut", "priceAdjustment": 0.50},
      {"name": "Caramel", "priceAdjustment": 0.50},
      {"name": "Chocolate", "priceAdjustment": 0.75}
    ]
  },
  {
    "id": "sugar",
    "name": "Sweetness",
    "options": [
      {"name": "No Sugar", "priceAdjustment": 0},
      {"name": "Normal", "priceAdjustment": 0},
      {"name": "Extra Sweet", "priceAdjustment": 0.25}
    ]
  }
]
```

---

## 💻 FRONTEND COMPONENT

### ProductCustomizer.tsx

```typescript
import React, { useState } from 'react';

interface ProductCustomizerProps {
  product: Product;
  selectedVariantId: string;
  customizationOptions: CustomizationOption[];
  onAdd: (selections: any) => void;
}

export function ProductCustomizer({
  product,
  selectedVariantId,
  customizationOptions,
  onAdd
}: ProductCustomizerProps) {
  const [customizations, setCustomizations] = useState<Record<string, string>>({});
  
  const selectedVariant = product.variants.find(v => v.id === selectedVariantId);
  
  // Calculate total price
  const basePrice = selectedVariant?.price || product.price;
  const customizationPrice = customizationOptions.reduce((total, option) => {
    const selectedValue = customizations[option.id];
    const selectedOption = option.options.find(o => o.id === selectedValue);
    return total + (selectedOption?.priceAdjustment || 0);
  }, 0);
  const totalPrice = basePrice + customizationPrice;
  
  const handleCustomizationChange = (customizationId: string, optionId: string) => {
    setCustomizations(prev => ({
      ...prev,
      [customizationId]: optionId
    }));
  };
  
  const handleAddToCart = () => {
    onAdd({
      productId: product.id,
      variantId: selectedVariantId,
      customizations,
      quantity: 1
    });
  };
  
  return (
    <div className="customizer">
      <h2>{product.name}</h2>
      <p className="variant-name">{selectedVariant?.name}</p>
      <p className="base-price">${basePrice.toFixed(2)}</p>
      
      <div className="customization-sections">
        {customizationOptions.map(option => (
          <div key={option.id} className="customization-group">
            <h3>{option.name}</h3>
            <div className="options">
              {option.options.map(optionValue => (
                <label key={optionValue.id} className="option">
                  <input
                    type="radio"
                    name={option.id}
                    value={optionValue.id}
                    checked={customizations[option.id] === optionValue.id}
                    onChange={() => handleCustomizationChange(option.id, optionValue.id)}
                  />
                  <span className="option-name">{optionValue.name}</span>
                  {optionValue.priceAdjustment > 0 && (
                    <span className="price-adjust">
                      +${optionValue.priceAdjustment.toFixed(2)}
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="total">
        <p>Base Price: ${basePrice.toFixed(2)}</p>
        {customizationPrice > 0 && (
          <p>Customizations: +${customizationPrice.toFixed(2)}</p>
        )}
        <h3>Total: ${totalPrice.toFixed(2)}</h3>
      </div>
      
      <button onClick={handleAddToCart} className="add-btn">
        Add to Cart
      </button>
    </div>
  );
}
```

---

## 🔧 BACKEND - Handle Customizations

### ProductCustomizationService.java

```java
@Service
public class ProductCustomizationService {
  
  public List<CustomizationOption> getCustomizationOptions(UUID productId) {
    return customizationRepository.findByProductId(productId);
  }
  
  public BigDecimal calculateCustomizationPrice(
    UUID productId,
    Map<String, String> customizations
  ) {
    BigDecimal total = BigDecimal.ZERO;
    
    for (Map.Entry<String, String> entry : customizations.entrySet()) {
      String customizationKey = entry.getKey();
      String optionId = entry.getValue();
      
      CustomizationOption option = customizationOptionRepository
        .findByIdAndProductId(optionId, productId)
        .orElseThrow(() -> new NotFoundException("Option not found"));
      
      total = total.add(option.getPriceAdjustment());
    }
    
    return total;
  }
}
```

### OrderItemService.java

```java
@Service
public class OrderItemService {
  
  public OrderItem createFromCart(
    CartItem cartItem,
    ProductVariant variant
  ) {
    BigDecimal variantPrice = variant.getPrice();
    BigDecimal customizationPrice = customizationService
      .calculateCustomizationPrice(
        cartItem.getProductId(),
        cartItem.getCustomizations()
      );
    
    BigDecimal totalPrice = variantPrice.add(customizationPrice);
    
    return OrderItem.builder()
      .productId(cartItem.getProductId())
      .variantId(cartItem.getVariantId())
      .variantPrice(variantPrice)
      .customizations(cartItem.getCustomizations())  // Store as JSON
      .customizationPrice(customizationPrice)
      .totalPrice(totalPrice)
      .quantity(cartItem.getQuantity())
      .build();
  }
}
```

---

## 📋 SUMMARY

**How to implement Size + Customizations:**

1. **Sizes** = **Variants** (different prices)
   - Small, Medium, Large
   - Each has different `price` and `attributes`

2. **Customizations** = Additional options during checkout
   - Sugar level, milk type, extra shots
   - Each has a `priceAdjustment` (add to variant price)

3. **Final Price** = Variant Price + Customization Adjustments
   - Medium ($3.50) + Oat Milk (+$0.75) + Extra Sugar (+$0.25) + 1 Shot (+$0.75) = $5.25

4. **Database:**
   - `product_variants` = Sizes with prices
   - `product_customizations` = Customization groups (sugar, milk, shots)
   - `customization_options` = Individual options with price adjustments

5. **Frontend:**
   - Show variants first (size selection)
   - Then show customization options
   - Calculate total dynamically
   - Send both variant ID + customizations to backend

---

## ✅ Ready to Implement?

This handles:
- ✅ Any number of sizes
- ✅ Any number of customization options
- ✅ Dynamic price calculation
- ✅ Store customizations with order
- ✅ Display customizations in cart/order

**Start with:** Create `product_customizations` and `customization_options` tables! 🚀
