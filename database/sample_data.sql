-- Sample data for testing PureSign
-- Run this after creating the schema

-- Insert a test profile
-- Note: Replace 'your-reference-sig-url' with an actual Supabase Storage URL
INSERT INTO profiles (id, user_name, reference_sig_url)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Test User',
    'https://your-project.supabase.co/storage/v1/object/public/puresign-storage/reference_sigs/test_signature.jpg'
);

-- Insert sample verification records
INSERT INTO verifications (id, user_id, original_doc_url, cleaned_sig_url, confidence_score, status)
VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000001',
    'https://your-project.supabase.co/storage/v1/object/public/puresign-storage/original_docs/sample1.jpg',
    'https://your-project.supabase.co/storage/v1/object/public/puresign-storage/cleaned/sample1_cleaned.jpg',
    0.92,
    'success'
),
(
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000001',
    'https://your-project.supabase.co/storage/v1/object/public/puresign-storage/original_docs/sample2.jpg',
    'https://your-project.supabase.co/storage/v1/object/public/puresign-storage/cleaned/sample2_cleaned.jpg',
    0.45,
    'failed'
);

