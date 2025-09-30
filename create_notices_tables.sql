-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create notices table
CREATE TABLE IF NOT EXISTS notices (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'MEDIUM',
    "targetType" TEXT NOT NULL DEFAULT 'ALL',
    "settlementId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notice_settlement FOREIGN KEY ("settlementId") REFERENCES settlements(id),
    CONSTRAINT fk_notice_creator FOREIGN KEY ("createdBy") REFERENCES users(id)
);

-- Create notice_reads table
CREATE TABLE IF NOT EXISTS notice_reads (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "noticeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notice_read_notice FOREIGN KEY ("noticeId") REFERENCES notices(id) ON DELETE CASCADE,
    CONSTRAINT fk_notice_read_user FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT unique_notice_user UNIQUE ("noticeId", "userId")
);