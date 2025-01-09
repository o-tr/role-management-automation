/*
  Warnings:

  - The primary key for the `ExternalAccount` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ExternalProvider` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Group` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Member` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Role` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Tag` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE `ExternalAccount` DROP FOREIGN KEY `ExternalAccount_externalProviderId_fkey`;

-- DropForeignKey
ALTER TABLE `ExternalAccount` DROP FOREIGN KEY `ExternalAccount_memberId_fkey`;

-- DropForeignKey
ALTER TABLE `ExternalProvider` DROP FOREIGN KEY `ExternalProvider_groupId_fkey`;

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
ALTER TABLE `_MemberToTag` DROP FOREIGN KEY `_MemberToTag_A_fkey`;

-- DropForeignKey
ALTER TABLE `_MemberToTag` DROP FOREIGN KEY `_MemberToTag_B_fkey`;

-- DropIndex
DROP INDEX `ExternalAccount_externalProviderId_fkey` ON `ExternalAccount`;

-- DropIndex
DROP INDEX `ExternalProvider_groupId_fkey` ON `ExternalProvider`;

-- DropIndex
DROP INDEX `Member_groupId_fkey` ON `Member`;

-- DropIndex
DROP INDEX `Role_externalProviderId_fkey` ON `Role`;

-- DropIndex
DROP INDEX `Role_groupId_fkey` ON `Role`;

-- DropIndex
DROP INDEX `Role_tagId_fkey` ON `Role`;

-- DropIndex
DROP INDEX `Tag_groupId_fkey` ON `Tag`;

-- AlterTable
ALTER TABLE `ExternalAccount` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `memberId` VARCHAR(191) NOT NULL,
    MODIFY `externalProviderId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `ExternalProvider` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `groupId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Group` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Member` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `groupId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Role` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `groupId` VARCHAR(191) NOT NULL,
    MODIFY `externalProviderId` VARCHAR(191) NOT NULL,
    MODIFY `tagId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Tag` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `groupId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `_GroupToUser` MODIFY `A` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `_MemberToTag` MODIFY `A` VARCHAR(191) NOT NULL,
    MODIFY `B` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Member` ADD CONSTRAINT `Member_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `Group`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Role` ADD CONSTRAINT `Role_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `Group`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Role` ADD CONSTRAINT `Role_externalProviderId_fkey` FOREIGN KEY (`externalProviderId`) REFERENCES `ExternalProvider`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Role` ADD CONSTRAINT `Role_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `Tag`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tag` ADD CONSTRAINT `Tag_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `Group`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExternalProvider` ADD CONSTRAINT `ExternalProvider_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `Group`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExternalAccount` ADD CONSTRAINT `ExternalAccount_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `Member`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExternalAccount` ADD CONSTRAINT `ExternalAccount_externalProviderId_fkey` FOREIGN KEY (`externalProviderId`) REFERENCES `ExternalProvider`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_GroupToUser` ADD CONSTRAINT `_GroupToUser_A_fkey` FOREIGN KEY (`A`) REFERENCES `Group`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_MemberToTag` ADD CONSTRAINT `_MemberToTag_A_fkey` FOREIGN KEY (`A`) REFERENCES `Member`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_MemberToTag` ADD CONSTRAINT `_MemberToTag_B_fkey` FOREIGN KEY (`B`) REFERENCES `Tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
