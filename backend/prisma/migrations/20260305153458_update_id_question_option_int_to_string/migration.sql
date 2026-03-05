/*
  Warnings:

  - The primary key for the `options` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `questions` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE `attempt_answers` DROP FOREIGN KEY `attempt_answers_optionID_fkey`;

-- DropForeignKey
ALTER TABLE `attempt_answers` DROP FOREIGN KEY `attempt_answers_questionID_fkey`;

-- DropForeignKey
ALTER TABLE `options` DROP FOREIGN KEY `options_questionID_fkey`;

-- DropIndex
DROP INDEX `attempt_answers_optionID_fkey` ON `attempt_answers`;

-- DropIndex
DROP INDEX `attempt_answers_questionID_fkey` ON `attempt_answers`;

-- DropIndex
DROP INDEX `options_questionID_fkey` ON `options`;

-- AlterTable
ALTER TABLE `attempt_answers` MODIFY `questionID` VARCHAR(191) NOT NULL,
    MODIFY `optionID` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `options` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `questionID` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `questions` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AddForeignKey
ALTER TABLE `options` ADD CONSTRAINT `options_questionID_fkey` FOREIGN KEY (`questionID`) REFERENCES `questions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attempt_answers` ADD CONSTRAINT `attempt_answers_questionID_fkey` FOREIGN KEY (`questionID`) REFERENCES `questions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attempt_answers` ADD CONSTRAINT `attempt_answers_optionID_fkey` FOREIGN KEY (`optionID`) REFERENCES `options`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
