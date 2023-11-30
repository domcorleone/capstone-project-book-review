-- category table --
CREATE TABLE category(
	id SERIAL PRIMARY KEY,
	name VARCHAR(100) NOT NULL UNIQUE
);
-- insert category table --
INSERT INTO category(name)
values('Fantasy'),
('Science Fiction'),('Horror'),('Romance'),('Mystery'),
('Historical Fiction'),('Literary Fiction'),('Adventure'),
('Magic Realism'),('Young Adult'),('Dyostopia'),('Graphic Novel'),
('Memoir'),('Short Story'),('Biography'),('Contemporary'),
('Fairy Tale'),('Romance Suspense'),('History'),('LGBT'),
('Western'),('Classics'),('Thriller'),('Crime')

-- table country --
CREATE TABLE country(
	id SERIAL PRIMARY KEY,
	country_code CHAR(2) UNIQUE,
	country_name TEXT
);

-- table author --
CREATE TABLE author(
	id SERIAL primary key,
	first_name VARCHAR(100) NOT NULL,
	last_name VARCHAR(100) NOT NULL,
	full_name VARCHAR(200),
	photo TEXT,
	date_of_birth date,
	country_id INTEGER REFERENCES country(id)
);

-- add new field to author --
ALTER TABLE author
add column bibliography TEXT

-- insert author table (see how to enable database to accept UTF-08 characters)--
-- to insert string with sigle quote like Eder's wife, we should use double sigle quote. 
-- e.g: Eder''s wife or $$Eder's wife$$
-- read section "4.1.2.4. Dollar-Quoted String Constants #" https://www.postgresql.org/docs/current/sql-syntax-lexical.html
-- or https://www.commandprompt.com/education/how-to-use-escape-single-quotes-in-postgresql/ [read this]
INSERT INTO author(first_name, 
				   last_name, 
				   full_name, 
				   photo, 
				   date_of_birth, 
				   country_id,
				  biography)
				  values('Stephen', 'King', 'Stephen King',
						 '../images/authors/stephen-king.png',
						 '1947-09-21',
						 235, 
						 'Stephen Edwin King (born September 21, 1947) is an American author of horror, supernatural fiction, suspense, crime, science-fiction, and fantasy novels. Called the <<King of Horror>>,[2] his books have sold more than 350 million copies as of 2006,[3] and many have been adapted into films, television series, miniseries, and comic books.[4] He has also written approximately 200 short stories, most of which have been published in book collections.[5] His debut, Carrie, was published in 1974, and was followed by Salems Lot, The Shining, The Stand and The Dead Zone. Different Seasons, a collection of four novellas, was his first major departure from the horror genre. The novellas provided the basis for the films Stand by Me and The Shawshank Redemption. King has published under the pseudonym Richard Bachman and has cowritten works with other authors, notably his friend Peter Straub and sons Joe and Owen King.'),
						 ('Dan', 'Brown', 'Dan Brown',
						 '../images/authors/dan-brown.jpg',
						 '1964-06-22',
						 235, 
						 'Daniel Gerhard Brown (born June 22, 1964) is an American author best known for his thriller novels, including the Robert Langdon novels Angels & Demons (2000), The Da Vinci Code (2003), The Lost Symbol (2009), Inferno (2013), and Origin (2017). His novels are treasure hunts that usually take place over a period of 24 hours.[3] They feature recurring themes of cryptography, art, and conspiracy theories. His books have been translated into 57 languages and, as of 2012, have sold over 200 million copies. Three of them, Angels & Demons, The Da Vinci Code, and Inferno, have been adapted into films, while one of them, The Lost Symbol, was adapted into a television show.'),
                         ('Edgar Alan', 'Poe', 'Edga Allan Poe',
						 '../images/authors/edgar-alan-poe.jpg',
						 '1809-01-19',
						 235, 
						 'Edgar Allan Poe (né Edgar Poe; January 19, 1809 – October 7, 1849) was an American writer, poet, author, editor, and literary critic who is best known for his poetry and short stories, particularly his tales of mystery and the macabre. He is widely regarded as a central figure of Romanticism and Gothic fiction in the United States, and of American literature.[1] Poe was one of the country's earliest practitioners of the short story, and is considered the inventor of the detective fiction genre, as well as a significant contributor to the emerging genre of science fiction.[2] He is the first well-known American writer to earn a living through writing alone, resulting in a financially difficult life and career.[3]Poe was born in Boston, the second child of actors David and Elizabeth Eliza Poe.[4] His father abandoned the family in 1810, and when his mother died the following year, Poe was taken in by John and Frances Allan of Richmond, Virginia. They never formally adopted him, but he was with them well into young adulthood. He attended the University of Virginia but left after a year due to lack of money. He quarreled with John Allan over the funds for his education, and his gambling debts. In 1827, having enlisted in the United States Army under an assumed name, he published his first collection, Tamerlane and Other Poems, credited only to <<a Bostonian>>. Poe and Allan reached a temporary rapprochement after the death of Allan's wife in 1829. Poe later failed as an officer cadet at West Point, declared a firm wish to be a poet and writer, and parted ways with Allan.')

-- CREATE table book --

CREATE TABLE book(
	id SERIAL PRIMARY KEY,
	title TEXT,
	isbn TEXT,
	lang char(2),
	author_id INT REFERENCES author(id),
	page_number INT,
	publish_date date,
	book_cover_url TEXT,
	categ_id INT REFERENCES category(id),
	description TEXT	
);
-- rename categ_id to category_id, table book
ALTER TABLE book
RENAME COLUMN categ_id to category_id

-- create table review --

CREATE TABLE review(
	id SERIAL PRIMARY KEY,
	book_id INT REFERENCES book(id),
	rating FLOAT,
	review_owner VARCHAR(100) NOT NULL,
	review_comments TEXT NOT NULL,
	review_date date NOT NULL,
	review_update date
);

-- join table to receive all necessary data -- 
SELECT book.isbn, 
book.title, 
book.page_number, 
book.publish_date, 
category.name as category,
author.full_name as book_author,
book.book_cover_url, 
book.description
FROM book 
INNER JOIN author 
on author.id = book.author_id INNER JOIN category on category.id = book.category_id

-- review necessary info --

SELECT review.id, book.isbn, book.book_cover_url, author.full_name, review.rating, review.review_owner, review.review_comments 
FROM review JOIN book on review.book_id = book.id JOIN author on author.id = book.author_id

-- Update review --

UPDATE review
SET book_id = $1, review_date = $2, review_owner = $3, 
review_comments = $4, review_update = $5 WHERE id = $6

-- Update column (change name and data type ) 

ALTER TABLE review RENAME review_update to review_dateupdate;
ALTER TABLE review ALTER review_dateupdate SET DATA TYPE TIMESTAMP;

-- Insert review -- 

INSERT INTO review(book_id, rating, review_owner, review_comments, review_date)
VALUES(6, 1.5, '@ERICA', 'test', '2012-01-20'),
(3, 4.5, '@EVANDRO', 'test2', '2022-11-15');

-- Add two fields to count number of likes and dislikes ---

ALTER table review
ADD COLUMN likeCount INT,
ADD COLUMN disLikeCount INT

-- Change photo datatype to BYTEA similar to BLOB (MYSQL, SQL SERVER) to store large texts --
-- this is bacause author and book's photos are coming a remote server (using axios and API to do retrive it ) --
-- solution link 1: https://www.postgresql.org/message-id/F66DF446-94A9-4FA4-B62A-20A7F10D648F@mac.com
-- solution link 2: https://www.postgresql.org/message-id/20051229211409.GA9834@winnie.fuhr.org
ALTER TABLE author
ALTER COLUMN photo TYPE BYTEA USING photo::BYTEA
 


				
