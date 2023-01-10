/*
  Warnings:

  - You are about to drop the column `name` on the `UserType` table. All the data in the column will be lost.
  - Added the required column `label` to the `UserType` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "label" TEXT NOT NULL
);
INSERT INTO "new_UserType" ("id") SELECT "id" FROM "UserType";
DROP TABLE "UserType";
ALTER TABLE "new_UserType" RENAME TO "UserType";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
