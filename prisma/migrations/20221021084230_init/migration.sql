-- CreateTable
CREATE TABLE "TreeModel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "label" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "TreeModel_label_key" ON "TreeModel"("label");
