-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TreeMaster" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_fk" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TreeMaster_user_fk_fkey" FOREIGN KEY ("user_fk") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TreeMaster" ("created_at", "id", "user_fk") SELECT "created_at", "id", "user_fk" FROM "TreeMaster";
DROP TABLE "TreeMaster";
ALTER TABLE "new_TreeMaster" RENAME TO "TreeMaster";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
