DROP TABLE photo;
DROP TABLE album;

CREATE TABLE album (
id SERIAL PRIMARY KEY,
name VARCHAR(50),
s3_name VARCHAR(100),
cover_photo_id VARCHAR(100)
);

SELECT * FROM album;

CREATE TABLE photo (
id SERIAL PRIMARY KEY,
album_id INTEGER REFERENCES album ON DELETE CASCADE,
name VARCHAR(250),
s3_name VARCHAR(100),
caption VARCHAR(100)
);

SELECT * FROM photo;

SELECT album.id, album.name, album.s3_name AS album_s3_name, album.cover_photo_id, photo.s3_name AS photo_s3_name
FROM album
LEFT OUTER JOIN photo ON photo.album_id = album.id
;

INSERT INTO album (name, s3_name) VALUES ('England', 'asdsdfdsf');

