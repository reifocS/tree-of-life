-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Consultation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "patientID" INTEGER NOT NULL,
    "soignantID" INTEGER NOT NULL,
    CONSTRAINT "Consultation_patientID_fkey" FOREIGN KEY ("patientID") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Consultation_soignantID_fkey" FOREIGN KEY ("soignantID") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Consultation" ("date", "id", "patientID", "soignantID") SELECT "date", "id", "patientID", "soignantID" FROM "Consultation";
DROP TABLE "Consultation";
ALTER TABLE "new_Consultation" RENAME TO "Consultation";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
