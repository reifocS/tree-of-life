-- CreateTable
CREATE TABLE "Branch" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tree_id" INTEGER NOT NULL,
    "actualBoundingBoxAscent" INTEGER NOT NULL,
    "font" TEXT NOT NULL
);
