/*
  Warnings:

  - You are about to drop the `_ExternalProviderToRole` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name,groupId,externalProviderId,tagId]` on the table `Role` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `authorization` to the `ExternalProvider` table without a default value. This is not possible if the table is not empty.
  - Added the required column `provider` to the `ExternalProvider` table without a default value. This is not possible if the table is not empty.
  - Added the required column `providerId` to the `ExternalProvider` table without a default value. This is not possible if the table is not empty.
  - Added the required column `externalProviderId` to the `Role` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tagId` to the `Role` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `_ExternalProviderToRole` DROP FOREIGN KEY `_ExternalProviderToRole_A_fkey`;

-- DropForeignKey
ALTER TABLE `_ExternalProviderToRole` DROP FOREIGN KEY `_ExternalProviderToRole_B_fkey`;

-- DropIndex
DROP INDEX `Role_name_groupId_key` ON `Role`;

-- AlterTable
ALTER TABLE `ExternalProvider` ADD COLUMN `authorization` VARCHAR(191) NOT NULL,
    ADD COLUMN `provider` ENUM('DISCORD', 'VRCHAT', 'GITHUB') NOT NULL,
    ADD COLUMN `providerId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Role` ADD COLUMN `externalProviderId` INTEGER NOT NULL,
    ADD COLUMN `tagId` INTEGER NOT NULL;

-- DropTable
DROP TABLE `_ExternalProviderToRole`;

-- CreateIndex
CREATE UNIQUE INDEX `Role_name_groupId_externalProviderId_tagId_key` ON `Role`(`name`, `groupId`, `externalProviderId`, `tagId`);

-- AddForeignKey
ALTER TABLE `Role` ADD CONSTRAINT `Role_externalProviderId_fkey` FOREIGN KEY (`externalProviderId`) REFERENCES `ExternalProvider`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Role` ADD CONSTRAINT `Role_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `Tag`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
