-- Insert some sample notices directly using existing user IDs
DO $$
DECLARE
    admin_id TEXT;
    settlement_id TEXT;
BEGIN
    -- Get the first admin user
    SELECT id INTO admin_id FROM users WHERE role = 'ADMIN' LIMIT 1;
    
    -- Insert global notices
    INSERT INTO notices (id, title, content, priority, "targetType", "settlementId", "isActive", "createdBy", "createdAt", "updatedAt") VALUES 
    (uuid_generate_v4()::text, 'System Maintenance Notice', 'We will be performing scheduled maintenance on our systems this weekend. Please expect some downtime between 2 AM and 6 AM.', 'HIGH', 'ALL', NULL, true, admin_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (uuid_generate_v4()::text, 'New Data Collection Protocol', 'Starting next week, we will be implementing a new data collection protocol. Please attend the training session on Friday.', 'MEDIUM', 'ALL', NULL, true, admin_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (uuid_generate_v4()::text, 'Welcome to DPWMT', 'Welcome to the Data Platform for Women and Marginalized Technologies. This platform helps track and improve living conditions in settlements.', 'LOW', 'ALL', NULL, true, admin_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    -- Get the first settlement ID for targeted notices
    SELECT id INTO settlement_id FROM settlements LIMIT 1;
    
    IF settlement_id IS NOT NULL THEN
        INSERT INTO notices (id, title, content, priority, "targetType", "settlementId", "isActive", "createdBy", "createdAt", "updatedAt") VALUES 
        (uuid_generate_v4()::text, 'Community Meeting', 'There will be a community meeting this Thursday at 3 PM to discuss recent improvements and upcoming projects.', 'HIGH', 'SETTLEMENT', settlement_id, true, admin_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (uuid_generate_v4()::text, 'Water System Update', 'The water system in your settlement has been upgraded. Please report any issues to your local coordinator.', 'MEDIUM', 'SETTLEMENT', settlement_id, true, admin_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    END IF;
END $$;