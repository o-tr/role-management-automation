/*
  Warnings:

  - You are about to drop the column `groupId` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `groupId` on the `Tag` table. All the data in the column will be lost.
  - You are about to drop the `ExternalAccount` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ExternalProvider` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Group` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Role` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_GroupToUser` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[email,namespaceId]` on the table `Member` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,namespaceId]` on the table `Tag` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `namespaceId` to the `Member` table without a default value. This is not possible if the table is not empty.
  - Added the required column `namespaceId` to the `Tag` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `ExternalAccount` DROP FOREIGN KEY `ExternalAccount_externalProviderId_fkey`;

-- DropForeignKey
ALTER TABLE `ExternalAccount` DROP FOREIGN KEY `ExternalAccount_memberId_fkey`;

-- DropForeignKey
ALTER TABLE `ExternalProvider` DROP FOREIGN KEY `ExternalProvider_groupId_fkey`;

-- DropForeignKey
ALTER TABLE `Group` DROP FOREIGN KEY `Group_ownerId_fkey`;

-- DropForeignKey
ALTER TABLE `Member` DROP FOREIGN KEY `Member_groupId_fkey`;

-- DropForeignKey
ALTER TABLE `Role` DROP FOREIGN KEY `Role_externalProviderId_fkey`;

-- DropForeignKey
ALTER TABLE `Role` DROP FOREIGN KEY `Role_groupId_fkey`;

-- DropForeignKey
ALTER TABLE `Role` DROP FOREIGN KEY `Role_tagId_fkey`;

-- DropForeignKey
ALTER TABLE `Tag` DROP FOREIGN KEY `Tag_groupId_fkey`;

-- DropForeignKey
ALTER TABLE `_GroupToUser` DROP FOREIGN KEY `_GroupToUser_A_fkey`;

-- DropForeignKey
ALTER TABLE `_GroupToUser` DROP FOREIGN KEY `_GroupToUser_B_fkey`;

-- DropIndex
DROP INDEX `Member_email_groupId_key` ON `Member`;

-- DropIndex
DROP INDEX `Member_groupId_fkey` ON `Member`;

-- DropIndex
DROP INDEX `Tag_groupId_fkey` ON `Tag`;

-- DropIndex
DROP INDEX `Tag_name_groupId_key` ON `Tag`;

-- AlterTable
ALTER TABLE `Member` DROP COLUMN `groupId`,
    ADD COLUMN `namespaceId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Tag` DROP COLUMN `groupId`,
    ADD COLUMN `namespaceId` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `ExternalAccount`;

-- DropTable
DROP TABLE `ExternalProvider`;

-- DropTable
DROP TABLE `Group`;

-- DropTable
DROP TABLE `Role`;

-- DropTable
DROP TABLE `_GroupToUser`;

-- CreateTable
CREATE TABLE `Namespace` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ExternalServiceAccount` (
    `id` VARCHAR(191) NOT NULL,
    `namespaceId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `service` ENUM('DISCORD', 'VRCHAT', 'GITHUB') NOT NULL,
    `credential` VARCHAR(191) NOT NULL,
    `icon` VARCHAR(191) NULL,

    UNIQUE INDEX `ExternalServiceAccount_name_namespaceId_key`(`name`, `namespaceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ExternalServiceGroup` (
    `id` VARCHAR(191) NOT NULL,
    `namespaceId` VARCHAR(191) NOT NULL,
    `accountId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `groupId` VARCHAR(191) NOT NULL,
    `icon` VARCHAR(191) NULL,

    UNIQUE INDEX `ExternalServiceGroup_name_namespaceId_key`(`name`, `namespaceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ExternalServiceGroupRole` (
    `id` VARCHAR(191) NOT NULL,
    `namespaceId` VARCHAR(191) NOT NULL,
    `groupId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `roleId` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NULL,

    UNIQUE INDEX `ExternalServiceGroupRole_groupId_roleId_key`(`groupId`, `roleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_NamespaceToUser` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_NamespaceToUser_AB_unique`(`A`, `B`),
    INDEX `_NamespaceToUser_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Member_email_namespaceId_key` ON `Member`(`email`, `namespaceId`);

-- CreateIndex
CREATE UNIQUE INDEX `Tag_name_namespaceId_key` ON `Tag`(`name`, `namespaceId`);

-- AddForeignKey
ALTER TABLE `Namespace` ADD CONSTRAINT `Namespace_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Member` ADD CONSTRAINT `Member_namespaceId_fkey` FOREIGN KEY (`namespaceId`) REFERENCES `Namespace`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tag` ADD CONSTRAINT `Tag_namespaceId_fkey` FOREIGN KEY (`namespaceId`) REFERENCES `Namespace`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExternalServiceAccount` ADD CONSTRAINT `ExternalServiceAccount_namespaceId_fkey` FOREIGN KEY (`namespaceId`) REFERENCES `Namespace`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExternalServiceGroup` ADD CONSTRAINT `ExternalServiceGroup_namespaceId_fkey` FOREIGN KEY (`namespaceId`) REFERENCES `Namespace`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExternalServiceGroup` ADD CONSTRAINT `ExternalServiceGroup_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `ExternalServiceAccount`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExternalServiceGroupRole` ADD CONSTRAINT `ExternalServiceGroupRole_namespaceId_fkey` FOREIGN KEY (`namespaceId`) REFERENCES `Namespace`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExternalServiceGroupRole` ADD CONSTRAINT `ExternalServiceGroupRole_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `ExternalServiceGroup`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_NamespaceToUser` ADD CONSTRAINT `_NamespaceToUser_A_fkey` FOREIGN KEY (`A`) REFERENCES `Namespace`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_NamespaceToUser` ADD CONSTRAINT `_NamespaceToUser_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
