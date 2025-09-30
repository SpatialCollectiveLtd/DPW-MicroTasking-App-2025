-- Create admin notice with image URLs for task demonstration
DO $$
DECLARE
    admin_id TEXT;
    new_notice_id TEXT;
BEGIN
    -- Get the first admin user
    SELECT id INTO admin_id FROM users WHERE role = 'ADMIN' LIMIT 1;
    
    -- Generate a new UUID for the notice
    new_notice_id := uuid_generate_v4()::text;
    
    -- Insert a new high-priority notice with task information including image URLs
    INSERT INTO notices (id, title, content, priority, "targetType", "settlementId", "isActive", "createdBy", "createdAt", "updatedAt") VALUES 
    (
        new_notice_id,
        '🚨 URGENT: New Image Review Tasks Available',
        'New community infrastructure tasks are now available for review! 

📸 **Task Details:**
• Image 1: Infrastructure Assessment - Building Foundation
  URL: https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop
  
• Image 2: Water System Evaluation - Pipe Connection  
  URL: https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop

⭐ **Earnings:** 50 KES per completed image review
📍 **Target:** All settlement workers
⏰ **Deadline:** Complete within 48 hours

Please access your dashboard to start reviewing these critical infrastructure images. Your accurate assessments help improve community planning.',
        'HIGH',
        'ALL',
        NULL,
        true,
        admin_id,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );
    
    RAISE NOTICE 'Created new admin notice with ID: %', new_notice_id;
END $$;