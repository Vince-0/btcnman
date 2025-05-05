-- CreateTable
CREATE TABLE "IPGeolocation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ip" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "regionName" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "lat" REAL NOT NULL,
    "lon" REAL NOT NULL,
    "timezone" TEXT NOT NULL,
    "isp" TEXT NOT NULL,
    "org" TEXT NOT NULL,
    "as" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "IPGeolocation_ip_key" ON "IPGeolocation"("ip");
