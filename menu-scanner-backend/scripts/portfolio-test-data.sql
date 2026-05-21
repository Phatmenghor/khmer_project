
-- ============================================================================
-- PORTFOLIO FEATURE TEST DATA
-- Full portfolio profiles for Mega Store and Fashion Hub
-- Tables covered:
--   portfolio_profile, portfolio_profile_phones, portfolio_profile_features,
--   portfolio_hours, portfolio_gallery, portfolio_service_item,
--   portfolio_team_member, portfolio_custom_stat, portfolio_review
--
-- Depends on: comprehensive-test-data.sql (businesses + users must exist)
-- Businesses:
--   Mega Store   id = 550cad56-cafd-4aba-baef-c4dcd53940d0
--   Fashion Hub  id = 660cad56-cafd-4aba-baef-c4dcd53940d0
--
-- Profile IDs (fixed for FK references throughout this script):
--   Mega Store   profile = aa1cad56-cafd-4aba-baef-c4dcd53940d0
--   Fashion Hub  profile = bb1cad56-cafd-4aba-baef-c4dcd53940d0
-- ============================================================================


-- ============================================================================
-- 1. PORTFOLIO PROFILES
-- ============================================================================

-- Mega Store Portfolio Profile
INSERT INTO portfolio_profile (
  id, business_id, business_name, slug, tagline, description,
  logo_url, cover_image_url, industry,
  contact_email, contact_phone, contact_whatsapp, contact_telegram,
  address_street, address_city, address_state, address_country, address_postal_code, map_link,
  social_facebook, social_instagram, social_twitter, social_linkedin,
  social_youtube, social_tiktok, social_website,
  years_in_business, customers_served, is_published,
  version, is_deleted, created_at, updated_at, created_by, updated_by
)
VALUES (
  'aa1cad56-cafd-4aba-baef-c4dcd53940d0',
  '550cad56-cafd-4aba-baef-c4dcd53940d0',
  'Mega Store',
  'mega-store',
  'Your One-Stop Shopping Destination in Cambodia',
  'Mega Store is Cambodia''s premier retail destination offering over 10,000 quality products across fashion, electronics, home goods, and more. Founded in 2016, we have served over 10,000 happy customers with a commitment to authenticity, value, and excellent service. Shop with confidence — every product is carefully curated and backed by our 30-day return policy.',
  'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce',
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8',
  'Retail',
  'megastore@example.com',
  '+855-12-345-678',
  '+855-12-345-678',
  '@megastore_cambodia',
  'Street 271, Toul Kork',
  'Phnom Penh',
  NULL,
  'Cambodia',
  '12000',
  'https://maps.google.com/?q=Mega+Store+Phnom+Penh',
  'https://facebook.com/megastore.cambodia',
  'https://instagram.com/megastore.cambodia',
  'https://twitter.com/megastore_kh',
  'https://linkedin.com/company/megastore-cambodia',
  'https://youtube.com/@megastore.cambodia',
  'https://tiktok.com/@megastore.cambodia',
  'https://megastore.com.kh',
  8,
  10000,
  true,
  0, false, NOW(), NOW(), 'admin', 'admin'
) ON CONFLICT DO NOTHING;

-- Fashion Hub Portfolio Profile
INSERT INTO portfolio_profile (
  id, business_id, business_name, slug, tagline, description,
  logo_url, cover_image_url, industry,
  contact_email, contact_phone, contact_whatsapp, contact_telegram,
  address_street, address_city, address_state, address_country, address_postal_code, map_link,
  social_facebook, social_instagram, social_twitter, social_linkedin,
  social_youtube, social_tiktok, social_website,
  years_in_business, customers_served, is_published,
  version, is_deleted, created_at, updated_at, created_by, updated_by
)
VALUES (
  'bb1cad56-cafd-4aba-baef-c4dcd53940d0',
  '660cad56-cafd-4aba-baef-c4dcd53940d0',
  'Fashion Hub',
  'fashion-hub',
  'Where Style Meets Tradition',
  'Fashion Hub is Siem Reap''s leading fashion boutique, blending contemporary trends with Khmer craftsmanship. Since 2019, we have dressed thousands of style-conscious customers with our curated collections of local and international designers. From casual wear to formal attire, our experienced stylists are ready to help you find your perfect look.',
  'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64',
  'Fashion & Apparel',
  'fashionhub@example.com',
  '+855-87-654-321',
  '+855-87-654-321',
  '@fashionhub_siemreap',
  'Sivatha Blvd, Pub Street Area',
  'Siem Reap',
  NULL,
  'Cambodia',
  '17000',
  'https://maps.google.com/?q=Fashion+Hub+Siem+Reap',
  'https://facebook.com/fashionhub.cambodia',
  'https://instagram.com/fashionhub.cambodia',
  NULL,
  NULL,
  'https://youtube.com/@fashionhubcambodia',
  NULL,
  'https://fashionhub.com.kh',
  5,
  5000,
  true,
  0, false, NOW(), NOW(), 'admin', 'admin'
) ON CONFLICT DO NOTHING;


-- ============================================================================
-- 2. CONTACT PHONES (portfolio_profile_phones)
-- ============================================================================

INSERT INTO portfolio_profile_phones (profile_id, phone)
SELECT v.profile_id, v.phone
FROM (VALUES
  ('aa1cad56-cafd-4aba-baef-c4dcd53940d0'::uuid, '+855-12-345-678'),
  ('aa1cad56-cafd-4aba-baef-c4dcd53940d0'::uuid, '+855-23-456-789'),
  ('aa1cad56-cafd-4aba-baef-c4dcd53940d0'::uuid, '+855-78-999-000'),
  ('bb1cad56-cafd-4aba-baef-c4dcd53940d0'::uuid, '+855-87-654-321'),
  ('bb1cad56-cafd-4aba-baef-c4dcd53940d0'::uuid, '+855-96-123-456')
) AS v(profile_id, phone)
WHERE NOT EXISTS (
  SELECT 1 FROM portfolio_profile_phones WHERE profile_id = v.profile_id
);


-- ============================================================================
-- 3. FEATURES (portfolio_profile_features)
-- ============================================================================

-- Mega Store features (6)
INSERT INTO portfolio_profile_features (profile_id, feature)
SELECT 'aa1cad56-cafd-4aba-baef-c4dcd53940d0'::uuid, feature
FROM (VALUES
  ('Free Delivery on orders over $50'),
  ('30-Day Easy Returns'),
  ('1-Year Product Warranty'),
  ('100% Authentic Products'),
  ('24/7 Customer Support'),
  ('Loyalty Rewards Program')
) AS v(feature)
WHERE NOT EXISTS (
  SELECT 1 FROM portfolio_profile_features WHERE profile_id = 'aa1cad56-cafd-4aba-baef-c4dcd53940d0'
);

-- Fashion Hub features (5)
INSERT INTO portfolio_profile_features (profile_id, feature)
SELECT 'bb1cad56-cafd-4aba-baef-c4dcd53940d0'::uuid, feature
FROM (VALUES
  ('Personal Styling Consultation'),
  ('Custom Tailoring Available'),
  ('Local Designer Collections'),
  ('Gift Packaging'),
  ('VIP Member Discounts')
) AS v(feature)
WHERE NOT EXISTS (
  SELECT 1 FROM portfolio_profile_features WHERE profile_id = 'bb1cad56-cafd-4aba-baef-c4dcd53940d0'
);


-- ============================================================================
-- 4. BUSINESS HOURS (portfolio_hours)
-- ============================================================================

-- Mega Store hours (7 days, open every day)
INSERT INTO portfolio_hours (
  id, profile_id, day, is_open, open_time, close_time, is_24_hours,
  display_order, version, is_deleted, created_at, updated_at, created_by, updated_by
)
SELECT gen_random_uuid(), 'aa1cad56-cafd-4aba-baef-c4dcd53940d0'::uuid, day, is_open, open_time, close_time, false, display_order, 0, false, NOW(), NOW(), 'admin', 'admin'
FROM (VALUES
  ('Monday',    true,  '08:00', '22:00', 1),
  ('Tuesday',   true,  '08:00', '22:00', 2),
  ('Wednesday', true,  '08:00', '22:00', 3),
  ('Thursday',  true,  '08:00', '22:00', 4),
  ('Friday',    true,  '08:00', '23:00', 5),
  ('Saturday',  true,  '09:00', '23:00', 6),
  ('Sunday',    true,  '10:00', '21:00', 7)
) AS v(day, is_open, open_time, close_time, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM portfolio_hours WHERE profile_id = 'aa1cad56-cafd-4aba-baef-c4dcd53940d0' AND is_deleted = false
);

-- Fashion Hub hours (7 days, closed Tuesday)
INSERT INTO portfolio_hours (
  id, profile_id, day, is_open, open_time, close_time, is_24_hours,
  display_order, version, is_deleted, created_at, updated_at, created_by, updated_by
)
SELECT gen_random_uuid(), 'bb1cad56-cafd-4aba-baef-c4dcd53940d0'::uuid, day, is_open, open_time, close_time, false, display_order, 0, false, NOW(), NOW(), 'admin', 'admin'
FROM (VALUES
  ('Monday',    true,  '09:00', '21:00', 1),
  ('Tuesday',   false, NULL,    NULL,    2),
  ('Wednesday', true,  '09:00', '21:00', 3),
  ('Thursday',  true,  '09:00', '21:00', 4),
  ('Friday',    true,  '09:00', '22:00', 5),
  ('Saturday',  true,  '09:00', '22:00', 6),
  ('Sunday',    true,  '10:00', '20:00', 7)
) AS v(day, is_open, open_time, close_time, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM portfolio_hours WHERE profile_id = 'bb1cad56-cafd-4aba-baef-c4dcd53940d0' AND is_deleted = false
);


-- ============================================================================
-- 5. GALLERY (portfolio_gallery)
-- ============================================================================

-- Mega Store gallery (8 items)
INSERT INTO portfolio_gallery (
  id, profile_id, url, title, description,
  display_order, version, is_deleted, created_at, updated_at, created_by, updated_by
)
SELECT gen_random_uuid(), 'aa1cad56-cafd-4aba-baef-c4dcd53940d0'::uuid, url, title, description, display_order, 0, false, NOW(), NOW(), 'admin', 'admin'
FROM (VALUES
  ('https://images.unsplash.com/photo-1441986300917-64674bd600d8', 'Store Front',           'Our main entrance at Toul Kork, Phnom Penh',                      1),
  ('https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5', 'Electronics Section',   'Latest gadgets and electronics on display',                       2),
  ('https://images.unsplash.com/photo-1472851294608-062f824d29cc', 'Fashion Floor',          'Trending fashion from top local and international brands',         3),
  ('https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a',   'Home & Living',           'Premium home goods and lifestyle décor',                           4),
  ('https://images.unsplash.com/photo-1604719312566-8912e9c8a213', 'Customer Service Desk',  'Our award-winning customer service team ready to assist you',      5),
  ('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d',   'Warehouse & Logistics',   'State-of-the-art storage and delivery fulfilment centre',          6),
  ('https://images.unsplash.com/photo-1542744173-8e7e53415bb0',   'Team Meeting',            'Our dedicated team planning the best experience for you',          7),
  ('https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da', 'Grand Opening Event',    'Celebrating 8 years with our loyal customers',                    8)
) AS v(url, title, description, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM portfolio_gallery WHERE profile_id = 'aa1cad56-cafd-4aba-baef-c4dcd53940d0' AND is_deleted = false
);

-- Fashion Hub gallery (6 items)
INSERT INTO portfolio_gallery (
  id, profile_id, url, title, description,
  display_order, version, is_deleted, created_at, updated_at, created_by, updated_by
)
SELECT gen_random_uuid(), 'bb1cad56-cafd-4aba-baef-c4dcd53940d0'::uuid, url, title, description, display_order, 0, false, NOW(), NOW(), 'admin', 'admin'
FROM (VALUES
  ('https://images.unsplash.com/photo-1558618666-fcd25c85cd64',   'Boutique Interior',       'Our elegant showroom in the heart of Siem Reap',                  1),
  ('https://images.unsplash.com/photo-1524504388940-b1c1722653e1','Summer Collection',        '2024 Summer Collection — Vibrant, Fresh & Contemporary',           2),
  ('https://images.unsplash.com/photo-1490481651871-ab68de25d43d','Khmer Traditional',        'Handcrafted traditional Khmer fashion pieces by local artisans',   3),
  ('https://images.unsplash.com/photo-1469334031218-e382a71b716b','Fashion Show 2024',        'Our annual showcase of Khmer and international designers',          4),
  ('https://images.unsplash.com/photo-1580618672591-eb180b1a973f','Fitting Room',             'Luxurious private fitting rooms for your comfort',                 5),
  ('https://images.unsplash.com/photo-1512436991641-6745cdb1723f','Accessories Corner',       'Handpicked accessories and jewellery to complete your look',        6)
) AS v(url, title, description, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM portfolio_gallery WHERE profile_id = 'bb1cad56-cafd-4aba-baef-c4dcd53940d0' AND is_deleted = false
);


-- ============================================================================
-- 6. SERVICES (portfolio_service_item)
-- ============================================================================

-- Mega Store services (6)
INSERT INTO portfolio_service_item (
  id, profile_id, name, description,
  display_order, version, is_deleted, created_at, updated_at, created_by, updated_by
)
SELECT gen_random_uuid(), 'aa1cad56-cafd-4aba-baef-c4dcd53940d0'::uuid, name, description, display_order, 0, false, NOW(), NOW(), 'admin', 'admin'
FROM (VALUES
  ('Free Delivery',         'Free delivery on all orders over $50 within Phnom Penh city limits. Same-day delivery available for urgent orders.',                                         1),
  ('Product Warranty',      '1-year manufacturer warranty on all electronics and appliances. Extended warranty plans available at checkout.',                                              2),
  ('Easy Returns',          '30-day hassle-free return policy. Bring the item with receipt for a full refund or exchange — no questions asked.',                                           3),
  ('24/7 Customer Support', 'Round-the-clock support via phone, WhatsApp, and Telegram. Our trained team resolves every issue swiftly.',                                                  4),
  ('Gift Wrapping',         'Beautiful gift wrapping for any occasion. Add a personalised message card at no extra charge.',                                                               5),
  ('Loyalty Rewards',       'Earn points on every purchase and redeem them for discounts, free products, and exclusive member-only benefits.',                                             6)
) AS v(name, description, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM portfolio_service_item WHERE profile_id = 'aa1cad56-cafd-4aba-baef-c4dcd53940d0' AND is_deleted = false
);

-- Fashion Hub services (4)
INSERT INTO portfolio_service_item (
  id, profile_id, name, description,
  display_order, version, is_deleted, created_at, updated_at, created_by, updated_by
)
SELECT gen_random_uuid(), 'bb1cad56-cafd-4aba-baef-c4dcd53940d0'::uuid, name, description, display_order, 0, false, NOW(), NOW(), 'admin', 'admin'
FROM (VALUES
  ('Personal Styling',  'One-on-one styling consultation with our expert fashion advisors. Book a complimentary 30-minute session in-store or via WhatsApp.',                              1),
  ('Custom Tailoring',  'Bespoke tailoring for traditional and contemporary garments. Handcrafted by our master tailor and ready in 3–5 business days.',                                  2),
  ('Alterations',       'Professional garment alterations and repairs with fast turnaround. From hemming to full resizing, we handle every detail with care.',                             3),
  ('Gift Packaging',    'Elegant gift packaging with ribbon, tissue, and a personalised card. Perfect for weddings, graduations, and Khmer New Year celebrations.',                       4)
) AS v(name, description, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM portfolio_service_item WHERE profile_id = 'bb1cad56-cafd-4aba-baef-c4dcd53940d0' AND is_deleted = false
);


-- ============================================================================
-- 7. TEAM MEMBERS (portfolio_team_member)
-- ============================================================================

-- Mega Store team (5 members)
INSERT INTO portfolio_team_member (
  id, profile_id, name, position, bio, photo_url,
  display_order, version, is_deleted, created_at, updated_at, created_by, updated_by
)
SELECT gen_random_uuid(), 'aa1cad56-cafd-4aba-baef-c4dcd53940d0'::uuid, name, position, bio, photo_url, display_order, 0, false, NOW(), NOW(), 'admin', 'admin'
FROM (VALUES
  ('Sokha Phan',     'CEO & Founder',          'Sokha founded Mega Store in 2016 with a vision to bring quality retail to every Cambodian family. With 15+ years in the industry, he leads with passion and a genuine love for serving customers.',      'https://i.pravatar.cc/300?img=11', 1),
  ('Dara Lim',       'General Manager',         'Dara oversees all store operations and ensures every customer leaves with a smile. An MBA graduate with 10 years in retail management, he keeps the business running like clockwork.',                  'https://i.pravatar.cc/300?img=12', 2),
  ('Sophea Keo',     'Head of Marketing',       'Sophea drives our brand presence across digital and traditional channels. She brings creativity and data-driven strategy, growing Mega Store into a household name across Cambodia.',                     'https://i.pravatar.cc/300?img=13', 3),
  ('Vanna Teng',     'Sales Manager',           'Vanna leads our sales team with energy and deep product knowledge. He built our customer loyalty programme from scratch and continues to set the bar for service excellence.',                           'https://i.pravatar.cc/300?img=14', 4),
  ('Channary Ros',   'Customer Service Lead',   'Channary champions exceptional customer experiences from day one. Her team consistently achieves the highest satisfaction scores across all our contact channels.',                                      'https://i.pravatar.cc/300?img=15', 5)
) AS v(name, position, bio, photo_url, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM portfolio_team_member WHERE profile_id = 'aa1cad56-cafd-4aba-baef-c4dcd53940d0' AND is_deleted = false
);

-- Fashion Hub team (4 members)
INSERT INTO portfolio_team_member (
  id, profile_id, name, position, bio, photo_url,
  display_order, version, is_deleted, created_at, updated_at, created_by, updated_by
)
SELECT gen_random_uuid(), 'bb1cad56-cafd-4aba-baef-c4dcd53940d0'::uuid, name, position, bio, photo_url, display_order, 0, false, NOW(), NOW(), 'admin', 'admin'
FROM (VALUES
  ('Bopha Chhun',    'Creative Director',   'Bopha is the visionary behind Fashion Hub''s unique identity. A graduate of design school in Bangkok, she expertly weaves Khmer cultural heritage into modern silhouettes that resonate globally.',         'https://i.pravatar.cc/300?img=21', 1),
  ('Piseth Mao',     'Store Manager',       'Piseth ensures every visit to Fashion Hub is a memorable experience. With 8 years in luxury retail, he has built a team that delivers five-star service to every guest who walks through our doors.',       'https://i.pravatar.cc/300?img=22', 2),
  ('Sreyleap Nou',   'Lead Stylist',        'Sreyleap has styled hundreds of clients for weddings, galas, and everyday confidence. She believes that the right outfit can change how you feel about yourself — and she proves it every day.',            'https://i.pravatar.cc/300?img=23', 3),
  ('Kimhong Yem',    'Master Tailor',       'Kimhong brings 20 years of traditional Khmer tailoring expertise. His bespoke garments have been worn at royal ceremonies and international fashion events. Every stitch tells a story.',                  'https://i.pravatar.cc/300?img=24', 4)
) AS v(name, position, bio, photo_url, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM portfolio_team_member WHERE profile_id = 'bb1cad56-cafd-4aba-baef-c4dcd53940d0' AND is_deleted = false
);


-- ============================================================================
-- 8. CUSTOM STATS (portfolio_custom_stat)
-- ============================================================================

-- Mega Store custom stats (4)
INSERT INTO portfolio_custom_stat (
  id, profile_id, label, value,
  display_order, version, is_deleted, created_at, updated_at, created_by, updated_by
)
SELECT gen_random_uuid(), 'aa1cad56-cafd-4aba-baef-c4dcd53940d0'::uuid, label, value, display_order, 0, false, NOW(), NOW(), 'admin', 'admin'
FROM (VALUES
  ('Products Available', '10,000+', 1),
  ('Brands Carried',     '100+',    2),
  ('Happy Customers',    '10,000+', 3),
  ('Daily Orders',       '200+',    4)
) AS v(label, value, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM portfolio_custom_stat WHERE profile_id = 'aa1cad56-cafd-4aba-baef-c4dcd53940d0' AND is_deleted = false
);

-- Fashion Hub custom stats (3)
INSERT INTO portfolio_custom_stat (
  id, profile_id, label, value,
  display_order, version, is_deleted, created_at, updated_at, created_by, updated_by
)
SELECT gen_random_uuid(), 'bb1cad56-cafd-4aba-baef-c4dcd53940d0'::uuid, label, value, display_order, 0, false, NOW(), NOW(), 'admin', 'admin'
FROM (VALUES
  ('Styles Available', '500+',   1),
  ('Happy Clients',    '5,000+', 2),
  ('Designer Brands',  '30+',    3)
) AS v(label, value, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM portfolio_custom_stat WHERE profile_id = 'bb1cad56-cafd-4aba-baef-c4dcd53940d0' AND is_deleted = false
);


-- ============================================================================
-- 9. CUSTOMER REVIEWS (portfolio_review)
-- Mega Store:  30 reviews  (≈60% five-star, 20% four-star, 13% three-star, 7% two-star)
-- Fashion Hub: 15 reviews  (≈60% five-star, 25% four-star, 15% three-star)
-- Only inserted if no reviews exist yet for that profile (idempotent)
-- ============================================================================

-- Mega Store reviews (30)
INSERT INTO portfolio_review (
  id, profile_id, business_id,
  customer_name, customer_email, customer_phone,
  rating, title, comment, would_recommend,
  version, is_deleted, created_at, updated_at, created_by, updated_by
)
SELECT
  gen_random_uuid(),
  'aa1cad56-cafd-4aba-baef-c4dcd53940d0',
  '550cad56-cafd-4aba-baef-c4dcd53940d0',
  CASE (i % 15)
    WHEN 0  THEN 'Sophea Chan'
    WHEN 1  THEN 'Dara Nhem'
    WHEN 2  THEN 'Ratana Pov'
    WHEN 3  THEN 'Bopha Seng'
    WHEN 4  THEN 'Virak Ung'
    WHEN 5  THEN 'Sreymom Ith'
    WHEN 6  THEN 'Piseth Kum'
    WHEN 7  THEN 'Chanthy Hok'
    WHEN 8  THEN 'Vannak Lim'
    WHEN 9  THEN 'Kunthea Mao'
    WHEN 10 THEN 'Makara Pen'
    WHEN 11 THEN 'Leakhena Siv'
    WHEN 12 THEN 'Bunthoeun Prak'
    WHEN 13 THEN 'Kimchea Yun'
    ELSE         'Rotha Kheang'
  END,
  'ms.customer' || i || '@gmail.com',
  '+855-' || (10 + (i % 80)) || LPAD((100000 + i * 7777)::text, 7, '0'),
  CASE
    WHEN i % 10 < 6 THEN 5
    WHEN i % 10 < 8 THEN 4
    WHEN i % 10 < 9 THEN 3
    ELSE                  2
  END,
  CASE (i % 6)
    WHEN 0 THEN 'Absolutely love this store!'
    WHEN 1 THEN 'Great quality, fast delivery'
    WHEN 2 THEN 'Best shopping experience in Phnom Penh'
    WHEN 3 THEN 'Good value for money'
    WHEN 4 THEN 'Reliable and trustworthy'
    ELSE        'Happy with my purchase'
  END,
  CASE (i % 6)
    WHEN 0 THEN 'I''ve been shopping at Mega Store for years and they never disappoint. The product quality is top-notch, delivery is always on time, and the customer service team goes above and beyond. Highly recommended to everyone!'
    WHEN 1 THEN 'Ordered on Monday, received Tuesday morning! The packaging was perfect and the product is exactly as described. Customer service answered my question within minutes. Five stars all the way.'
    WHEN 2 THEN 'Mega Store really is the best retail experience in Phnom Penh. Huge selection, competitive prices, and a loyalty rewards programme that actually saves you money. I bring all my friends here.'
    WHEN 3 THEN 'Good products at fair prices. The loyalty points system is a nice bonus — I''ve already redeemed twice. Delivery was a little slow this time but still acceptable. Overall solid experience.'
    WHEN 4 THEN 'I was nervous ordering electronics online but Mega Store gave me full confidence. The warranty process was explained clearly, the product arrived sealed, and the quality was exactly as advertised.'
    ELSE        'Pleasant shopping experience. Product was good quality and came well packaged. Customer service responded quickly when I had a question. Will shop here again for sure.'
  END,
  (i % 7 != 0),
  0, false,
  NOW() - INTERVAL '1 day' * (i * 3 % 180),
  NOW() - INTERVAL '1 day' * (i * 3 % 180),
  'system', 'system'
FROM generate_series(1, 30) AS t(i)
WHERE NOT EXISTS (
  SELECT 1 FROM portfolio_review
  WHERE profile_id = 'aa1cad56-cafd-4aba-baef-c4dcd53940d0' AND is_deleted = false
);

-- Fashion Hub reviews (15)
INSERT INTO portfolio_review (
  id, profile_id, business_id,
  customer_name, customer_email, customer_phone,
  rating, title, comment, would_recommend,
  version, is_deleted, created_at, updated_at, created_by, updated_by
)
SELECT
  gen_random_uuid(),
  'bb1cad56-cafd-4aba-baef-c4dcd53940d0',
  '660cad56-cafd-4aba-baef-c4dcd53940d0',
  CASE (i % 8)
    WHEN 0 THEN 'Srey Nak'
    WHEN 1 THEN 'Bunna Chhuon'
    WHEN 2 THEN 'Kimchea Yun'
    WHEN 3 THEN 'Leakhena Siv'
    WHEN 4 THEN 'Makara Pen'
    WHEN 5 THEN 'Nita Chea'
    WHEN 6 THEN 'Rotha Kheang'
    ELSE         'Tida Heng'
  END,
  'fh.customer' || i || '@gmail.com',
  '+855-' || (70 + (i % 20)) || LPAD((200000 + i * 5555)::text, 7, '0'),
  CASE
    WHEN i % 8 < 5 THEN 5
    WHEN i % 8 < 7 THEN 4
    ELSE                 3
  END,
  CASE (i % 4)
    WHEN 0 THEN 'Best boutique in Siem Reap!'
    WHEN 1 THEN 'Stunning collection this season'
    WHEN 2 THEN 'The tailoring service is outstanding'
    ELSE        'Love the Khmer-inspired designs'
  END,
  CASE (i % 4)
    WHEN 0 THEN 'Fashion Hub is my absolute go-to for every occasion. The stylists genuinely understand what suits you, and the quality of every collection is unmatched in Siem Reap. I always leave feeling confident and beautiful!'
    WHEN 1 THEN 'The new season collection is absolutely breathtaking. I picked up three outfits and received so many compliments at the event. The fabric quality and stitching are exceptional — worth every single riel.'
    WHEN 2 THEN 'Had a dress custom tailored for my sister''s wedding by Kimhong and the team. The professionalism and attention to detail were extraordinary. The finished dress was beyond perfect. I will return for every special occasion.'
    ELSE        'I love how Fashion Hub weaves traditional Khmer patterns into modern fashion. It feels authentically Cambodian yet completely contemporary. The staff are always warm, knowledgeable, and never pushy.'
  END,
  (i % 5 != 0),
  0, false,
  NOW() - INTERVAL '1 day' * (i * 5 % 120),
  NOW() - INTERVAL '1 day' * (i * 5 % 120),
  'system', 'system'
FROM generate_series(1, 15) AS t(i)
WHERE NOT EXISTS (
  SELECT 1 FROM portfolio_review
  WHERE profile_id = 'bb1cad56-cafd-4aba-baef-c4dcd53940d0' AND is_deleted = false
);


-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

SELECT '=== PORTFOLIO PROFILES ===' AS info;
SELECT id, business_name, slug, industry, is_published, years_in_business, customers_served
FROM portfolio_profile
WHERE is_deleted = false
ORDER BY created_at;

SELECT '=== PORTFOLIO COUNTS PER BUSINESS ===' AS info;
SELECT
  pp.business_name,
  (SELECT COUNT(*) FROM portfolio_profile_phones   WHERE profile_id = pp.id)                           AS phones,
  (SELECT COUNT(*) FROM portfolio_profile_features WHERE profile_id = pp.id)                           AS features,
  (SELECT COUNT(*) FROM portfolio_hours            WHERE profile_id = pp.id AND is_deleted = false)    AS hours,
  (SELECT COUNT(*) FROM portfolio_gallery          WHERE profile_id = pp.id AND is_deleted = false)    AS gallery,
  (SELECT COUNT(*) FROM portfolio_service_item     WHERE profile_id = pp.id AND is_deleted = false)    AS services,
  (SELECT COUNT(*) FROM portfolio_team_member      WHERE profile_id = pp.id AND is_deleted = false)    AS team,
  (SELECT COUNT(*) FROM portfolio_custom_stat      WHERE profile_id = pp.id AND is_deleted = false)    AS custom_stats,
  (SELECT COUNT(*) FROM portfolio_review           WHERE profile_id = pp.id AND is_deleted = false)    AS reviews
FROM portfolio_profile pp
WHERE pp.is_deleted = false
ORDER BY pp.created_at;

SELECT '=== REVIEW RATING DISTRIBUTION ===' AS info;
SELECT
  pp.business_name,
  pr.rating,
  COUNT(*) AS count
FROM portfolio_review pr
JOIN portfolio_profile pp ON pr.profile_id = pp.id
WHERE pr.is_deleted = false
GROUP BY pp.business_name, pr.rating
ORDER BY pp.business_name, pr.rating DESC;

-- ============================================================================
-- SUMMARY
-- ✅ PROFILES:    2 (Mega Store, Fashion Hub)
--
-- ✅ MEGA STORE  (aa1cad56-cafd-4aba-baef-c4dcd53940d0)
--   ├─ Phones:       3
--   ├─ Features:     6
--   ├─ Hours:        7  (Mon–Sun, all open)
--   ├─ Gallery:      8  items
--   ├─ Services:     6
--   ├─ Team:         5  members
--   ├─ Custom Stats: 4
--   └─ Reviews:      30 (~60% 5★, 20% 4★, 13% 3★, 7% 2★)
--
-- ✅ FASHION HUB (bb1cad56-cafd-4aba-baef-c4dcd53940d0)
--   ├─ Phones:       2
--   ├─ Features:     5
--   ├─ Hours:        7  (closed Tuesday)
--   ├─ Gallery:      6  items
--   ├─ Services:     4
--   ├─ Team:         4  members
--   ├─ Custom Stats: 3
--   └─ Reviews:      15 (~62% 5★, 25% 4★, 13% 3★)
--
-- ✅ TOTAL RECORDS: ~180
-- ============================================================================
