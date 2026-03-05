/*
  Warnings:

  - Added the required column `teacherID` to the `quizzes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `quizzes` ADD COLUMN `teacherID` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `quizzes` ADD CONSTRAINT `quizzes_teacherID_fkey` FOREIGN KEY (`teacherID`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
