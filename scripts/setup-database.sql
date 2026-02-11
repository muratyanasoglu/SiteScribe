-- =============================================================================
-- SiteScribe – Tüm veritabanı komutları (MySQL 8.x)
-- =============================================================================
-- Bu dosyayı MySQL root kullanıcısıyla çalıştırın.
-- Bölüm 1: Veritabanı ve uygulama kullanıcısı (bir kez).
-- Bölüm 2: Veritabanını sıfırlayıp tüm tabloları oluşturur (VERİ SİLİNİR).
-- =============================================================================

-- ---------- BÖLÜM 1: Veritabanı ve kullanıcı (bir kez çalıştırın) ----------
CREATE DATABASE IF NOT EXISTS sitescribe CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'sitescribe'@'localhost' IDENTIFIED BY 'sitescribe';
GRANT ALL PRIVILEGES ON sitescribe.* TO 'sitescribe'@'localhost';
FLUSH PRIVILEGES;

-- ---------- BÖLÜM 2: Şema (sıfırdan tablolar) ----------
-- UYARI: Aşağıdaki DROP veritabanını siler; tüm veri gider. Sonra yeniden oluşturulur.
DROP DATABASE IF EXISTS sitescribe;
CREATE DATABASE sitescribe CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sitescribe;

-- ============ Prisma migration: init ============
CREATE TABLE `Organization` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `Organization_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `email_verified` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Account` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `provider_account_id` VARCHAR(191) NOT NULL,
    `refresh_token` TEXT NULL,
    `access_token` TEXT NULL,
    `expires_at` INTEGER NULL,
    `token_type` VARCHAR(191) NULL,
    `scope` VARCHAR(191) NULL,
    `id_token` TEXT NULL,
    `session_state` VARCHAR(191) NULL,
    INDEX `Account_user_id_idx`(`user_id`),
    UNIQUE INDEX `Account_provider_provider_account_id_key`(`provider`, `provider_account_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `session_token` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,
    UNIQUE INDEX `Session_session_token_key`(`session_token`),
    INDEX `Session_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `VerificationToken` (
    `identifier` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,
    UNIQUE INDEX `VerificationToken_token_key`(`token`),
    UNIQUE INDEX `VerificationToken_identifier_token_key`(`identifier`, `token`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Membership` (
    `id` VARCHAR(191) NOT NULL,
    `organization_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `role` ENUM('OWNER', 'PM', 'FIELD', 'SUBCONTRACTOR', 'VIEWER') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    INDEX `Membership_organization_id_idx`(`organization_id`),
    INDEX `Membership_user_id_idx`(`user_id`),
    UNIQUE INDEX `Membership_organization_id_user_id_key`(`organization_id`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Project` (
    `id` VARCHAR(191) NOT NULL,
    `organization_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    INDEX `Project_organization_id_idx`(`organization_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Evidence` (
    `id` VARCHAR(191) NOT NULL,
    `project_id` VARCHAR(191) NOT NULL,
    `type` ENUM('SITE_LOG', 'PHOTO', 'RFI_DOC', 'PLAN_REVISION', 'CONTRACT') NOT NULL,
    `title` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `occurred_at` DATETIME(3) NOT NULL,
    `file_url` VARCHAR(191) NULL,
    `file_hash` VARCHAR(191) NULL,
    `mime_type` VARCHAR(191) NULL,
    `size` INTEGER NULL,
    `extracted_text` LONGTEXT NULL,
    `metadata` JSON NULL,
    `ai_summary` TEXT NULL,
    `ai_suggested_type` VARCHAR(191) NULL,
    `ai_embedding` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    `created_by` VARCHAR(191) NULL,
    INDEX `Evidence_project_id_idx`(`project_id`),
    INDEX `Evidence_project_id_type_idx`(`project_id`, `type`),
    INDEX `Evidence_project_id_occurred_at_idx`(`project_id`, `occurred_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `EvidenceChunk` (
    `id` VARCHAR(191) NOT NULL,
    `evidence_id` VARCHAR(191) NOT NULL,
    `index` INTEGER NOT NULL,
    `content` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `EvidenceChunk_evidence_id_idx`(`evidence_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `EvidenceLink` (
    `id` VARCHAR(191) NOT NULL,
    `project_id` VARCHAR(191) NOT NULL,
    `from_id` VARCHAR(191) NOT NULL,
    `to_id` VARCHAR(191) NOT NULL,
    `link_type` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `EvidenceLink_project_id_idx`(`project_id`),
    INDEX `EvidenceLink_from_id_to_id_idx`(`from_id`, `to_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ChangeEvent` (
    `id` VARCHAR(191) NOT NULL,
    `project_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'DETECTED',
    `occurred_at` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    INDEX `ChangeEvent_project_id_idx`(`project_id`),
    INDEX `ChangeEvent_project_id_status_idx`(`project_id`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `EventSignal` (
    `id` VARCHAR(191) NOT NULL,
    `change_event_id` VARCHAR(191) NOT NULL,
    `evidence_id` VARCHAR(191) NOT NULL,
    `score` DOUBLE NOT NULL,
    `reason` TEXT NULL,
    `ai_signal_type` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `EventSignal_change_event_id_idx`(`change_event_id`),
    INDEX `EventSignal_evidence_id_idx`(`evidence_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ChangeOrder` (
    `id` VARCHAR(191) NOT NULL,
    `project_id` VARCHAR(191) NOT NULL,
    `change_event_id` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `scope_narrative` TEXT NULL,
    `contract_clauses` TEXT NULL,
    `assumptions` TEXT NULL,
    `exclusions` TEXT NULL,
    `schedule_impact_days` INTEGER NULL,
    `ai_cost_estimate` TEXT NULL,
    `ai_risk_level` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'DRAFT',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    INDEX `ChangeOrder_project_id_idx`(`project_id`),
    INDEX `ChangeOrder_change_event_id_idx`(`change_event_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ChangeOrderLineItem` (
    `id` VARCHAR(191) NOT NULL,
    `change_order_id` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `quantity` DOUBLE NULL,
    `unit` VARCHAR(191) NULL,
    `unit_price` DOUBLE NULL,
    `amount` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    INDEX `ChangeOrderLineItem_change_order_id_idx`(`change_order_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Invitation` (
    `id` VARCHAR(191) NOT NULL,
    `organization_id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `role` ENUM('OWNER', 'PM', 'FIELD', 'SUBCONTRACTOR', 'VIEWER') NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `Invitation_token_key`(`token`),
    INDEX `Invitation_organization_id_idx`(`organization_id`),
    INDEX `Invitation_token_idx`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `COTemplate` (
    `id` VARCHAR(191) NOT NULL,
    `organization_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `scope_body` TEXT NULL,
    `line_items_json` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    INDEX `COTemplate_organization_id_idx`(`organization_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Notification` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `body` TEXT NULL,
    `link` VARCHAR(191) NULL,
    `read_at` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `Notification_user_id_idx`(`user_id`),
    INDEX `Notification_user_id_read_at_idx`(`user_id`, `read_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `AuditLog` (
    `id` VARCHAR(191) NOT NULL,
    `entity_type` VARCHAR(191) NOT NULL,
    `entity_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `changes_json` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `AuditLog_entity_type_entity_id_idx`(`entity_type`, `entity_id`),
    INDEX `AuditLog_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `COApproval` (
    `id` VARCHAR(191) NOT NULL,
    `change_order_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `signed_at` DATETIME(3) NULL,
    `note` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `COApproval_change_order_id_idx`(`change_order_id`),
    UNIQUE INDEX `COApproval_change_order_id_user_id_key`(`change_order_id`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Webhook` (
    `id` VARCHAR(191) NOT NULL,
    `organization_id` VARCHAR(191) NOT NULL,
    `project_id` VARCHAR(191) NULL,
    `url` TEXT NOT NULL,
    `events` TEXT NOT NULL,
    `secret` TEXT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `Webhook_organization_id_idx`(`organization_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ScheduledExport` (
    `id` VARCHAR(191) NOT NULL,
    `project_id` VARCHAR(191) NOT NULL,
    `change_order_id` VARCHAR(191) NULL,
    `cron` VARCHAR(191) NOT NULL,
    `last_run_at` DATETIME(3) NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `notification_email` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `ScheduledExport_project_id_idx`(`project_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Comment` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `body` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `change_event_id` VARCHAR(191) NULL,
    `change_order_id` VARCHAR(191) NULL,
    INDEX `Comment_user_id_idx`(`user_id`),
    INDEX `Comment_change_event_id_idx`(`change_event_id`),
    INDEX `Comment_change_order_id_idx`(`change_order_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ExportJob` (
    `id` VARCHAR(191) NOT NULL,
    `project_id` VARCHAR(191) NOT NULL,
    `change_order_id` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `pdf_url` VARCHAR(191) NULL,
    `zip_url` VARCHAR(191) NULL,
    `manifest_json` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completedAt` DATETIME(3) NULL,
    INDEX `ExportJob_project_id_idx`(`project_id`),
    INDEX `ExportJob_change_order_id_idx`(`change_order_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `SentLog` (
    `id` VARCHAR(191) NOT NULL,
    `change_order_id` VARCHAR(191) NOT NULL,
    `sentAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `sent_to` VARCHAR(191) NULL,
    `method` VARCHAR(191) NULL,
    `export_job_id` VARCHAR(191) NULL,
    INDEX `SentLog_change_order_id_idx`(`change_order_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `AiUsageLog` (
    `id` VARCHAR(191) NOT NULL,
    `organization_id` VARCHAR(191) NULL,
    `project_id` VARCHAR(191) NULL,
    `operation` VARCHAR(191) NOT NULL,
    `model` VARCHAR(191) NULL,
    `input_tokens` INTEGER NULL,
    `output_tokens` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `AiUsageLog_organization_id_idx`(`organization_id`),
    INDEX `AiUsageLog_project_id_idx`(`project_id`),
    INDEX `AiUsageLog_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============ Prisma migration: add_friends_and_username ============
ALTER TABLE `User` ADD COLUMN `username` VARCHAR(191) NULL;
CREATE UNIQUE INDEX `User_username_key` ON `User`(`username`);

CREATE TABLE `FriendRequest` (
    `id` VARCHAR(191) NOT NULL,
    `from_user_id` VARCHAR(191) NOT NULL,
    `to_user_id` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `FriendRequest_from_user_id_to_user_id_key`(`from_user_id`, `to_user_id`),
    INDEX `FriendRequest_from_user_id_idx`(`from_user_id`),
    INDEX `FriendRequest_to_user_id_idx`(`to_user_id`),
    INDEX `FriendRequest_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============ Prisma migration: add_chat ============
CREATE TABLE `ChatMessage` (
    `id` VARCHAR(191) NOT NULL,
    `sender_id` VARCHAR(191) NOT NULL,
    `receiver_id` VARCHAR(191) NOT NULL,
    `body` TEXT NOT NULL,
    `read_at` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `ChatMessage_sender_id_receiver_id_idx`(`sender_id`, `receiver_id`),
    INDEX `ChatMessage_receiver_id_sender_id_idx`(`receiver_id`, `sender_id`),
    INDEX `ChatMessage_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============ Foreign keys ============
ALTER TABLE `Account` ADD CONSTRAINT `Account_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Session` ADD CONSTRAINT `Session_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Membership` ADD CONSTRAINT `Membership_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Membership` ADD CONSTRAINT `Membership_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Project` ADD CONSTRAINT `Project_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Evidence` ADD CONSTRAINT `Evidence_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `EvidenceChunk` ADD CONSTRAINT `EvidenceChunk_evidence_id_fkey` FOREIGN KEY (`evidence_id`) REFERENCES `Evidence`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `EvidenceLink` ADD CONSTRAINT `EvidenceLink_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `EvidenceLink` ADD CONSTRAINT `EvidenceLink_from_id_fkey` FOREIGN KEY (`from_id`) REFERENCES `Evidence`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `EvidenceLink` ADD CONSTRAINT `EvidenceLink_to_id_fkey` FOREIGN KEY (`to_id`) REFERENCES `Evidence`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `ChangeEvent` ADD CONSTRAINT `ChangeEvent_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `EventSignal` ADD CONSTRAINT `EventSignal_change_event_id_fkey` FOREIGN KEY (`change_event_id`) REFERENCES `ChangeEvent`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `EventSignal` ADD CONSTRAINT `EventSignal_evidence_id_fkey` FOREIGN KEY (`evidence_id`) REFERENCES `Evidence`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `ChangeOrder` ADD CONSTRAINT `ChangeOrder_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `ChangeOrder` ADD CONSTRAINT `ChangeOrder_change_event_id_fkey` FOREIGN KEY (`change_event_id`) REFERENCES `ChangeEvent`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `ChangeOrderLineItem` ADD CONSTRAINT `ChangeOrderLineItem_change_order_id_fkey` FOREIGN KEY (`change_order_id`) REFERENCES `ChangeOrder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Invitation` ADD CONSTRAINT `Invitation_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `COTemplate` ADD CONSTRAINT `COTemplate_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `COApproval` ADD CONSTRAINT `COApproval_change_order_id_fkey` FOREIGN KEY (`change_order_id`) REFERENCES `ChangeOrder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Webhook` ADD CONSTRAINT `Webhook_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `ScheduledExport` ADD CONSTRAINT `ScheduledExport_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_change_event_id_fkey` FOREIGN KEY (`change_event_id`) REFERENCES `ChangeEvent`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_change_order_id_fkey` FOREIGN KEY (`change_order_id`) REFERENCES `ChangeOrder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `ExportJob` ADD CONSTRAINT `ExportJob_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `ExportJob` ADD CONSTRAINT `ExportJob_change_order_id_fkey` FOREIGN KEY (`change_order_id`) REFERENCES `ChangeOrder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `SentLog` ADD CONSTRAINT `SentLog_change_order_id_fkey` FOREIGN KEY (`change_order_id`) REFERENCES `ChangeOrder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `FriendRequest` ADD CONSTRAINT `FriendRequest_from_user_id_fkey` FOREIGN KEY (`from_user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `FriendRequest` ADD CONSTRAINT `FriendRequest_to_user_id_fkey` FOREIGN KEY (`to_user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `ChatMessage` ADD CONSTRAINT `ChatMessage_sender_id_fkey` FOREIGN KEY (`sender_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `ChatMessage` ADD CONSTRAINT `ChatMessage_receiver_id_fkey` FOREIGN KEY (`receiver_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
