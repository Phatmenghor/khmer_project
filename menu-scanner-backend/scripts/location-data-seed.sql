-- ============================================================================
-- CAMBODIA LOCATION DATA SEED SCRIPT
-- Safe to re-run — all inserts use ON CONFLICT DO NOTHING checks.
--
-- Seeds:
--   1. All 25 Provinces of Cambodia
--   2. Sample Districts (Khan) for Phnom Penh (Chamkar Mon, Daun Penh, Prampi Makara, Tuol Kork)
--   3. Sample Communes (Sangkat) for Chamkar Mon (Tonle Bassac, Boeung Keng Kang I, II, III)
--   4. Sample Villages (Phum) for Tonle Bassac
-- ============================================================================

-- ============================================================================
-- 1. SEED PROVINCES (25 Provinces of Cambodia)
-- ============================================================================
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

-- ============================================================================
-- 2. SEED DISTRICTS (For Phnom Penh: code '12')
-- ============================================================================
INSERT INTO location_district_cbc (id, version, is_deleted, created_at, updated_at, district_code, district_en, district_kh, province_code) VALUES
(gen_random_uuid(), 0, false, NOW(), NOW(), '1201', 'Chamkar Mon', 'ចំការមន', '12'),
(gen_random_uuid(), 0, false, NOW(), NOW(), '1202', 'Daun Penh', 'ដូនពេញ', '12'),
(gen_random_uuid(), 0, false, NOW(), NOW(), '1203', 'Prampi Makara', '៧មករា', '12'),
(gen_random_uuid(), 0, false, NOW(), NOW(), '1204', 'Tuol Kork', 'ទួលគោក', '12')
ON CONFLICT (district_code) DO NOTHING;

-- ============================================================================
-- 3. SEED COMMUNES (For Chamkar Mon: code '1201')
-- ============================================================================
INSERT INTO location_commune_cbc (id, version, is_deleted, created_at, updated_at, commune_code, commune_en, commune_kh, district_code) VALUES
(gen_random_uuid(), 0, false, NOW(), NOW(), '120101', 'Tonle Bassac', 'ទន្លេបាសាក់', '1201'),
(gen_random_uuid(), 0, false, NOW(), NOW(), '120102', 'Boeung Keng Kang I', 'បឹងកេងកងទី១', '1201'),
(gen_random_uuid(), 0, false, NOW(), NOW(), '120103', 'Boeung Keng Kang II', 'បឹងកេងកងទី២', '1201'),
(gen_random_uuid(), 0, false, NOW(), NOW(), '120104', 'Boeung Keng Kang III', 'បឹងកេងកងទី៣', '1201')
ON CONFLICT (commune_code) DO NOTHING;

-- ============================================================================
-- 4. SEED VILLAGES (For Tonle Bassac: code '120101')
-- ============================================================================
INSERT INTO location_village_cbc (id, version, is_deleted, created_at, updated_at, village_code, village_en, village_kh, commune_code) VALUES
(gen_random_uuid(), 0, false, NOW(), NOW(), '12010101', 'Phum 1', 'ភូមិ១', '120101'),
(gen_random_uuid(), 0, false, NOW(), NOW(), '12010102', 'Phum 2', 'ភូមិ២', '120101'),
(gen_random_uuid(), 0, false, NOW(), NOW(), '12010103', 'Phum 3', 'ភូមិ៣', '120101'),
(gen_random_uuid(), 0, false, NOW(), NOW(), '12010104', 'Phum 4', 'ភូមិ៤', '120101')
ON CONFLICT (village_code) DO NOTHING;
