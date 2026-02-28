-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `role` ENUM('STUDENT', 'TEACHER', 'ADMIN') NOT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `students` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `MSSV` VARCHAR(191) NOT NULL,
    `userID` INTEGER NOT NULL,

    UNIQUE INDEX `students_MSSV_key`(`MSSV`),
    UNIQUE INDEX `students_userID_key`(`userID`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `teachers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `MSGV` VARCHAR(191) NOT NULL,
    `faculty` VARCHAR(191) NOT NULL,
    `userID` INTEGER NOT NULL,

    UNIQUE INDEX `teachers_MSGV_key`(`MSGV`),
    UNIQUE INDEX `teachers_userID_key`(`userID`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `semesters` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `year` INTEGER NOT NULL,
    `semesterNo` INTEGER NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,

    UNIQUE INDEX `semesters_year_semesterNo_key`(`year`, `semesterNo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `courses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `credit` INTEGER NOT NULL,

    UNIQUE INDEX `courses_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sections` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `semesterID` INTEGER NOT NULL,
    `courseID` INTEGER NOT NULL,
    `teacherID` INTEGER NOT NULL,

    INDEX `sections_courseID_idx`(`courseID`),
    INDEX `sections_teacherID_idx`(`teacherID`),
    UNIQUE INDEX `sections_code_semesterID_courseID_key`(`code`, `semesterID`, `courseID`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Enrollment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `studentID` INTEGER NOT NULL,
    `sectionID` INTEGER NOT NULL,

    INDEX `Enrollment_studentID_idx`(`studentID`),
    INDEX `Enrollment_sectionID_idx`(`sectionID`),
    UNIQUE INDEX `Enrollment_studentID_sectionID_key`(`studentID`, `sectionID`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quizzes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `timeStart` DATETIME(3) NOT NULL,
    `timeEnd` DATETIME(3) NOT NULL,
    `timeLimit` INTEGER NOT NULL,
    `typeResult` ENUM('AVERAGE', 'BEST', 'LATEST') NOT NULL,
    `sectionID` INTEGER NOT NULL,

    INDEX `quizzes_sectionID_idx`(`sectionID`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `questions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` VARCHAR(191) NOT NULL,
    `type` ENUM('MULTIPLE_CHOICE', 'SINGLE_CHOICE') NOT NULL,
    `quizID` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `answers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` VARCHAR(191) NOT NULL,
    `isCorrect` BOOLEAN NOT NULL DEFAULT false,
    `questionID` INTEGER NOT NULL,

    INDEX `answers_questionID_idx`(`questionID`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quiz_attempts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `score` DOUBLE NOT NULL,
    `startTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `submitTime` DATETIME(3) NULL,
    `studentID` INTEGER NOT NULL,
    `quizID` INTEGER NOT NULL,

    INDEX `quiz_attempts_studentID_idx`(`studentID`),
    INDEX `quiz_attempts_quizID_idx`(`quizID`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `students` ADD CONSTRAINT `students_userID_fkey` FOREIGN KEY (`userID`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `teachers` ADD CONSTRAINT `teachers_userID_fkey` FOREIGN KEY (`userID`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sections` ADD CONSTRAINT `sections_semesterID_fkey` FOREIGN KEY (`semesterID`) REFERENCES `semesters`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sections` ADD CONSTRAINT `sections_courseID_fkey` FOREIGN KEY (`courseID`) REFERENCES `courses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sections` ADD CONSTRAINT `sections_teacherID_fkey` FOREIGN KEY (`teacherID`) REFERENCES `teachers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Enrollment` ADD CONSTRAINT `Enrollment_studentID_fkey` FOREIGN KEY (`studentID`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Enrollment` ADD CONSTRAINT `Enrollment_sectionID_fkey` FOREIGN KEY (`sectionID`) REFERENCES `sections`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quizzes` ADD CONSTRAINT `quizzes_sectionID_fkey` FOREIGN KEY (`sectionID`) REFERENCES `sections`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `questions` ADD CONSTRAINT `questions_quizID_fkey` FOREIGN KEY (`quizID`) REFERENCES `quizzes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `answers` ADD CONSTRAINT `answers_questionID_fkey` FOREIGN KEY (`questionID`) REFERENCES `questions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quiz_attempts` ADD CONSTRAINT `quiz_attempts_studentID_fkey` FOREIGN KEY (`studentID`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quiz_attempts` ADD CONSTRAINT `quiz_attempts_quizID_fkey` FOREIGN KEY (`quizID`) REFERENCES `quizzes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
