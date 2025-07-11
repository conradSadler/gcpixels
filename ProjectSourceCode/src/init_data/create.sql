
CREATE TABLE users(username VARCHAR(50) Primary Key, password VARCHAR(60) NOT NUll);


CREATE Table artwork(artwork_id SERIAL PRIMARY KEY, artwork_name VARCHAR(50), properties JSON, thumbnail text);


CREATE TABLE users_to_artwork ( username VARCHAR(50) NOT NULL REFERENCES users (username), artwork INT NOT NULL REFERENCES artwork (artwork_id));
