-- AlterTable: allow NULL password_hash for OAuth-only users (Google, GitHub)
ALTER TABLE `User` MODIFY COLUMN `password_hash` VARCHAR(191) NULL;
