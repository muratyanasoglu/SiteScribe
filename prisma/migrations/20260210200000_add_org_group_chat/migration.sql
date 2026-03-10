-- CreateTable
CREATE TABLE `OrgChatRoom` (
    `id` VARCHAR(191) NOT NULL,
    `organization_id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `OrgChatRoom_organization_id_key`(`organization_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrgChatMessage` (
    `id` VARCHAR(191) NOT NULL,
    `room_id` VARCHAR(191) NOT NULL,
    `sender_id` VARCHAR(191) NOT NULL,
    `body` TEXT NOT NULL,
    `attachment_url` VARCHAR(191) NULL,
    `attachment_mime_type` VARCHAR(191) NULL,
    `attachment_file_name` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `OrgChatMessage_room_id_idx`(`room_id`),
    INDEX `OrgChatMessage_room_id_createdAt_idx`(`room_id`, `createdAt`),
    INDEX `OrgChatMessage_sender_id_idx`(`sender_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OrgChatRoom` ADD CONSTRAINT `OrgChatRoom_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrgChatMessage` ADD CONSTRAINT `OrgChatMessage_room_id_fkey` FOREIGN KEY (`room_id`) REFERENCES `OrgChatRoom`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrgChatMessage` ADD CONSTRAINT `OrgChatMessage_sender_id_fkey` FOREIGN KEY (`sender_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: create OrgChatRoom for existing organizations
INSERT INTO `OrgChatRoom` (`id`, `organization_id`, `createdAt`, `updatedAt`)
SELECT LOWER(REPLACE(UUID(), '-', '')), o.`id`, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)
FROM `Organization` o
LEFT JOIN `OrgChatRoom` r ON r.`organization_id` = o.`id`
WHERE r.`id` IS NULL;
