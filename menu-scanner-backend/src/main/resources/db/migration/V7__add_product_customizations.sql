-- Create product customization groups table
CREATE TABLE product_customization_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_required BOOLEAN NOT NULL DEFAULT false,
    allow_multiple BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT fk_customization_groups_product FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Create product customizations table (individual add-on options)
CREATE TABLE product_customizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_customization_group_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price_adjustment NUMERIC(10, 2),
    sort_order INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_customization_group_id) REFERENCES product_customization_groups(id) ON DELETE CASCADE,
    CONSTRAINT fk_customizations_group FOREIGN KEY (product_customization_group_id) REFERENCES product_customization_groups(id)
);

-- Create indexes for performance
CREATE INDEX idx_customization_groups_product_id ON product_customization_groups(product_id);
CREATE INDEX idx_customization_groups_status ON product_customization_groups(status);
CREATE INDEX idx_customizations_group_id ON product_customizations(product_customization_group_id);
CREATE INDEX idx_customizations_status ON product_customizations(status);
