/*
  Warnings:

  - You are about to drop the `Branch` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Consultation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Role` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tree` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `branchId` on the `Leaf` table. All the data in the column will be lost.
  - You are about to drop the column `label` on the `Leaf` table. All the data in the column will be lost.
  - Added the required column `branch_id` to the `Leaf` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fontColor` to the `Leaf` table without a default value. This is not possible if the table is not empty.
  - Added the required column `icon` to the `Leaf` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Branch";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Consultation";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Role";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Tree";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "User";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "ElementInfo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "x" REAL NOT NULL,
    "y" REAL NOT NULL,
    "height" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "angle" REAL NOT NULL
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Leaf" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "branch_id" INTEGER NOT NULL,
    "icon" TEXT NOT NULL,
    "fontColor" TEXT NOT NULL
);
INSERT INTO "new_Leaf" ("id") SELECT "id" FROM "Leaf";
DROP TABLE "Leaf";
ALTER TABLE "new_Leaf" RENAME TO "Leaf";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
