create table Logs (
ID SERIAL PRIMARY KEY,
Type varchar(5) NOT NULL,
Message varchar(256) NOT NULL
);