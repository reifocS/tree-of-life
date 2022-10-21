/*
  Warnings:

  - Added the required column `treeId` to the `Branch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `branchId` to the `Leaf` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Branch" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "label" TEXT NOT NULL,
    "treeId" INTEGER NOT NULL,
    CONSTRAINT "Branch_treeId_fkey" FOREIGN KEY ("treeId") REFERENCES "Tree" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Branch" ("id", "label") SELECT "id", "label" FROM "Branch";
DROP TABLE "Branch";
ALTER TABLE "new_Branch" RENAME TO "Branch";
CREATE UNIQUE INDEX "Branch_label_key" ON "Branch"("label");
CREATE UNIQUE INDEX "Branch_treeId_key" ON "Branch"("treeId");
CREATE TABLE "new_Leaf" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "label" TEXT NOT NULL,
    "branchId" INTEGER NOT NULL,
    CONSTRAINT "Leaf_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Leaf" ("id", "label") SELECT "id", "label" FROM "Leaf";
DROP TABLE "Leaf";
ALTER TABLE "new_Leaf" RENAME TO "Leaf";
CREATE UNIQUE INDEX "Leaf_label_key" ON "Leaf"("label");
CREATE UNIQUE INDEX "Leaf_branchId_key" ON "Leaf"("branchId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
