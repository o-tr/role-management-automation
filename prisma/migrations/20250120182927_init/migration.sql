/*
  Warnings:

  - A unique constraint covering the columns `[name,service,namespaceId]` on the table `ExternalServiceAccount` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `ExternalServiceAccount_name_namespaceId_key` ON `ExternalServiceAccount`;

-- CreateIndex
CREATE UNIQUE INDEX `ExternalServiceAccount_name_service_namespaceId_key` ON `ExternalServiceAccount`(`name`, `service`, `namespaceId`);
