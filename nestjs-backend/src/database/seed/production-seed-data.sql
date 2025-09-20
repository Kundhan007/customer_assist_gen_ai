-- Insert production demo users (3 admin, 12 regular)
-- Let the database generate UUIDs for user_id
INSERT INTO users (email, password_hash, role) VALUES
  ('admin@prod.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
  ('superadmin@prod.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
  ('support@prod.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
  ('demo.user@prod.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user'),
  ('sarah.johnson@prod.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user'),
  ('michael.chen@prod.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user'),
  ('emma.wilson@prod.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user'),
  ('robert.davis@prod.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user'),
  ('lisa.anderson@prod.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user'),
  ('david.martinez@prod.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user'),
  ('jennifer.taylor@prod.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user'),
  ('james.thomas@prod.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user'),
  ('mary.garcia@prod.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user'),
  ('william.rodriguez@prod.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user'),
  ('patricia.clark@prod.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user');

-- Insert production demo policies (12 Gold, 13 Silver)
-- Use subqueries to get the correct user IDs based on email
INSERT INTO policies (policy_id, user_id, plan_name, collision_coverage, roadside_assistance, deductible, premium, start_date, end_date) VALUES
  -- Gold Policies (12)
  ('GOLD-P001', (SELECT user_id FROM users WHERE email = 'sarah.johnson@prod.com'), 'Gold', 300000, true, 2000, 32000.00, '2024-01-01', '2024-12-31'),
  ('GOLD-P002', (SELECT user_id FROM users WHERE email = 'michael.chen@prod.com'), 'Gold', 250000, true, 3000, 28000.00, '2024-02-15', '2025-02-14'),
  ('GOLD-P003', (SELECT user_id FROM users WHERE email = 'emma.wilson@prod.com'), 'Gold', 200000, true, 5000, 22000.00, '2024-03-01', '2025-02-28'),
  ('GOLD-P004', (SELECT user_id FROM users WHERE email = 'robert.davis@prod.com'), 'Gold', 180000, false, 6000, 19500.00, '2024-01-15', '2025-01-14'),
  ('GOLD-P005', (SELECT user_id FROM users WHERE email = 'lisa.anderson@prod.com'), 'Gold', 220000, true, 4000, 24500.00, '2024-04-01', '2025-03-31'),
  ('GOLD-P006', (SELECT user_id FROM users WHERE email = 'david.martinez@prod.com'), 'Gold', 160000, true, 5500, 17800.00, '2024-05-01', '2025-04-30'),
  ('GOLD-P007', (SELECT user_id FROM users WHERE email = 'jennifer.taylor@prod.com'), 'Gold', 280000, true, 2500, 29500.00, '2024-06-01', '2025-05-31'),
  ('GOLD-P008', (SELECT user_id FROM users WHERE email = 'sarah.johnson@prod.com'), 'Gold', 150000, false, 7000, 16500.00, '2024-07-01', '2025-06-30'),
  ('GOLD-P009', (SELECT user_id FROM users WHERE email = 'james.thomas@prod.com'), 'Gold', 240000, true, 3500, 26500.00, '2024-08-01', '2025-07-31'),
  ('GOLD-P010', (SELECT user_id FROM users WHERE email = 'mary.garcia@prod.com'), 'Gold', 190000, true, 4500, 21000.00, '2024-09-01', '2025-08-31'),
  ('GOLD-P011', (SELECT user_id FROM users WHERE email = 'william.rodriguez@prod.com'), 'Gold', 210000, false, 6500, 22500.00, '2024-10-01', '2025-09-30'),
  ('GOLD-P012', (SELECT user_id FROM users WHERE email = 'patricia.clark@prod.com'), 'Gold', 170000, true, 5000, 18500.00, '2024-11-01', '2025-10-31'),
  -- Silver Policies (13)
  ('SILVER-P001', (SELECT user_id FROM users WHERE email = 'demo.user@prod.com'), 'Silver', 120000, false, 8000, 13500.00, '2024-01-01', '2024-12-31'),
  ('SILVER-P002', (SELECT user_id FROM users WHERE email = 'michael.chen@prod.com'), 'Silver', 100000, true, 10000, 12000.00, '2024-02-15', '2025-02-14'),
  ('SILVER-P003', (SELECT user_id FROM users WHERE email = 'robert.davis@prod.com'), 'Silver', 80000, false, 12000, 10500.00, '2024-03-01', '2025-02-28'),
  ('SILVER-P004', (SELECT user_id FROM users WHERE email = 'david.martinez@prod.com'), 'Silver', 95000, true, 9000, 11500.00, '2024-01-15', '2025-01-14'),
  ('SILVER-P005', (SELECT user_id FROM users WHERE email = 'james.thomas@prod.com'), 'Silver', 110000, false, 11000, 12800.00, '2024-04-01', '2025-03-31'),
  ('SILVER-P006', (SELECT user_id FROM users WHERE email = 'william.rodriguez@prod.com'), 'Silver', 75000, true, 13000, 9800.00, '2024-05-01', '2025-04-30'),
  ('SILVER-P007', (SELECT user_id FROM users WHERE email = 'sarah.johnson@prod.com'), 'Silver', 85000, false, 14000, 10200.00, '2024-06-01', '2025-05-31'),
  ('SILVER-P008', (SELECT user_id FROM users WHERE email = 'emma.wilson@prod.com'), 'Silver', 125000, true, 7500, 14200.00, '2024-07-01', '2025-06-30'),
  ('SILVER-P009', (SELECT user_id FROM users WHERE email = 'lisa.anderson@prod.com'), 'Silver', 90000, false, 10500, 10800.00, '2024-08-01', '2025-07-31'),
  ('SILVER-P010', (SELECT user_id FROM users WHERE email = 'jennifer.taylor@prod.com'), 'Silver', 105000, true, 9500, 12200.00, '2024-09-01', '2025-08-31'),
  ('SILVER-P011', (SELECT user_id FROM users WHERE email = 'mary.garcia@prod.com'), 'Silver', 70000, false, 15000, 9200.00, '2024-10-01', '2025-09-30'),
  ('SILVER-P012', (SELECT user_id FROM users WHERE email = 'patricia.clark@prod.com'), 'Silver', 115000, true, 8500, 13200.00, '2024-11-01', '2025-10-31'),
  ('SILVER-P013', (SELECT user_id FROM users WHERE email = 'demo.user@prod.com'), 'Silver', 65000, false, 16000, 8800.00, '2024-12-01', '2025-11-30');

-- Insert production demo claims (30+ total - covering all statuses)
INSERT INTO claims (claim_id, policy_id, status, damage_description, vehicle, photos, last_updated) VALUES
  -- Approved Claims (7)
  ('CLM-P001', 'GOLD-P001', 'Approved', 'Major collision on highway. Front bumper damage, radiator leak, and headlight replacement needed. Vehicle was towed to authorized service center.', '2023 BMW X5', ARRAY['front_damage.jpg', 'radiator_leak.jpg', 'towing_receipt.jpg'], '2024-01-20'),
  ('CLM-P006', 'GOLD-P003', 'Approved', 'Rear-end collision at stop light. Minor bumper damage and sensor calibration required. Repairs completed.', '2024 Audi Q7', ARRAY['bumper_damage.jpg', 'repair_invoice.jpg'], '2024-07-15'),
  ('CLM-P011', 'SILVER-P002', 'Approved', 'Side mirror damage in parking lot incident. Quick repair and replacement completed.', '2022 Mercedes C-Class', ARRAY['mirror_damage.jpg', 'repair_receipt.jpg'], '2024-04-20'),
  ('CLM-P016', 'GOLD-P005', 'Approved', 'Hail damage from severe storm. Multiple dents repaired by authorized body shop.', '2021 Tesla Model S', ARRAY['hood_dents.jpg', 'roof_damage.jpg', 'repair_invoice.pdf'], '2024-06-10'),
  ('CLM-P021', 'SILVER-P004', 'Approved', 'Broken windshield from rock impact on highway. Glass replacement completed at authorized facility.', '2023 Honda Accord', ARRAY['windshield_damage.jpg', 'replacement_invoice.jpg'], '2024-03-25'),
  ('CLM-P026', 'GOLD-P007', 'Approved', 'Theft of catalytic converter. Replacement completed and anti-theft device installed.', '2022 Toyota Prius', ARRAY['undercarriage.jpg', 'theft_report.jpg', 'repair_invoice.pdf'], '2024-08-15'),
  ('CLM-P030', 'SILVER-P008', 'Approved', 'Vandalism repair - keyed doors and scratched paint. Full repaint completed.', '2020 Lexus ES', ARRAY['paint_damage.jpg', 'repair_photos.jpg'], '2024-09-10'),
  -- In Review Claims (6)
  ('CLM-P002', 'GOLD-P002', 'In Review', 'Side swipe in parking lot. Driver side door and mirror damaged. Police report filed. Other driver at fault.', '2022 Mercedes C-Class', ARRAY['door_damage.jpg', 'mirror_damage.jpg', 'police_report.pdf'], '2024-03-15'),
  ('CLM-P007', 'SILVER-P003', 'In Review', 'Water damage from flooding. Interior damage and electrical issues. Assessment in progress.', '2021 Ford Explorer', ARRAY['flood_damage.jpg', 'interior_damage.jpg'], '2024-05-15'),
  ('CLM-P012', 'GOLD-P004', 'In Review', 'Engine failure due to suspected manufacturing defect. Mechanical evaluation ongoing.', '2023 Volvo XC90', ARRAY['engine_photo.jpg', 'diagnostic_report.pdf'], '2024-07-20'),
  ('CLM-P017', 'SILVER-P005', 'In Review', 'Multiple hit and run incidents in parking garage. Security footage under review.', '2022 BMW 3 Series', ARRAY['damage_photos.jpg', 'parking_receipt.jpg'], '2024-08-25'),
  ('CLM-P022', 'GOLD-P008', 'In Review', 'Transmission failure after 50,000 miles. Transmission specialist evaluation pending.', '2021 Audi A6', ARRAY['transmission_photo.jpg', 'service_records.pdf'], '2024-09-05'),
  ('CLM-P027', 'SILVER-P009', 'In Review', 'Suspension damage from pothole. Alignment and suspension repair assessment.', '2020 Honda Civic', ARRAY['suspension_damage.jpg', 'wheel_alignment.jpg'], '2024-10-10'),
  -- Submitted Claims (6)
  ('CLM-P003', 'SILVER-P001', 'Submitted', 'Hail damage from severe storm. Multiple dents on hood, roof, and trunk. Estimate pending from body shop.', '2021 Toyota Corolla', ARRAY['hood_dents.jpg', 'roof_damage.jpg', 'trunk_dents.jpg'], '2024-04-10'),
  ('CLM-P008', 'GOLD-P006', 'Submitted', 'Vandalism - keyed paint on driver side. Police report filed. Repair estimate pending.', '2022 Mercedes C-Class', ARRAY['paint_damage.jpg', 'police_report.pdf'], '2024-08-01'),
  ('CLM-P013', 'SILVER-P006', 'Submitted', 'Tree branch fell on roof during storm. Significant roof and windshield damage.', '2019 Toyota RAV4', ARRAY['roof_damage.jpg', 'windshield_damage.jpg', 'storm_photo.jpg'], '2024-06-12'),
  ('CLM-P018', 'GOLD-P009', 'Submitted', 'Animal collision - deer ran into vehicle on rural road. Front end damage.', '2023 Subaru Outback', ARRAY['deer_collision.jpg', 'front_end_damage.jpg'], '2024-07-30'),
  ('CLM-P023', 'SILVER-P007', 'Submitted', 'Fire damage from engine compartment. Electrical fire suspected. Investigation ongoing.', '2020 Jeep Wrangler', ARRAY['fire_damage.jpg', 'engine_compartment.jpg'], '2024-09-15'),
  ('CLM-P028', 'GOLD-P011', 'Submitted', 'Stolen vehicle recovered with significant damage. Recovery assessment pending.', '2022 Hyundai Tucson', ARRAY['recovered_vehicle.jpg', 'theft_report.pdf'], '2024-10-20'),
  -- Rejected Claims (6)
  ('CLM-P004', 'SILVER-P002', 'Rejected', 'Claim for engine failure due to lack of maintenance. Not covered under policy terms.', '2020 Honda Civic', ARRAY['engine_photo.jpg', 'maintenance_records.pdf'], '2024-01-30'),
  ('CLM-P009', 'GOLD-P005', 'Rejected', 'Intentional damage not covered by policy. Driver admitted to deliberate collision.', '2021 Nissan Altima', ARRAY['intentional_damage.jpg', 'police_report.pdf'], '2024-04-25'),
  ('CLM-P014', 'SILVER-P004', 'Rejected', 'Damage occurred before policy start date. Pre-existing condition confirmed.', '2018 Ford Fiesta', ARRAY['old_damage.jpg', 'inspection_report.pdf'], '2024-05-20'),
  ('CLM-P019', 'GOLD-P007', 'Rejected', 'Claim for normal wear and tear. Not considered covered damage.', '2019 Chevrolet Malibu', ARRAY['wear_photos.jpg', 'inspection_report.pdf'], '2024-08-10'),
  ('CLM-P024', 'SILVER-P010', 'Rejected', 'Unlicensed driver at time of incident. Policy violation confirmed.', '2022 Mazda CX-5', ARRAY['incident_report.jpg', 'license_verification.pdf'], '2024-09-20'),
  ('CLM-P029', 'GOLD-P012', 'Rejected', 'Racing activity on track. Exclusion clause applies to competitive driving.', '2020 Ford Mustang', ARRAY['track_photos.jpg', 'event_ticket.jpg'], '2024-10-25'),
  -- Closed Claims (5)
  ('CLM-P005', 'GOLD-P001', 'Closed', 'Broken windshield from rock impact on highway. Glass replacement completed at authorized facility.', '2023 BMW X5', ARRAY['windshield_damage.jpg', 'replacement_invoice.jpg'], '2024-02-05'),
  ('CLM-P010', 'SILVER-P003', 'Closed', 'Minor fender bender, repairs completed and paid through at-fault party insurance.', '2021 Nissan Altima', ARRAY['fender_before.jpg', 'fender_after.jpg', 'payment_receipt.jpg'], '2024-05-01'),
  ('CLM-P015', 'GOLD-P002', 'Closed', 'Stolen vehicle recovered with minimal damage. Repairs completed.', '2022 Mazda CX-5', ARRAY['recovered_vehicle.jpg', 'repair_invoice.jpg'], '2024-06-30'),
  ('CLM-P020', 'SILVER-P006', 'Closed', 'Hit and run - repairs completed through uninsured motorist coverage.', '2023 Audi A4', ARRAY['hit_and_run.jpg', 'repair_invoice.pdf', 'police_report.pdf'], '2024-08-05'),
  ('CLM-P025', 'GOLD-P010', 'Closed', 'Multiple parking lot dents repaired. Claim settled with comprehensive coverage.', '2021 Toyota Camry', ARRAY['dent_photos.jpg', 'repair_completion.jpg'], '2024-09-30');

-- Insert production demo premium history (25+ records)
INSERT INTO premium_history (policy_id, current_coverage, new_coverage, current_premium, new_premium, calculation_date) VALUES
  -- GOLD Policy Premium Changes (13)
  ('GOLD-P001', 250000, 300000, 29500.00, 32000.00, '2024-01-01'),
  ('GOLD-P001', 300000, 320000, 32000.00, 33500.00, '2024-07-01'),
  ('GOLD-P002', 200000, 250000, 24500.00, 28000.00, '2024-02-15'),
  ('GOLD-P002', 250000, 280000, 28000.00, 30500.00, '2024-08-15'),
  ('GOLD-P003', 150000, 200000, 18500.00, 22000.00, '2024-03-01'),
  ('GOLD-P004', 0, 180000, 0.00, 19500.00, '2024-01-15'),
  ('GOLD-P005', 180000, 220000, 20500.00, 24500.00, '2024-04-01'),
  ('GOLD-P006', 0, 160000, 0.00, 17800.00, '2024-05-01'),
  ('GOLD-P007', 250000, 280000, 26500.00, 29500.00, '2024-06-01'),
  ('GOLD-P008', 120000, 150000, 14500.00, 16500.00, '2024-07-01'),
  ('GOLD-P009', 200000, 240000, 22500.00, 26500.00, '2024-08-01'),
  ('GOLD-P010', 170000, 190000, 19000.00, 21000.00, '2024-09-01'),
  ('GOLD-P011', 180000, 210000, 19500.00, 22500.00, '2024-10-01'),
  ('GOLD-P012', 0, 170000, 0.00, 18500.00, '2024-11-01'),
  -- SILVER Policy Premium Changes (12)
  ('SILVER-P001', 100000, 120000, 11500.00, 13500.00, '2024-01-01'),
  ('SILVER-P002', 80000, 100000, 10000.00, 12000.00, '2024-02-15'),
  ('SILVER-P003', 0, 80000, 0.00, 10500.00, '2024-03-01'),
  ('SILVER-P004', 70000, 95000, 8900.00, 11500.00, '2024-01-15'),
  ('SILVER-P005', 90000, 110000, 10800.00, 12800.00, '2024-04-01'),
  ('SILVER-P006', 0, 75000, 0.00, 9800.00, '2024-05-01'),
  ('SILVER-P007', 70000, 85000, 8600.00, 10200.00, '2024-06-01'),
  ('SILVER-P008', 100000, 125000, 11800.00, 14200.00, '2024-07-01'),
  ('SILVER-P009', 75000, 90000, 9200.00, 10800.00, '2024-08-01'),
  ('SILVER-P010', 90000, 105000, 10600.00, 12200.00, '2024-09-01'),
  ('SILVER-P011', 0, 70000, 0.00, 9200.00, '2024-10-01'),
  ('SILVER-P012', 100000, 115000, 11800.00, 13200.00, '2024-11-01'),
  ('SILVER-P013', 0, 65000, 0.00, 8800.00, '2024-12-01');

-- Knowledge base entries will be populated by the vector processing script
-- No placeholder entries needed - they'll be created during vector processing
