/*
  Warnings:

  - You are about to drop the column `label` on the `TreeMaster` table. All the data in the column will be lost.
  - Added the required column `created_at` to the `TreeMaster` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TreeMaster" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_fk" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL,
    CONSTRAINT "TreeMaster_user_fk_fkey" FOREIGN KEY ("user_fk") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TreeMaster" ("id", "user_fk") SELECT "id", "user_fk" FROM "TreeMaster";
DROP TABLE "TreeMaster";
ALTER TABLE "new_TreeMaster" RENAME TO "TreeMaster";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
