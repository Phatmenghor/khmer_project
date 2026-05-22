
-- ============================================================================
-- COMPREHENSIVE MEGA TEST DATA GENERATION SCRIPT
-- Complete E-Commerce System with Orders, Stock & Portfolio Management
-- 2 Businesses, 101+ Users with Full Order History, Dynamic Portfolio Profiles
-- ============================================================================

-- ============================================================================
-- 1. CREATE BUSINESSES
-- ============================================================================

-- Business 1: Mega Store (phatmenghor20@gmail.com owner)
INSERT INTO businesses (id, name, phone, email, address, status, is_subscription_active, version, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES (
  '550cad56-cafd-4aba-baef-c4dcd53940d0',
  'Mega Store',
  '+855-12-345-678',
  'megastore@example.com',
  'Phnom Penh, Cambodia',
  'ACTIVE', true, 0, false, NOW(), NOW(), 'admin', 'admin'
) ON CONFLICT DO NOTHING;

-- Business 2: Fashion Hub (phatmenghor21@gmail.com owner)
INSERT INTO businesses (id, name, phone, email, address, status, is_subscription_active, version, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES (
  '660cad56-cafd-4aba-baef-c4dcd53940d0',
  'Fashion Hub',
  '+855-87-654-321',
  'fashionhub@example.com',
  'Siem Reap, Cambodia',
  'ACTIVE', true, 0, false, NOW(), NOW(), 'admin', 'admin'
) ON CONFLICT DO NOTHING;


-- ============================================================================
-- 2. PORTFOLIO PROFILES WITH DYNAMIC DATA
-- ============================================================================

-- Mega Store Portfolio Profile
INSERT INTO portfolio_profile (
  id, business_id, business_name, slug, tagline, description,
  logo_url, cover_image_url, industry,
  contact_email, contact_phone, contact_whatsapp, contact_telegram,
  address, map_link,
  social_facebook, social_instagram, social_twitter, social_linkedin,
  social_youtube, social_tiktok, social_website,
  is_published, version, is_deleted, created_at, updated_at, created_by, updated_by
)
VALUES (
  'aa1cad56-cafd-4aba-baef-c4dcd53940d0',
  '550cad56-cafd-4aba-baef-c4dcd53940d0',
  'Mega Store',
  'mega-store',
  'Your One-Stop Shopping Destination in Cambodia',
  'Mega Store is Cambodia''s premier retail destination offering over 10,000 quality products across fashion, electronics, home goods, and more. Founded in 2016, we have served over 10,000 happy customers with a commitment to authenticity, value, and excellent service. Shop with confidence — every product is carefully curated and backed by our 30-day return policy.',
  'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce',
  'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce',
  'Retail',
  'megastore@example.com',
  '+855-12-345-678',
  '+855-12-345-678',
  'https://t.me/megastore_cambodia',
  'Street 271, Toul Kork, Phnom Penh, Cambodia, 12000',
  'https://maps.google.com/?q=Mega+Store+Phnom+Penh',
  'https://facebook.com/megastore.cambodia',
  'https://instagram.com/megastore.cambodia',
  'https://twitter.com/megastore_kh',
  'https://linkedin.com/company/megastore-cambodia',
  'https://youtube.com/@megastore.cambodia',
  'https://tiktok.com/@megastore.cambodia',
  'https://megastore.com.kh',
  true, 0, false, NOW(), NOW(), 'admin', 'admin'
) ON CONFLICT DO NOTHING;

-- Fashion Hub Portfolio Profile
INSERT INTO portfolio_profile (
  id, business_id, business_name, slug, tagline, description,
  logo_url, cover_image_url, industry,
  contact_email, contact_phone, contact_whatsapp, contact_telegram,
  address, map_link,
  social_facebook, social_instagram, social_twitter, social_linkedin,
  social_youtube, social_tiktok, social_website,
  is_published, version, is_deleted, created_at, updated_at, created_by, updated_by
)
VALUES (
  'bb1cad56-cafd-4aba-baef-c4dcd53940d0',
  '660cad56-cafd-4aba-baef-c4dcd53940d0',
  'Fashion Hub',
  'fashion-hub',
  'Where Style Meets Tradition',
  'Fashion Hub is Siem Reap''s leading fashion boutique, blending contemporary trends with Khmer craftsmanship. Since 2019, we have dressed thousands of style-conscious customers with our curated collections of local and international designers. From casual wear to formal attire, our experienced stylists are ready to help you find your perfect look.',
  'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce',
  'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce',
  'Fashion & Apparel',
  'fashionhub@example.com',
  '+855-87-654-321',
  '+855-87-654-321',
  'https://t.me/fashionhub_siemreap',
  'Sivatha Blvd, Pub Street Area, Siem Reap, Cambodia, 17000',
  'https://maps.google.com/?q=Fashion+Hub+Siem+Reap',
  'https://facebook.com/fashionhub.cambodia',
  'https://instagram.com/fashionhub.cambodia',
  'https://twitter.com/fashionhub_kh',
  'https://linkedin.com/company/fashionhub-cambodia',
  'https://youtube.com/@fashionhubcambodia',
  'https://tiktok.com/@fashionhub.cambodia',
  'https://fashionhub.com.kh',
  true, 0, false, NOW(), NOW(), 'admin', 'admin'
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- 3. PORTFOLIO CONTACT PHONES (Dynamic with IDs)
-- ============================================================================

INSERT INTO portfolio_phone (id, profile_id, number, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT v.id, v.profile_id, v.number, 0, false, NOW(), NOW(), 'admin', 'admin'
FROM (VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', '+855-12-345-678'),
  ('550e8400-e29b-41d4-a716-446655440002', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', '+855-98-765-432'),
  ('550e8400-e29b-41d4-a716-446655440003', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', '+855-87-654-321'),
  ('550e8400-e29b-41d4-a716-446655440004', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', '+855-11-222-333')
) AS v(id, profile_id, number)
WHERE NOT EXISTS (SELECT 1 FROM portfolio_phone WHERE id = v.id)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 4. PORTFOLIO BUSINESS HOURS (Dynamic with IDs)
-- ============================================================================

INSERT INTO portfolio_hours (id, profile_id, day, open_time, close_time, display_order, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT v.id, v.profile_id, v.day, v.open_time, v.close_time, v.display_order, 0, false, NOW(), NOW(), 'admin', 'admin'
FROM (VALUES
  ('660e8400-e29b-41d4-a716-446655440001', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', 'MONDAY', '08:00', '22:00', 1),
  ('660e8400-e29b-41d4-a716-446655440002', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', 'TUESDAY', '08:00', '22:00', 2),
  ('660e8400-e29b-41d4-a716-446655440003', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', 'WEDNESDAY', '08:00', '22:00', 3),
  ('660e8400-e29b-41d4-a716-446655440004', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', 'THURSDAY', '08:00', '22:00', 4),
  ('660e8400-e29b-41d4-a716-446655440005', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', 'FRIDAY', '08:00', '23:00', 5),
  ('660e8400-e29b-41d4-a716-446655440006', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', 'SATURDAY', '09:00', '23:00', 6),
  ('660e8400-e29b-41d4-a716-446655440007', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', 'SUNDAY', NULL, NULL, 7),
  ('660e8400-e29b-41d4-a716-446655440008', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', 'MONDAY', '09:00', '21:00', 1),
  ('660e8400-e29b-41d4-a716-446655440009', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', 'TUESDAY', '09:00', '21:00', 2),
  ('660e8400-e29b-41d4-a716-446655440010', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', 'WEDNESDAY', '09:00', '21:00', 3),
  ('660e8400-e29b-41d4-a716-446655440011', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', 'THURSDAY', '09:00', '21:00', 4),
  ('660e8400-e29b-41d4-a716-446655440012', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', 'FRIDAY', '09:00', '22:00', 5),
  ('660e8400-e29b-41d4-a716-446655440013', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', 'SATURDAY', '10:00', '22:00', 6),
  ('660e8400-e29b-41d4-a716-446655440014', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', 'SUNDAY', '10:00', '20:00', 7)
) AS v(id, profile_id, day, open_time, close_time, display_order)
WHERE NOT EXISTS (SELECT 1 FROM portfolio_hours WHERE id = v.id)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 5. PORTFOLIO GALLERY ITEMS (Dynamic with IDs)
-- ============================================================================

INSERT INTO portfolio_gallery_item (id, profile_id, url, title, display_order, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT v.id, v.profile_id, v.url, v.title, v.display_order, 0, false, NOW(), NOW(), 'admin', 'admin'
FROM (VALUES
  ('770e8400-e29b-41d4-a716-446655440001', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce', 'Store Entrance', 1),
  ('770e8400-e29b-41d4-a716-446655440002', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce', 'Electronics Section', 2),
  ('770e8400-e29b-41d4-a716-446655440003', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce', 'Fashion Floor', 3),
  ('770e8400-e29b-41d4-a716-446655440004', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce', 'Home Goods Display', 4),
  ('770e8400-e29b-41d4-a716-446655440005', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce', 'Boutique Front', 1),
  ('770e8400-e29b-41d4-a716-446655440006', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce', 'Collections', 2),
  ('770e8400-e29b-41d4-a716-446655440007', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce', 'Style Showcase', 3)
) AS v(id, profile_id, url, title, display_order)
WHERE NOT EXISTS (SELECT 1 FROM portfolio_gallery_item WHERE id = v.id)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 6. PORTFOLIO FEATURES (Dynamic with IDs)
-- ============================================================================

INSERT INTO portfolio_feature (id, profile_id, name, display_order, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT v.id, v.profile_id, v.name, v.display_order, 0, false, NOW(), NOW(), 'admin', 'admin'
FROM (VALUES
  ('880e8400-e29b-41d4-a716-446655440001', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', 'Free Delivery on orders over $50', 1),
  ('880e8400-e29b-41d4-a716-446655440002', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', '30-Day Easy Returns', 2),
  ('880e8400-e29b-41d4-a716-446655440003', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', '1-Year Product Warranty', 3),
  ('880e8400-e29b-41d4-a716-446655440004', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', '100% Authentic Products', 4),
  ('880e8400-e29b-41d4-a716-446655440005', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', '24/7 Customer Support', 5),
  ('880e8400-e29b-41d4-a716-446655440006', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', 'Loyalty Rewards Program', 6),
  ('880e8400-e29b-41d4-a716-446655440007', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', 'Personal Styling Service', 1),
  ('880e8400-e29b-41d4-a716-446655440008', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', 'Same-Day Alterations Available', 2),
  ('880e8400-e29b-41d4-a716-446655440009', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', 'Exclusive Member Previews', 3),
  ('880e8400-e29b-41d4-a716-446655440010', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', 'Free Gift Wrapping', 4),
  ('880e8400-e29b-41d4-a716-446655440011', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', 'VIP Shopping Hours', 5)
) AS v(id, profile_id, name, display_order)
WHERE NOT EXISTS (SELECT 1 FROM portfolio_feature WHERE id = v.id)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 7. PORTFOLIO SERVICES (Dynamic with IDs)
-- ============================================================================

INSERT INTO portfolio_service_item (id, profile_id, name, description, display_order, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT v.id, v.profile_id, v.name, v.description, v.display_order, 0, false, NOW(), NOW(), 'admin', 'admin'
FROM (VALUES
  ('990e8400-e29b-41d4-a716-446655440001', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', 'In-Store Shopping', 'Browse our vast selection of 10,000+ products across multiple categories with expert staff assistance.', 1),
  ('990e8400-e29b-41d4-a716-446655440002', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', 'Online Ordering', 'Shop online 24/7 and get fast, reliable delivery to your doorstep.', 2),
  ('990e8400-e29b-41d4-a716-446655440003', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', 'Bulk Purchasing', 'Special pricing and services for bulk orders. Contact our B2B team for wholesale deals.', 3),
  ('990e8400-e29b-41d4-a716-446655440004', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', 'Gift Wrapping', 'Complimentary gift wrapping and personalized messages for all occasions.', 4),
  ('990e8400-e29b-41d4-a716-446655440005', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', 'Personal Shopping', 'Our stylists will help you find the perfect look tailored to your style and needs.', 1),
  ('990e8400-e29b-41d4-a716-446655440006', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', 'Alterations', 'Professional alteration services to ensure perfect fit for all your garments.', 2),
  ('990e8400-e29b-41d4-a716-446655440007', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', 'Styling Consultation', 'Expert advice on fashion trends, color coordination, and wardrobe building.', 3),
  ('990e8400-e29b-41d4-a716-446655440008', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', 'Corporate Gifting', 'Bulk ordering solutions for corporate gifts and employee gifts.', 4)
) AS v(id, profile_id, name, description, display_order)
WHERE NOT EXISTS (SELECT 1 FROM portfolio_service_item WHERE id = v.id)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 8. PORTFOLIO TEAM MEMBERS (Dynamic with IDs)
-- ============================================================================

INSERT INTO portfolio_team_member (id, profile_id, name, position, bio, photo_url, display_order, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT v.id, v.profile_id, v.name, v.position, v.bio, v.photo_url, v.display_order, 0, false, NOW(), NOW(), 'admin', 'admin'
FROM (VALUES
  ('aa0e8400-e29b-41d4-a716-446655440001', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', 'Sokha Pou', 'Store Manager', 'With over 12 years of retail experience, Sokha leads Mega Store with passion for customer satisfaction.', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce', 1),
  ('aa0e8400-e29b-41d4-a716-446655440002', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', 'Kosal Touch', 'Sales Director', 'Kosal ensures our team delivers the best shopping experience with expert product knowledge.', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce', 2),
  ('aa0e8400-e29b-41d4-a716-446655440003', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', 'Srey Mom', 'Customer Service Lead', 'Srey Mom heads our dedicated customer support team, available 24/7 to assist you.', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce', 3),
  ('aa0e8400-e29b-41d4-a716-446655440004', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', 'Dina Savuth', 'Boutique Owner', 'Dina founded Fashion Hub with a vision to bring quality fashion to Siem Reap with a personal touch.', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce', 1),
  ('aa0e8400-e29b-41d4-a716-446655440005', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', 'Chanthy Ros', 'Senior Stylist', 'With expertise in both traditional and contemporary fashion, Chanthy helps clients discover their unique style.', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce', 2),
  ('aa0e8400-e29b-41d4-a716-446655440006', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', 'Piseth Rith', 'Tailor Master', 'Piseth brings 20+ years of tailoring expertise, ensuring perfect fits for all our customers.', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce', 3)
) AS v(id, profile_id, name, position, bio, photo_url, display_order)
WHERE NOT EXISTS (SELECT 1 FROM portfolio_team_member WHERE id = v.id)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 9. PORTFOLIO CUSTOM STATS (All Dynamic - No Fixed Fields)
-- ============================================================================

INSERT INTO portfolio_custom_stat (id, profile_id, label, value, display_order, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT v.id, v.profile_id, v.label, v.value, v.display_order, 0, false, NOW(), NOW(), 'admin', 'admin'
FROM (VALUES
  ('bb0e8400-e29b-41d4-a716-446655440001', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', 'Years In Business', '8', 1),
  ('bb0e8400-e29b-41d4-a716-446655440002', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', 'Happy Customers', '10,000+', 2),
  ('bb0e8400-e29b-41d4-a716-446655440003', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', 'Products Available', '10,000+', 3),
  ('bb0e8400-e29b-41d4-a716-446655440004', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', 'Daily Transactions', '500+', 4),
  ('bb0e8400-e29b-41d4-a716-446655440005', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', 'Cities Served', '5', 5),
  ('bb0e8400-e29b-41d4-a716-446655440006', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', 'Years In Business', '5', 1),
  ('bb0e8400-e29b-41d4-a716-446655440007', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', 'Happy Customers', '5,000+', 2),
  ('bb0e8400-e29b-41d4-a716-446655440008', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', 'Brands Carried', '100+', 3),
  ('bb0e8400-e29b-41d4-a716-446655440009', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', 'Styling Sessions', '1,000+', 4)
) AS v(id, profile_id, label, value, display_order)
WHERE NOT EXISTS (SELECT 1 FROM portfolio_custom_stat WHERE id = v.id)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 10. VERIFY DATA INSERTION
-- ============================================================================

SELECT
  'Portfolio Profiles Created' AS metric,
  COUNT(*) AS count
FROM portfolio_profile
WHERE is_deleted = false;

SELECT
  'Contact Phones' AS metric,
  COUNT(*) AS count
FROM portfolio_phone
WHERE is_deleted = false;

SELECT
  'Business Hours' AS metric,
  COUNT(*) AS count
FROM portfolio_hours
WHERE is_deleted = false;

SELECT
  'Gallery Items' AS metric,
  COUNT(*) AS count
FROM portfolio_gallery_item
WHERE is_deleted = false;

SELECT
  'Features' AS metric,
  COUNT(*) AS count
FROM portfolio_feature
WHERE is_deleted = false;

SELECT
  'Services' AS metric,
  COUNT(*) AS count
FROM portfolio_service_item
WHERE is_deleted = false;

SELECT
  'Team Members' AS metric,
  COUNT(*) AS count
FROM portfolio_team_member
WHERE is_deleted = false;

SELECT
  'Custom Stats' AS metric,
  COUNT(*) AS count
FROM portfolio_custom_stat
WHERE is_deleted = false;

-- ============================================================================
-- 11. DISPLAY SUMMARY
-- ============================================================================

SELECT
  pp.business_name,
  pp.slug,
  pp.contact_email,
  pp.contact_telegram,
  (SELECT COUNT(*) FROM portfolio_phone WHERE profile_id = pp.id AND is_deleted = false) AS phone_count,
  (SELECT COUNT(*) FROM portfolio_hours WHERE profile_id = pp.id AND is_deleted = false) AS hours_count,
  (SELECT COUNT(*) FROM portfolio_gallery_item WHERE profile_id = pp.id AND is_deleted = false) AS gallery_count,
  (SELECT COUNT(*) FROM portfolio_feature WHERE profile_id = pp.id AND is_deleted = false) AS features_count,
  (SELECT COUNT(*) FROM portfolio_service_item WHERE profile_id = pp.id AND is_deleted = false) AS services_count,
  (SELECT COUNT(*) FROM portfolio_team_member WHERE profile_id = pp.id AND is_deleted = false) AS team_count,
  (SELECT COUNT(*) FROM portfolio_custom_stat WHERE profile_id = pp.id AND is_deleted = false) AS stats_count
FROM portfolio_profile pp
WHERE pp.is_deleted = false
ORDER BY pp.created_at;
