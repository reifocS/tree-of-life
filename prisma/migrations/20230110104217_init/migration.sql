/*
  Warnings:

  - You are about to drop the column `branch_id` on the `Leaf` table. All the data in the column will be lost.
  - You are about to drop the column `tree_id` on the `Branch` table. All the data in the column will be lost.
  - Added the required column `branch_fk` to the `Leaf` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tree_fk` to the `Branch` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "TreeVersion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tree_fk" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "version" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "TreeMaster" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_fk" INTEGER NOT NULL,
    "label" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "userType_fk" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "UserType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Leaf" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "branch_fk" INTEGER NOT NULL,
    "icon" TEXT NOT NULL,
    "fontColor" TEXT NOT NULL
);
INSERT INTO "new_Leaf" ("fontColor", "icon", "id") SELECT "fontColor", "icon", "id" FROM "Leaf";
DROP TABLE "Leaf";
ALTER TABLE "new_Leaf" RENAME TO "Leaf";
CREATE TABLE "new_Branch" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tree_fk" INTEGER NOT NULL,
    "actualBoundingBoxAscent" INTEGER NOT NULL,
    "font" TEXT NOT NULL
);
INSERT INTO "new_Branch" ("actualBoundingBoxAscent", "font", "id") SELECT "actualBoundingBoxAscent", "font", "id" FROM "Branch";
DROP TABLE "Branch";
ALTER TABLE "new_Branch" RENAME TO "Branch";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
