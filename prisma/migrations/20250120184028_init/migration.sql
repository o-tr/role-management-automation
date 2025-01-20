/*
  Warnings:

  - A unique constraint covering the columns `[service,namespaceId]` on the table `ExternalServiceAccount` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `ExternalServiceAccount_name_service_namespaceId_key` ON `ExternalServiceAccount`;

-- CreateIndex
CREATE UNIQUE INDEX `ExternalServiceAccount_service_namespaceId_key` ON `ExternalServiceAccount`(`service`, `namespaceId`);
