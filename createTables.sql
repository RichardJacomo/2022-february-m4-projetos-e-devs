CREATE DATABASE entrega_s3_m4;

CREATE TYPE OS AS ENUM ('Windows', 'Linux', 'MacOS');

CREATE TABLE IF NOT EXISTS developer_infos (
	"id" SERIAL PRIMARY KEY,
    "developerSince" DATE NOT NULL,
    "preferredOS" OS NOT NULL
);

-- atualização 1:1
CREATE TABLE IF NOT EXISTS developers (
	"id" SERIAL PRIMARY KEY,
    "name" VARCHAR(50) NOT NULL,
    "email" VARCHAR(50) UNIQUE NOT NULL,
    "developerInfoId" INTEGER UNIQUE,
    FOREIGN KEY ("developerInfoId") REFERENCES developer_infos("id") ON DELETE CASCADE
)  

-- atualização 1:N
CREATE TABLE IF NOT EXISTS projects (
"id" SERIAL PRIMARY KEY,
"name" VARCHAR(50) NOT NULL,
"description" TEXT NOT NULL,
"estimatedTime" VARCHAR(20) NOT NULL,
"repository" VARCHAR(120) NOT NULL,
"startDate" DATE NOT NULL,
"endDate" DATE,
"developerId" INTEGER NOT NULL,
FOREIGN KEY ("developerId") REFERENCES developers("id")
);

CREATE TABLE IF NOT EXISTS technologies (
	"id" SERIAL PRIMARY KEY,
    "technologyName" VARCHAR(30) NOT NULL
);

 INSERT INTO
        technologies("technologyName")
    VALUES
    	('JavaScript'),
		('Python'),
		('React'),
		('Express.js'),
		('HTML'),
		('CSS'),
		('Django'),
		('PostgreSQL'),
		('MongoDB');

-- atualização N:N
CREATE TABLE IF NOT EXISTS projects_technologies (
	"id" SERIAL PRIMARY KEY,
	"projectId" INTEGER NOT NULL,
	FOREIGN KEY ("projectId") REFERENCES projects("id")
	ON DELETE CASCADE,
	"technologyId" INTEGER NOT NULL,
	FOREIGN KEY ("technologyId") REFERENCES technologies("id")
	ON DELETE RESTRICT,
    "addedIn" DATE NOT NULL
)





