/*
  Warnings:

  - You are about to drop the `TreeModel` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "TreeModel_label_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "TreeModel";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Tree" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "label" TEXT NOT NULL
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Branch" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "label" TEXT NOT NULL,
    CONSTRAINT "Branch_id_fkey" FOREIGN KEY ("id") REFERENCES "Tree" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Branch" ("id", "label") SELECT "id", "label" FROM "Branch";
DROP TABLE "Branch";
ALTER TABLE "new_Branch" RENAME TO "Branch";
CREATE UNIQUE INDEX "Branch_label_key" ON "Branch"("label");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "Tree_label_key" ON "Tree"("label");
