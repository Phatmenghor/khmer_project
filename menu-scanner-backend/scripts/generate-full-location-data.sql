-- ============================================================================
-- GENERATE FULL CAMBODIA LOCATION TEST DATA (FOR PGADMIN)
-- Loop Structure:
--   25 Provinces -> 20 Districts per Province -> 20 Communes per District -> 20 Villages per Commune
-- Total generated: 25 Provinces, 500 Districts, 10,000 Communes, 200,000 Villages
-- Safe to re-run — all inserts use ON CONFLICT DO NOTHING checks.
-- ============================================================================

DO $$
DECLARE
    p RECORD;
    d_idx INT;
    c_idx INT;
    v_idx INT;
    d_code TEXT;
    c_code TEXT;
    v_code TEXT;
BEGIN
    RAISE NOTICE 'Starting location data seeding...';

    -- 1. Ensure 25 Provinces exist
    INSERT INTO location_province_cbc (id, version, is_deleted, created_at, updated_at, province_code, province_en, province_kh) VALUES
    (gen_random_uuid(), 0, false, NOW(), NOW(), '01', 'Banteay Meanchey', 'បន្ទាយមានជ័យ'),
    (gen_random_uuid(), 0, false, NOW(), NOW(), '02', 'Battambang', 'បាត់ដំបង'),
    (gen_random_uuid(), 0, false, NOW(), NOW(), '03', 'Kampong Cham', 'កំពង់ចាម'),
    (gen_random_uuid(), 0, false, NOW(), NOW(), '04', 'Kampong Chhnang', 'កំពង់ឆ្នាំង'),
    (gen_random_uuid(), 0, false, NOW(), NOW(), '05', 'Kampong Speu', 'កំពង់ស្ពឺ'),
    (gen_random_uuid(), 0, false, NOW(), NOW(), '06', 'Kampong Thom', 'កំពង់ធំ'),
    (gen_random_uuid(), 0, false, NOW(), NOW(), '07', 'Kampot', 'កំពត'),
    (gen_random_uuid(), 0, false, NOW(), NOW(), '08', 'Kandal', 'កណ្តាល'),
    (gen_random_uuid(), 0, false, NOW(), NOW(), '09', 'Koh Kong', 'កោះកុង'),
    (gen_random_uuid(), 0, false, NOW(), NOW(), '10', 'Kratie', 'ក្រចេះ'),
    (gen_random_uuid(), 0, false, NOW(), NOW(), '11', 'Mondulkiri', 'មណ្ឌលគិរី'),
    (gen_random_uuid(), 0, false, NOW(), NOW(), '12', 'Phnom Penh', 'ភ្នំពេញ'),
    (gen_random_uuid(), 0, false, NOW(), NOW(), '13', 'Preah Vihear', 'ព្រះវិហារ'),
    (gen_random_uuid(), 0, false, NOW(), NOW(), '14', 'Prey Veng', 'ព្រៃវែង'),
    (gen_random_uuid(), 0, false, NOW(), NOW(), '15', 'Pursat', 'ពោធិ៍សាត់'),
    (gen_random_uuid(), 0, false, NOW(), NOW(), '16', 'Ratanakiri', 'រតនគិរី'),
    (gen_random_uuid(), 0, false, NOW(), NOW(), '17', 'Siem Reap', 'សៀមរាប'),
    (gen_random_uuid(), 0, false, NOW(), NOW(), '18', 'Preah Sihanouk', 'ព្រះសីហនុ'),
    (gen_random_uuid(), 0, false, NOW(), NOW(), '19', 'Stung Treng', 'ស្ទឹងត្រែង'),
    (gen_random_uuid(), 0, false, NOW(), NOW(), '20', 'Svay Rieng', 'ស្វាយរៀង'),
    (gen_random_uuid(), 0, false, NOW(), NOW(), '21', 'Takeo', 'តាកែវ'),
    (gen_random_uuid(), 0, false, NOW(), NOW(), '22', 'Otdar Meanchey', 'ឧត្តរមានជ័យ'),
    (gen_random_uuid(), 0, false, NOW(), NOW(), '23', 'Kep', 'កែប'),
    (gen_random_uuid(), 0, false, NOW(), NOW(), '24', 'Pailin', 'ប៉ៃលិន'),
    (gen_random_uuid(), 0, false, NOW(), NOW(), '25', 'Tboung Khmum', 'ត្បូងឃ្មុំ')
    ON CONFLICT (province_code) DO NOTHING;

    -- 2. Loop through each of the 25 Provinces
    FOR p IN SELECT province_code, province_en, province_kh FROM location_province_cbc ORDER BY province_code LOOP
        -- Generate 20 Districts per Province
        FOR d_idx IN 1..20 LOOP
            d_code := p.province_code || lpad(d_idx::text, 2, '0');
            
            INSERT INTO location_district_cbc (id, version, is_deleted, created_at, updated_at, district_code, district_en, district_kh, province_code)
            VALUES (gen_random_uuid(), 0, false, NOW(), NOW(), d_code, p.province_en || ' District ' || d_idx, p.province_kh || ' ស្រុក ' || d_idx, p.province_code)
            ON CONFLICT (district_code) DO NOTHING;

            -- Generate 20 Communes per District
            FOR c_idx IN 1..20 LOOP
                c_code := d_code || lpad(c_idx::text, 2, '0');
                
                INSERT INTO location_commune_cbc (id, version, is_deleted, created_at, updated_at, commune_code, commune_en, commune_kh, district_code)
                VALUES (gen_random_uuid(), 0, false, NOW(), NOW(), c_code, 'Commune ' || c_idx, 'ឃុំ/សង្កាត់ ' || c_idx, d_code)
                ON CONFLICT (commune_code) DO NOTHING;

                -- Generate 20 Villages per Commune
                FOR v_idx IN 1..20 LOOP
                    v_code := c_code || lpad(v_idx::text, 2, '0');
                    
                    INSERT INTO location_village_cbc (id, version, is_deleted, created_at, updated_at, village_code, village_en, village_kh, commune_code)
                    VALUES (gen_random_uuid(), 0, false, NOW(), NOW(), v_code, 'Phum ' || v_idx, 'ភូមិ ' || v_idx, c_code)
                    ON CONFLICT (village_code) DO NOTHING;
                END LOOP;
            END LOOP;
        END LOOP;
    END LOOP;

    RAISE NOTICE 'Location data seeding completed successfully!';
END $$;
