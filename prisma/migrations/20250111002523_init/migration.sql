/*
  Warnings:

  - You are about to drop the `ExternalServiceGroupRole` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `ExternalServiceGroupRole` DROP FOREIGN KEY `ExternalServiceGroupRole_groupId_fkey`;

-- DropForeignKey
ALTER TABLE `ExternalServiceGroupRole` DROP FOREIGN KEY `ExternalServiceGroupRole_namespaceId_fkey`;

-- DropTable
DROP TABLE `ExternalServiceGroupRole`;

-- CreateTable
CREATE TABLE `ExternalServiceGroupRoleMapping` (
    `id` VARCHAR(191) NOT NULL,
    `namespaceId` VARCHAR(191) NOT NULL,
    `accountId` VARCHAR(191) NOT NULL,
    `groupId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `conditions` VARCHAR(191) NOT NULL,
    `actions` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ExternalServiceGroupRoleMapping` ADD CONSTRAINT `ExternalServiceGroupRoleMapping_namespaceId_fkey` FOREIGN KEY (`namespaceId`) REFERENCES `Namespace`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExternalServiceGroupRoleMapping` ADD CONSTRAINT `ExternalServiceGroupRoleMapping_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `ExternalServiceAccount`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExternalServiceGroupRoleMapping` ADD CONSTRAINT `ExternalServiceGroupRoleMapping_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `ExternalServiceGroup`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
