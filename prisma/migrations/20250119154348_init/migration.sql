/*
  Warnings:

  - You are about to drop the column `accountId` on the `ExternalServiceGroupRoleMapping` table. All the data in the column will be lost.
  - You are about to drop the column `groupId` on the `ExternalServiceGroupRoleMapping` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `ExternalServiceGroupRoleMapping` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `ExternalServiceGroupRoleMapping` DROP FOREIGN KEY `ExternalServiceGroupRoleMapping_accountId_fkey`;

-- DropForeignKey
ALTER TABLE `ExternalServiceGroupRoleMapping` DROP FOREIGN KEY `ExternalServiceGroupRoleMapping_groupId_fkey`;

-- DropIndex
DROP INDEX `ExternalServiceGroupRoleMapping_accountId_fkey` ON `ExternalServiceGroupRoleMapping`;

-- DropIndex
DROP INDEX `ExternalServiceGroupRoleMapping_groupId_fkey` ON `ExternalServiceGroupRoleMapping`;

-- AlterTable
ALTER TABLE `ExternalServiceGroupRoleMapping` DROP COLUMN `accountId`,
    DROP COLUMN `groupId`,
    DROP COLUMN `name`;
