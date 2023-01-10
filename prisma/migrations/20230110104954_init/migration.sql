/*
  Warnings:

  - Added the required column `elementInfo_fk` to the `Leaf` table without a default value. This is not possible if the table is not empty.
  - Added the required column `elementInfo_fk` to the `Branch` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TreeMaster" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_fk" INTEGER NOT NULL,
    "label" DATETIME NOT NULL,
    CONSTRAINT "TreeMaster_user_fk_fkey" FOREIGN KEY ("user_fk") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TreeMaster" ("id", "label", "user_fk") SELECT "id", "label", "user_fk" FROM "TreeMaster";
DROP TABLE "TreeMaster";
ALTER TABLE "new_TreeMaster" RENAME TO "TreeMaster";
CREATE TABLE "new_TreeVersion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tree_fk" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    CONSTRAINT "TreeVersion_tree_fk_fkey" FOREIGN KEY ("tree_fk") REFERENCES "TreeMaster" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TreeVersion" ("id", "label", "tree_fk", "version") SELECT "id", "label", "tree_fk", "version" FROM "TreeVersion";
DROP TABLE "TreeVersion";
ALTER TABLE "new_TreeVersion" RENAME TO "TreeVersion";
CREATE TABLE "new_Leaf" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "branch_fk" INTEGER NOT NULL,
    "icon" TEXT NOT NULL,
    "fontColor" TEXT NOT NULL,
    "elementInfo_fk" INTEGER NOT NULL,
    CONSTRAINT "Leaf_elementInfo_fk_fkey" FOREIGN KEY ("elementInfo_fk") REFERENCES "ElementInfo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Leaf_branch_fk_fkey" FOREIGN KEY ("branch_fk") REFERENCES "Branch" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Leaf" ("branch_fk", "fontColor", "icon", "id") SELECT "branch_fk", "fontColor", "icon", "id" FROM "Leaf";
DROP TABLE "Leaf";
ALTER TABLE "new_Leaf" RENAME TO "Leaf";
CREATE TABLE "new_Branch" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tree_fk" INTEGER NOT NULL,
    "actualBoundingBoxAscent" INTEGER NOT NULL,
    "font" TEXT NOT NULL,
    "elementInfo_fk" INTEGER NOT NULL,
    CONSTRAINT "Branch_elementInfo_fk_fkey" FOREIGN KEY ("elementInfo_fk") REFERENCES "ElementInfo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Branch_tree_fk_fkey" FOREIGN KEY ("tree_fk") REFERENCES "TreeVersion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Branch" ("actualBoundingBoxAscent", "font", "id", "tree_fk") SELECT "actualBoundingBoxAscent", "font", "id", "tree_fk" FROM "Branch";
DROP TABLE "Branch";
ALTER TABLE "new_Branch" RENAME TO "Branch";
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "userType_fk" INTEGER NOT NULL,
    CONSTRAINT "User_userType_fk_fkey" FOREIGN KEY ("userType_fk") REFERENCES "UserType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_User" ("id", "name", "userType_fk") SELECT "id", "name", "userType_fk" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
