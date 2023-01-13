-- CreateTable
CREATE TABLE "ElementInfo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "x" REAL NOT NULL,
    "y" REAL NOT NULL,
    "height" REAL NOT NULL,
    "label" TEXT NOT NULL,
    "width" REAL NOT NULL,
    "angle" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "Leaf" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "branch_fk" INTEGER NOT NULL,
    "icon" TEXT NOT NULL,
    "fontColor" TEXT NOT NULL,
    "elementInfo_fk" INTEGER NOT NULL,
    CONSTRAINT "Leaf_elementInfo_fk_fkey" FOREIGN KEY ("elementInfo_fk") REFERENCES "ElementInfo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Leaf_branch_fk_fkey" FOREIGN KEY ("branch_fk") REFERENCES "Branch" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Branch" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "treeVersion_fk" INTEGER NOT NULL,
    "actualBoundingBoxAscent" INTEGER NOT NULL,
    "font" TEXT NOT NULL,
    "elementInfo_fk" INTEGER NOT NULL,
    CONSTRAINT "Branch_elementInfo_fk_fkey" FOREIGN KEY ("elementInfo_fk") REFERENCES "ElementInfo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Branch_treeVersion_fk_fkey" FOREIGN KEY ("treeVersion_fk") REFERENCES "TreeVersion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TreeVersion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "treeMaster_fk" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TreeVersion_treeMaster_fk_fkey" FOREIGN KEY ("treeMaster_fk") REFERENCES "TreeMaster" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TreeMaster" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_fk" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TreeMaster_user_fk_fkey" FOREIGN KEY ("user_fk") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "userType_fk" INTEGER NOT NULL,
    CONSTRAINT "User_userType_fk_fkey" FOREIGN KEY ("userType_fk") REFERENCES "UserType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "label" TEXT NOT NULL
);
