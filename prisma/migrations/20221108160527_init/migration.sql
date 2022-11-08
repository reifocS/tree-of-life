-- CreateTable
CREATE TABLE "Consultation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "patientID" INTEGER NOT NULL,
    "soignantID" INTEGER NOT NULL,
    CONSTRAINT "Consultation_patientID_fkey" FOREIGN KEY ("patientID") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Consultation_soignantID_fkey" FOREIGN KEY ("soignantID") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Consultation_patientID_key" ON "Consultation"("patientID");

-- CreateIndex
CREATE UNIQUE INDEX "Consultation_soignantID_key" ON "Consultation"("soignantID");
