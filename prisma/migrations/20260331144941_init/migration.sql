/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - The primary key for the `Request` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `clientEmail` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `subject` on the `Request` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `Request` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - Added the required column `email` to the `Request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `message` to the `Request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Request` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User_email_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "User";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Request" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Request" ("createdAt", "id") SELECT "createdAt", "id" FROM "Request";
DROP TABLE "Request";
ALTER TABLE "new_Request" RENAME TO "Request";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
