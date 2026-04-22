-- Create product customizations table (add-on options)
CREATE TABLE product_customizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    price_adjustment NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_customizations_product_id ON product_customizations(product_id);
CREATE INDEX idx_customizations_status ON product_customizations(status);
CREATE INDEX idx_customizations_price ON product_customizations(price_adjustment);
