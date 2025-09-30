-- Add new images with the URLs mentioned in the admin notice
DO $$
DECLARE
    active_campaign_id TEXT;
BEGIN
    -- Get the first active campaign
    SELECT id INTO active_campaign_id FROM campaigns WHERE "isActive" = true LIMIT 1;
    
    IF active_campaign_id IS NOT NULL THEN
        -- Insert the two images mentioned in the notice
        INSERT INTO images (id, url, "campaignId", "groundTruth", "consensusReached", "totalResponses", "yesCount", "noCount", "createdAt", "updatedAt") VALUES 
        (
            uuid_generate_v4()::text,
            'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop',
            active_campaign_id,
            NULL,
            false,
            0,
            0,
            0,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        ),
        (
            uuid_generate_v4()::text,
            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
            active_campaign_id,
            NULL,
            false,
            0,
            0,
            0,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        );
        
        RAISE NOTICE 'Added 2 new images to campaign: %', active_campaign_id;
    ELSE
        RAISE NOTICE 'No active campaign found!';
    END IF;
END $$;