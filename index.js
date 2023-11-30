import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import pg from "pg";
import fs from "fs";

// import Swal from "sweetalert2";

const app = express();
const port = 3000;
const openLibraryURL = "https://covers.openlibrary.org/";
const db_param = {
  host: "localhost",
  user: "postgres",
  database: "book_review",
  password: "postgres2023",
  port: 5432,
};

let message = "";
let authors = [];
let countries = [];
let categories = [];
let reviews = [];
let books = [];

// https://en.wikipedia.org/wiki/List_of_ISO_639-2_codes
const languages = {
  PT: "Portguese",
  EN: "English",
  FR: "French",
  ES: "Spanish",
  DE: "Germany",
  RU: "Russia",
  CS: "Czech",
};

// open connection with book_review
function openCon(parameters) {
  const client = new pg.Client(parameters);
  try {
    client.connect();
    // console.log("Database connecion is sucessful");
  } catch (error) {
    console.error("Can't connect to database", error);
  }
  return client;
}
// close connection with database
function closeCon(client) {
  try {
    client.end();
    // console.log("connection was closed sucessfully!");
  } catch (error) {
    console.error("Can't close connection", error);
  }
}

// get fields from the webpage
app.use(bodyParser.urlencoded({ extended: true }));

// allow to get images, icones and style for .ejs page
app.use(express.static("public"));

// get all authors
async function listAuthors() {
  const db = openCon(db_param);
  let results = [];
  try {
    results = await db.query(
      "SELECT author.id, author.first_name, author.last_name, author.full_name, author.photo, author.date_of_birth, country.country_name, author.biography FROM author JOIN country on country.id = author.country_id order by first_name"
    );
    results = results.rows.length > 0 ? results.rows : [];
    // console.log("Found results:\n", results);
  } catch (error) {
    console.error("Error while selecting author's table", error);
  } finally {
    closeCon(db);
  }
  return results;
}

// sort all authors by type
async function sortAuthors(filter) {
  const db = openCon(db_param);
  let results = [];
  try {
    switch (filter) {
      case "a-z":
        results = await db.query(
          "SELECT author.id, author.first_name, author.last_name, author.full_name, author.photo, author.date_of_birth, country.country_name, author.biography FROM author JOIN country on country.id = author.country_id order by first_name"
        );
        break;
      case "z-a":
        results = await db.query(
          "SELECT author.id, author.first_name, author.last_name, author.full_name, author.photo, author.date_of_birth, country.country_name, author.biography FROM author JOIN country on country.id = author.country_id order by first_name desc"
        );
        break;
      case "rating":
        message = "Not yet Implemented sorry!🥺";
        break;
      case "oldest":
        results = await db.query(
          "SELECT author.id, author.first_name, author.last_name, author.full_name, author.photo, author.date_of_birth, country.country_name, author.biography FROM author JOIN country on country.id = author.country_id order by date_of_birth desc"
        );
        break;
      case "newest":
        results = await db.query(
          "SELECT author.id, author.first_name, author.last_name, author.full_name, author.photo, author.date_of_birth, country.country_name, author.biography FROM author JOIN country on country.id = author.country_id order by date_of_birth asc"
        );
        break;
      default:
        results = await db.query(
          "SELECT author.id, author.first_name, author.last_name, author.full_name, author.photo, author.date_of_birth, country.country_name, author.biography FROM author JOIN country on country.id = author.country_id order by first_name"
        );
    }

    results = results.rowCount > 0 ? results.rows : [];
    // console.log("Found results:\n", results);
  } catch (error) {
    console.error("Error while selecting author's table", error);
  } finally {
    closeCon(db);
  }
  return results;
}
// sort all books by criteria
async function sortBooks(filter) {
  const db = openCon(db_param);
  let results = [];
  try {
    switch (filter) {
      case "a-z":
        results = await db.query(
          "SELECT book.id, book.isbn, book.title,book.page_number,book.publish_date, category.name as category, author.id as author_id, author.full_name as book_author, book.book_cover_url,book.description FROM book INNER JOIN author on author.id = book.author_id INNER JOIN category on category.id = book.category_id order by book.title"
        );
        break;
      case "z-a":
        results = await db.query(
          "SELECT book.id, book.isbn, book.title,book.page_number,book.publish_date, category.name as category, author.id as author_id, author.full_name as book_author, book.book_cover_url,book.description FROM book INNER JOIN author on author.id = book.author_id INNER JOIN category on category.id = book.category_id order by book.title desc"
        );
        break;
      case "rating":
        message = "Not yet Implemented sorry!🥺";
        break;
      case "oldest":
        results = await db.query(
          "SELECT book.id, book.isbn, book.title,book.page_number,book.publish_date, category.name as category, author.id as author_id, author.full_name as book_author, book.book_cover_url,book.description FROM book INNER JOIN author on author.id = book.author_id INNER JOIN category on category.id = book.category_id order by book.publish_date"
        );
        break;
      case "newest":
        results = await db.query(
          "SELECT book.id, book.isbn, book.title,book.page_number,book.publish_date, category.name as category, author.id as author_id, author.full_name as book_author, book.book_cover_url,book.description FROM book INNER JOIN author on author.id = book.author_id INNER JOIN category on category.id = book.category_id order by book.publish_date desc"
        );
        break;
      default:
        results = await db.query(
          "SELECT book.id, book.isbn, book.title,book.page_number,book.publish_date, category.name as category, author.id as author_id, author.full_name as book_author, book.book_cover_url,book.description FROM book INNER JOIN author on author.id = book.author_id INNER JOIN category on category.id = book.category_id"
        );
    }

    results = results.rowCount > 0 ? results.rows : [];
    // console.log("Book results: ", results)
  } catch (error) {
    message =
      "Can't sort books...please contact the application support team!🥺";
    console.error(message, error);
  } finally {
    closeCon(db);
  }
  return results;
}

//
// sort all reviews by criteria
async function sortReviews(filter) {
  const db = openCon(db_param);
  let results = [];
  try {
    switch (filter) {
      case "a-z":
        results = await db.query(
          "SELECT review.id,book.id as book_id, book.isbn, book.title, book.book_cover_url, author.id as author_id ,author.full_name as book_author, review.rating, review.review_owner, review.review_comments, review.review_date, review.dislikecount, review.likecount FROM review JOIN book on review.book_id = book.id JOIN author on author.id = book.author_id order by book.title"
        );
        break;
      case "z-a":
        results = await db.query(
          "SELECT review.id,book.id as book_id, book.isbn, book.title, book.book_cover_url, author.id as author_id ,author.full_name as book_author, review.rating, review.review_owner, review.review_comments, review.review_date, review.dislikecount, review.likecount FROM review JOIN book on review.book_id = book.id JOIN author on author.id = book.author_id order by book.title desc"
        );
        break;
      case "rating":
        message = "Not yet Implemented sorry!🥺";
        break;
        break;
      case "oldest":
        results = await db.query(
          "SELECT review.id,book.id as book_id, book.isbn, book.title, book.book_cover_url, author.id as author_id ,author.full_name as book_author, review.rating, review.review_owner, review.review_comments, review.review_date, review.dislikecount, review.likecount FROM review JOIN book on review.book_id = book.id JOIN author on author.id = book.author_id order by review.review_date"
        );
        break;
      case "newest":
        results = await db.query(
          "SELECT review.id,book.id as book_id, book.isbn, book.title, book.book_cover_url, author.id as author_id ,author.full_name as book_author, review.rating, review.review_owner, review.review_comments, review.review_date, review.dislikecount, review.likecount FROM review JOIN book on review.book_id = book.id JOIN author on author.id = book.author_id order by review.review_date desc"
        );
        break;
      default:
        results = await db.query(
          "SELECT review.id,book.id as book_id, book.isbn, book.title, book.book_cover_url, author.id as author_id ,author.full_name as book_author, review.rating, review.review_owner, review.review_comments, review.review_date, review.dislikecount, review.likecount FROM review JOIN book on review.book_id = book.id JOIN author on author.id = book.author_id order by book.title"
        );
    }
    results = results.rowCount > 0 ? results.rows : [];
  } catch (error) {
    message = "Can't return info about reviews!🥺";
    console.error(message, error);
  } finally {
    closeCon(db);
  }
  return results;
}

// get all books categories
async function listCategories() {
  const db = openCon(db_param);
  let results = [];
  try {
    results = await db.query("SELECT * FROM category");
    results = results.rows.length > 0 ? results.rows : [];
  } catch (error) {
    console.error("Error while selecting category's table", error);
  } finally {
    closeCon(db);
  }
  return results;
}

// get all countries
async function listCountries() {
  const db = openCon(db_param);
  let results = [];
  try {
    results = await db.query("SELECT * FROM country");
    results = results.rows.length > 0 ? results.rows : [];
    // console.log("Found results:\n", results);
  } catch (error) {
    console.error("Error while selecting country's table", error);
  } finally {
    closeCon(db);
  }
  return results;
}

// add new author
async function addAuthor(author) {
  const db = openCon(db_param);
  let newAuthor = null;
  try {
    newAuthor = await db.query(
      "INSERT INTO author(first_name, last_name,full_name, photo, date_of_birth, country_id,biography) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [
        author.firstName,
        author.lastName,
        author.fullName,
        author.photo,
        author.dbo,
        author.countryId,
        author.biography,
      ]
    );
    newAuthor = newAuthor.rowCount > 0 ? newAuthor.rows[0] : null;
  } catch (error) {
    message =
      "can't create new author...Please contact application's support team!🥺";
    console.error(message, error);
  } finally {
    closeCon(db);
  }
  return newAuthor;
}

// add new Book
async function addBook(book) {
  let db = openCon(db_param);
  let newBook = null;
  try {
    newBook = await db.query(
      "INSERT INTO book(title, isbn, lang, author_id, page_number, publish_date, book_cover_url, category_id, description) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
      [
        book.title.replace("'", "''"),
        book.isbn,
        book.lang,
        book.author_id,
        book.page_number,
        book.publish_date,
        book.book_cover_url.replace(
          "'",
          "''"
        ) /* e.g: Eder's wife convert to Eder''s wife */,
        book.category_id,
        book.description.replace("'", "''"),
      ]
    );
    newBook = newBook.rowCount > 0 ? newBook.rows[0] : null;
  } catch (error) {
    message = "can't create new book!🥺";
    console.error(message, error);
  } finally {
    closeCon(db);
  }
  return newBook;
}

// add new Review
async function addReview(review) {
  let db = openCon(db_param);
  let newReview = [];
  try {
    newReview = await db.query(
      "INSERT INTO review(book_id, rating, review_owner, review_comments, review_date) VALUES($1, $2, $3, $4, $5) RETURNING *",
      [
        parseInt(review.book_id),
        parseFloat(review.rating),
        review.reviewer,
        review.review_comment,
        review.date_review,
      ]
    );
    newReview = newReview.rowCount > 0 ? newReview.rows : [];
  } catch (error) {
    message =
      "can't create new review...Please contact application's support team!🥺";
    console.error(message, error);
  } finally {
    closeCon(db);
  }
  return newReview;
}

// list all reviews
async function listReviews() {
  const db = openCon(db_param);
  let results = [];
  try {
    results = await db.query(
      "SELECT review.id,book.id as book_id, book.isbn, book.title, book.book_cover_url, author.id as author_id ,author.full_name as book_author, review.rating, review.review_owner, review.review_comments, review.review_date, review.dislikecount, review.likecount FROM review JOIN book on review.book_id = book.id JOIN author on author.id = book.author_id order by book.title"
    );
    results = results.rowCount > 0 ? results.rows : [];
  } catch (error) {
    console.error("Can't return info about reviews", error);
  } finally {
    closeCon(db);
  }
  return results;
}

// List all books
async function listBooks() {
  const db = openCon(db_param);
  let results = [];
  try {
    results = await db.query(
      "SELECT book.id, book.isbn, book.title,book.page_number,book.publish_date, category.name as category, author.id as author_id, author.full_name as book_author, book.book_cover_url,book.description FROM book INNER JOIN author on author.id = book.author_id INNER JOIN category on category.id = book.category_id"
    );
    results = results.rowCount > 0 ? results.rows : [];
    // console.log("Book results: ", results)
  } catch (error) {
    console.error("Can't get data from books", error);
  } finally {
    closeCon(db);
  }
  return results;
}

//Check whether a books has a review or not
async function hasReview(bookId) {
  const db = openCon(db_param);
  let find = false;
  try {
    let result = await db.query("SELECT * FROM review WHERE book_id = $1", [
      bookId,
    ]);
    result = result.rowCount > 0 ? result.rows : [];
    find = result.length > 0 ? true : false;
    console.log(result.rows);
  } catch (error) {
    console.error("Can't check if a book has or has not a review", error);
  } finally {
    closeCon(db);
  }
  return find;
}

// delete author
async function deleteAuthor(id, authorName) {
  const clientDb = openCon(db_param);
  let tableId = 0;
  try {
    let books = await getBooksByAuthor(parseInt(id));
    if (books.length === 0) {
      let result = await clientDb.query(
        "DELETE FROM author WHERE id = $1 RETURNING id",
        [id]
      );
      console.log(result.command);
      result = result.rowCount > 0 ? result.rows[0] : 0;
      tableId = result;
    } else {
      message = `First off delete the following books that belong to the author ${authorName}:`;
      let count = 1;
      books.forEach((book) => {
        message += `${count} - ${book.title}; `;
        count++;
      });
    }
  } catch (error) {
    message = `Can not delete record with ID {${id}} from table author!See error details: ${error}!`;
    console.error(message);
  } finally {
    closeCon(clientDb);
  }
  return tableId;
}

// delete review
async function deleteReview(id) {
  const clientDb = openCon(db_param);
  let tableId = 0;
  try {
    let result = await clientDb.query(
      "DELETE FROM review WHERE id = $1 RETURNING id",
      [id]
    );
    console.log(result.command);
    result = result.rowCount > 0 ? result.rows[0] : 0;
    tableId = result;
  } catch (error) {
    message = `Can't delete record with ID {${id}} from table review!🥺\n See error details: ${error}!`;
    console.error(message);
  } finally {
    closeCon(clientDb);
  }
  return tableId;
}

// delete book
async function deleteBook(bookId, bookName) {
  const client = openCon(db_param);
  let id = 0;
  try {
    let hasReviews = await hasReview(bookId);
    console.log("review value", hasReviews);
    if (!hasReviews) {
      let result = await client.query(
        "DELETE FROM book WHERE id = $1 RETURNING id",
        [bookId]
      );
      result = result.rowCount > 0 ? result.rows[0] : 0;
      id = result;
    } else {
      message = `First off delete all the reviews associated to this book { ${bookName} }`;
    }
  } catch (error) {
    message = `Can not delete book with title ${bookName} with internal Id of ${bookId}. ${error}`;
    console.error(message);
  } finally {
    closeCon(client);
  }
  return id;
}

// update review
async function updateReview(params) {
  const client = openCon(db_param);
  let result = [];
  try {
    result = await client.query(
      "UPDATE review SET book_id = $1, review_date = $2, review_owner = $3, review_comments = $4, review_dateupdate = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *",
      [
        parseInt(params.book_title),
        params.reviewDate,
        params.review_owner,
        params.reviewComments,
        parseInt(params.reviewId),
      ]
    );
    result = result.rowCount > 0 ? result.rows : [];
    console.log("Record was updated successfully", result[0]);
  } catch (error) {
    message =
      "Sorry, could not update the review...Please contact application support team!🥺";
    console.error(message, error);
  } finally {
    closeCon(client);
  }
  return result.length > 0 ? true : false;
}

// update book
async function updateBook(book) {
  const client = openCon(db_param);
  let result = [];
  try {
    result = await client.query(
      "UPDATE book SET title = $1, author_id = $2, publish_date = $3, isbn = $4, description = $5 WHERE id = $6 RETURNING *",
      [
        book.title,
        parseInt(book.authorId),
        book.publishDate,
        book.isbn,
        book.shortDesc,
        parseInt(book.bookId),
      ]
    );
    result = result.rowCount > 0 ? result.rows : [];
    console.log(`Book ${book.bookId} was updated successfully`, result[0]);
  } catch (error) {
    console.error("Can't update table book", error);
  } finally {
    closeCon(client);
  }
  return result.length > 0 ? true : false;
}

// update author
async function updateAuthor(author) {
  const clientDb = openCon(db_param);
  let result = [];
  try {
    result = await clientDb.query(
      "UPDATE author SET first_name = $1, last_name = $2, full_name = $3,date_of_birth = $4, country_id = $5, biography = $6 WHERE id = $7 RETURNING *",
      [
        author.firstName,
        author.lastName,
        author.firstName + " " + author.lastName,
        author.dateOfBirth,
        parseInt(author.countryId),
        author.authorBiography,
        parseInt(author.authorId),
      ]
    );
    result = result.rowCount > 0 ? result.rows : [];
  } catch (error) {
    console.error(`Can't update author with ID {${author.autorId}}`, error);
  } finally {
    closeCon(clientDb);
  }
  return result.length > 0 ? true : false;
}

// get book from author
async function getBooksByAuthor(author_id) {
  const db = openCon(db_param);
  let result = [];
  try {
    result = await db.query(
      "select book.id, book.title, book.isbn, book.page_number, book.publish_date, category.name as category from book join author on book.author_id = author.id join category on category.id = book.category_id where author.id = $1",
      [author_id]
    );
    result = result.rowCount > 0 ? result.rows : [];
    console.log(result);
  } catch (error) {
    console.error(error);
  } finally {
    closeCon(db);
  }
  return result;
}

// update likes or/and dislikes
async function updateLikesAndDislikes(params) {
  const db = openCon(db_param);
  let result = [];
  try {
    result = await db.query(
      "UPDATE review SET likecount = $1, dislikecount = $2 WHERE id = $3 RETURNING *",
      [
        parseInt(params.like),
        parseInt(params.dislike),
        parseInt(params.reviewId),
      ]
    );
    result = result.rowCount > 0 ? result.rows : [];
  } catch (error) {
    message = `Unable to update likes or dislikes for review with ID ${params.reviewId}. Please contact the I.T support team`;
    console.error(message, error);
  } finally {
    closeCon(db);
  }
  return result;
}

app.get("/", async (req, res) => {
  message = "";
  countries = await listCountries(); // inicialize countries variable
  categories = await listCategories();
  authors = await listAuthors();
  reviews = await listReviews();
  books = await listBooks();
  if (books.length === 0) message = "Sorry, there are no book entries!🥺";
  res.render("index.ejs", {
    books: books,
    error: message,
    authors: authors,
    reviews: reviews,
  });
});

app.get("/author/new", (req, res) => {
  // open new author window
  console.log(req.body);
  res.render("add-author.ejs", {
    error: message,
    countries: countries,
    photo: "../images/no-image.png",
  });
});

app.post("/author/new", async (req, res) => {
  let authorObj = {
    firstName: req.body["first_name"],
    lastName: req.body["last_name"],
    fullName: req.body["first_name"] + " " + req.body["last_name"],
    photo: req.body["photo"] ,
    dbo: req.body["date_of_birth"],
    countryId: req.body["country_id"],
    biography: req.body["biography"],
  };
  console.log("new author", authorObj);
  const newAuthor = await addAuthor(authorObj);
  console.log(newAuthor);
  if (newAuthor != null) {
    message = "";
  }
  res.render("add-author.ejs", {
    error: message,
    countries: countries,
    author: authorObj.fullName,
    flagInserted: message === "" ? true : false,
    photo: "../images/no-image.png",
  });
});

app.get("/author/list", async (req, res) => {
  authors = await listAuthors();
  countries = await listCountries();
  if (authors.length === 0) message = "Sorry, there are no author entries!🥺";
  else message = "";
  res.render("list-authors.ejs", {
    error: message,
    authors: authors,
    countries: countries,
  });
});

app.post("/author/list", async (req, res) => {
  /* filter will operate with this route */
  console.log(req.body);
  authors = await sortAuthors(req.body.filter);
  if (authors.length > 0) message = "";

  res.render("list-authors.ejs", {
    error: message,
    authors: authors,
    countries: countries,
  });
});

app.post("/author/update", async (req, res) => {
  console.log(req.body);
  let author = req.body;
  let wasUpdated = await updateAuthor(author);
  if (!wasUpdated)
    message = `Sorry, couldn't update author with ID {${req.body.authorId}}!🥺`;
  else {
    message = "";
    authors = await listAuthors();
  }
  res.render("list-authors.ejs", {
    authors: authors,
    countries: countries,
    update: wasUpdated,
    error: message,
  });
});

app.post("/author/delete", async (req, res) => {
  console.log(req.body.authorIdToDelete);
  let wasDeleted = await deleteAuthor(
    parseInt(req.body.authorIdToDelete),
    req.body.authorNameToDelete
  );
  console.log(typeof wasDeleted, message);
  if (wasDeleted !== 0) {
    console.log("entrei...");
    message = "";
    authors = await listAuthors();
  }
  console.log(message);
  res.render("list-authors.ejs", {
    authors: authors,
    error: message,
    eliminate: wasDeleted === 0 ? false : true,
  });
});
/* 
  How to get Image from URL then display it on webpage ?
  solution: 
  - step1: https://www.fabiofranchino.com/log/get-the-image-buffer-using-axios-and-nodejs/
  - step2: https://stackoverflow.com/questions/8499633/how-to-display-base64-images-in-html

*/
app.post("/author/photo", async (req, res) => {
  // get author phot from open library
  console.log(req.body);
  let olID = req.body.authorId;
  let param = `?default=false`; // will allow the server to reply 404 or not found if invalid OLID is passed
  olID = olID.concat("-L.jpg");
  let authorPhotoURL = "";
  try {
    authorPhotoURL = await axios.get(
      openLibraryURL + `a/OLID/${olID}${param}`,
      { responseType: "arraybuffer" }
    );
    authorPhotoURL = Buffer.from(authorPhotoURL.data, "binary").toString(
      "base64"
    );
    authorPhotoURL = "data:image/jpeg;charset=utf-8;base64, ".concat(
      authorPhotoURL
    );
    console.log(
      "url:",
      openLibraryURL + `a/OLID/${olID}`,
      "result size:",authorPhotoURL.length,
      "result:",
      authorPhotoURL
    );
    message = "";
  } catch (error) {
    message = `Cannot get photo with olID ${olID}...please reach out to app team support!🥺`;
    authorPhotoURL = "../images/no-image.png";
    console.error(message, error);
  }
  res.render("add-author.ejs", {
    error: message,
    countries: countries,
    photo: authorPhotoURL,
  });
});

app.post("/books/photo", async (req, res) => {
  console.log(req.body);
  authors = await listAuthors();
  categories = await listCategories();
  
  let photoUrl = "";
  try{
    photoUrl = await axios.get( openLibraryURL +  `b/isbn/${req.body.isbn_openlibrary}-L.jpg?default=false`/*, {
      params: {
        default: false,
      } // same as concatenate openLibraryURL +  `b/${req.body.photo}?default=false`
    }*/, { responseType: "arraybuffer"});
    photoUrl = Buffer.from(photoUrl.data, "binary").toString("base64");
    photoUrl = "data:image/jpeg;charset=utf-8;base64, ".concat(
      photoUrl
    );
    console.log(photoUrl);
    message = "";
  }catch (error){
    message = "Can not get book cover from open library. Pleas contact your app team support!";
    photoUrl = "../images/no-image.png";
    console.error(message, error);
  }
  res.render("add-book.ejs", { authors: authors, categories: categories,
     error: message, 
     photo:photoUrl, languages:languages });
});

app.get("/books/new", async (req, res) => {
  authors = await listAuthors();
  res.render("add-book.ejs", {
    error: message,
    authors: authors,
    categories: categories,
    languages: languages,
    photo: "../images/no-image.png",
  });
});

app.post("/books/new", async (req, res) => {
  const db = openCon(db_param);
  let newBook = {
    title: req.body.title,
    isbn: req.body.isbn,
    lang: req.body.lang,
    author_id: parseInt(req.body.author_id),
    page_number: parseInt(req.body.page_number),
    publish_date: req.body.publish_date,
    book_cover_url:req.body.book_cover_url,
    category_id: parseInt(req.body.category_id),
    description: req.body.description,
  };
  console.log(newBook);
  let insert = "";
  try {
    insert = await addBook(newBook);
    if (insert !== null) {
      message = "";
    }
  } catch (error) {
    message = "Sorry, cannot create this book entry...contact app support team!🥺";
    console.error(message, error);
  }
  res.render("add-book.ejs", {
    error: message,
    languages: languages,
    authors: authors,
    flagInserted: insert === null ? false : true,
    title: insert !== null ? req.body.title : "",
    photo: "../images/no-image.png"
  });
});

app.get("/books/list", async (req, res) => {
  reviews = await listReviews();
  books = await listBooks();
  if (books.length === 0) message = "Sorry, there are no book entries!🥺";
  else message = "";
  res.render("index.ejs", {
    books: books,
    error: message,
    reviews: reviews,
    authors: authors,
  });
});

app.post("/books/list", async (req, res) => {
  console.log(req.body);
  reviews = await listReviews();
  authors = await listAuthors();
  books = await sortBooks(req.body.filter);
  if (books.length > 0) message = "";
  res.render("index.ejs", {
    books: books,
    error: message,
    reviews: reviews,
    authors: authors,
  });
});

app.post("/books/update", async (req, res) => {
  console.log(req.body);
  let wasUpdated = await updateBook(req.body);
  books = await listBooks();
  reviews = await listReviews();
  res.render("index.ejs", {
    books: books,
    authors: authors,
    reviews: reviews,
    flagUpdated: wasUpdated,
  });
});

app.post("/books/delete", async (req, res) => {
  console.log(req.body);
  let wasDeleted = await deleteBook(
    req.body.bookIdToDelete,
    req.body.bookTitleToDelete
  );
  if (wasDeleted !== 0) {
    message = "";
    books = await listBooks();
  }
  res.render("index.ejs", {
    books: books,
    authors: authors,
    error: message,
    flagDeleted: wasDeleted === 0 ? false : true,
  });
});

app.post("/reviews/delete", async (req, res) => {
  console.log("ID to delete", req.body);
  let idDeleted = await deleteReview(parseInt(req.body.idToDelete), "review");
  reviews = await listReviews();
  if (reviews.length === 0) {
    message = "Sorry, there are no review entries!🥺";
  }
  if (idDeleted === 0) {
    message = "";
  }
  res.render("list-reviews.ejs", {
    reviews: reviews,
    error: message,
    flagDeleted: idDeleted === 0 ? false : true,
  });
});

app.post("/reviews/update", async (req, res) => {
  console.log(req.body);
  let wasUpdated = await updateReview(req.body);
  reviews = await listReviews();
  //authors = await listAuthors();
  books = await listBooks();
  if (reviews.length > 0) {
    message = "";
  }
  res.render("list-reviews.ejs", {
    reviews: reviews,
    error: message,
    //authors: authors,
    books: books,
    flagUpdated: wasUpdated,
  });
});

app.get("/reviews/list", async (req, res) => {
  reviews = await listReviews();
  authors = await listAuthors();
  books = await listBooks();

  if (reviews.length === 0) {
    message = "Sorry, there are no review entries!🥺";
  }
  res.render("list-reviews.ejs", {
    reviews: reviews,
    error: message,
    authors: authors,
    books: books,
  });
});

app.post("/reviews/likes", async (req, res) => {
  // used to increment likes and dislike

  authors = await listAuthors();
  books = await listBooks();
  let review = await updateLikesAndDislikes(req.body);
  console.log(req.body);
  if (reviews.length === 0) {
    message = "Sorry, there are no review entries!🥺";
  } else if (review.length > 0) {
    reviews = await listReviews();
    message = "";
  }
  res.render("list-reviews.ejs", {
    reviews: reviews,
    error: message,
    authors: authors,
    books: books,
  });
});

app.post("/reviews/list", async (req, res) => {
  // sort by a criteria
  console.log(req.body);
  authors = await listAuthors();
  reviews = await sortReviews(req.body.filter);
  if (reviews.length > 0) {
    message = "";
  }
  res.render("list-reviews.ejs", {
    reviews: reviews,
    error: message,
    authors: authors,
    books: books,
  });
});

app.post("/reviews/new", async (req, res) => {
  console.log(req.body);
  let review = await addReview(req.body);
  if (review.length > 0) {
    message = "";
    reviews = await listReviews();
    books = await listBooks();
    authors = await listAuthors();
  }

  res.render("index.ejs", {
    books: books,
    error: message,
    reviews: reviews,
    authors: authors,
    flagInserted: review.length > 0 ? true : false,
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// let authors = [
//   {
//     id: 3,
//     first_name: "Stephen",
//     last_name: "King",
//     fullName: "Stephen King",
//     dbo: "09/21/1947",
//     country_id: 1,
//     photo: "../images/authors/stephen-king.png",
//     bibliography: "Stephen Edwin King (born September 21, 1947) is an American author of horror, supernatural fiction, suspense, crime, science-fiction, and fantasy novels. Called the <<King of Horror>>,[2] his books have sold more than 350 million copies as of 2006,[3] and many have been adapted into films, television series, miniseries, and comic books.[4] He has also written approximately 200 short stories, most of which have been published in book collections.[5] His debut, Carrie, was published in 1974, and was followed by 'Salem's Lot, The Shining, The Stand and The Dead Zone. Different Seasons, a collection of four novellas, was his first major departure from the horror genre. The novellas provided the basis for the films Stand by Me and The Shawshank Redemption. King has published under the pseudonym Richard Bachman and has cowritten works with other authors, notably his friend Peter Straub and sons Joe and Owen King."
//   },
//   {
//     id: 4,
//     first_name: "Dan",
//     last_name: "Brown",
//     fullName: "Dan Brown",
//     dbo: "06/22/1964",
//     country_id: 1,
//     photo: "../images/authors/dan-brown.jpg",
//     bibliography: "Daniel Gerhard Brown (born June 22, 1964) is an American author best known for his thriller novels, including the Robert Langdon novels Angels & Demons (2000), The Da Vinci Code (2003), The Lost Symbol (2009), Inferno (2013), and Origin (2017). His novels are treasure hunts that usually take place over a period of 24 hours.[3] They feature recurring themes of cryptography, art, and conspiracy theories. His books have been translated into 57 languages and, as of 2012, have sold over 200 million copies. Three of them, Angels & Demons, The Da Vinci Code, and Inferno, have been adapted into films, while one of them, The Lost Symbol, was adapted into a television show."
//   },
//   {
//     id: 5,
//     first_name: "Edgar Allan",
//     last_name: "Poe",
//     fullName: "Edgar Allan Poe",
//     dbo: "01/19/1809",
//     country_id: 1,
//     photo: "../images/authors/edgar-alan-poe.jpg",
//     bibliography: "Edgar Allan Poe (né Edgar Poe; January 19, 1809 – October 7, 1849) was an American writer, poet, author, editor, and literary critic who is best known for his poetry and short stories, particularly his tales of mystery and the macabre. He is widely regarded as a central figure of Romanticism and Gothic fiction in the United States, and of American literature.[1] Poe was one of the country's earliest practitioners of the short story, and is considered the inventor of the detective fiction genre, as well as a significant contributor to the emerging genre of science fiction.[2] He is the first well-known American writer to earn a living through writing alone, resulting in a financially difficult life and career.[3]Poe was born in Boston, the second child of actors David and Elizabeth Eliza Poe.[4] His father abandoned the family in 1810, and when his mother died the following year, Poe was taken in by John and Frances Allan of Richmond, Virginia. They never formally adopted him, but he was with them well into young adulthood. He attended the University of Virginia but left after a year due to lack of money. He quarreled with John Allan over the funds for his education, and his gambling debts. In 1827, having enlisted in the United States Army under an assumed name, he published his first collection, Tamerlane and Other Poems, credited only to <<a Bostonian>>. Poe and Allan reached a temporary rapprochement after the death of Allan's wife in 1829. Poe later failed as an officer cadet at West Point, declared a firm wish to be a poet and writer, and parted ways with Allan."
//   },
// ];
// let countries = [
//   { id: 235, country_code: "US", country_name: "United States of America" },
//   { id: 2, country_code: "AO", country_name: "Angola" },
//   { id: 3, country_code: "BR", country_name: "Brazil" },
// ];

// let books = [
//   {
//     id: 1,
//     title: "Carrie",
//     isbn: "978-0-385-08695-0",
//     author_id: 3,
//     language: "EN",
//     hardcover: 199,
//     book_cover_url: "../images/books/book-cover-sample-01.jpg",
//     publish_date: "November 8, 1974",
//     rating_stars: 1.5,
//     description:
//       "Carrie is a 1974 horror novel, the first by American author Stephen King. Set in Chamberlain, Maine, the plot revolves around Carrie White, a friendless, bullied high-school girl from an abusive religious household who discovers she has telekinetic powers. Feeling guilty for harassing Carrie, Sue Snell invites Carrie to the prom with Tommy Ross, but a humiliating prank during the prom by Chris Hargensen leads to Carrie destroying the town with her powers. The narrative contains fictional documents in approximately chronological order that present multiple perspectives on the prom incident and its perpetrator. Carrie deals with themes of ostracism and revenge, with the opening shower scene and the destruction of Chamberlain being pivotal scenes.King started writing Carrie, intended to be a short story for the men's magazine Cavalier, after a friend's suggestion to write a story of a female character. Though King initially gave up on Carrie due to discomfort and apathy, and felt it would never be successful, his wife Tabitha convinced him to continue writing. King based the character of Carrie on two girls he knew in high school and enjoyed fabricating the documents for the narrative. After Doubleday accepted Carrie to be published, King worked with editor Bill Thompson to revise the novel.",
//   },
//   {
//     id: 2,
//     title: "The Old Ferry Stories",
//     isbn: "0029637894128",
//     author_id: 4,
//     language: "EN",
//     hardcover: 52,
//     book_cover_url: "../images/books/book-cover-sample-02.jpg",
//     publish_date: "December 30, 1999",
//     rating_stars: 5,
//     description:
//       "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.",
//   },
// ];

// let reviews = [
//   {
//     review_id: 1,
//     book_id: 1,
//     review_date: "November 16, 2023",
//     rating_stars: 1.5,
//     owner: "John Berry",
//     review:
//       `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam quis ligula id justo mattis ultrices. Vestibulum egestas mattis orci. Cras arcu augue, ornare quis tortor nec, commodo convallis ex. Suspendisse molestie turpis et nisl vulputate, a posuere risus elementum. Ut nec pharetra justo. Vestibulum dapibus pellentesque est, non elementum massa pulvinar maximus. Donec a varius elit, quis fringilla ligula. Cras sit amet scelerisque justo. Cras ante metus, vulputate in mattis quis, porttitor eu dui. Morbi vestibulum luctus nunc ut vehicula. Nunc posuere, lectus non ultricies accumsan, magna massa feugiat mauris, a malesuada ligula nulla eget metus. Aenean a ex varius, maximus risus at, dignissim arcu. Vestibulum venenatis mollis lacus, sit amet varius diam accumsan et. Proin pretium cursus euismod. Vestibulum et lacinia elit. Praesent sed convallis urna. Pellentesque efficitur, metus faucibus lobortis pretium, orci diam placerat libero, sed sagittis nisi justo quis nunc. Aliquam ultrices est odio, aliquet venenatis nulla ullamcorper non. Mauris magna diam, lacinia id faucibus u't, laoreet nec tellus. Duis nec tortor ut felis pellentesque euismod eget sed leo..`,
//   },
//   {
//     review_id: 2,
//     book_id: 2,
//     review_date: "November 16, 2023",
//     rating_stars: 1.5,
//     owner: "Randell Smith",
//     review:
//       "Curabitur scelerisque fringilla libero sit amet commodo. Donec egestas, ante a porta hendrerit, metus nisi euismod lorem, vitae finibus enim tortor vitae ante. Phasellus sit amet lobortis purus. Nullam dignissim vulputate elit ut placerat. Integer rutrum augue at tellus aliquet ultrices. Pellentesque ut diam tristique, blandit nulla eget, pellentesque enim. Vivamus eget ultricies mauris, sollicitudin tempus neque. Nam auctor, arcu in consectetur ullamcorper, velit justo sodales est, vitae congue ipsum ipsum in turpis. Nulla sit amet diam suscipit, laoreet nunc id, faucibus nisi. Suspendisse vitae massa varius, ultricies erat malesuada, elementum odio. Praesent id erat interdum, semper nibh vitae, dapibus eros. Nunc malesuada lacus non dolor placerat sagittis. In pulvinar molestie sapien, at egestas arcu volutpat eu. Nulla facilisi. Donec finibus aliquet nulla et blandit. Nullam luctus auctor cursus. Phasellus finibus lacinia ante in consectetur. Aliquam a accumsan enim. Praesent ligula augue, dictum vitae felis efficitur, egestas elementum orci. Suspendisse non felis ac diam cursus ullamcorper. Vestibulum ut mi dolor. Nulla lobortis mi id ante mattis, at varius eros congue. Sed egestas sed sapien at malesuada. Suspendisse tempus, lectus a tempus porta, tellus leo dapibus libero, nec efficitur ipsum turpis vitae enim. Fusce semper neque elementum sagittis tincidunt. Nulla porta, sapien et facilisis placerat, neque arcu varius lectus, sit amet efficitur mauris lorem sit amet tortor. Vestibulum vitae gravida eros..",
//   },
// ];
