// server.js
// disable typescript checks
// @ts-nocheck
import path from "path"
import multer from "multer";
import compression from "compression";
import express from "express";
import morgan from "morgan";
import mysql from "mysql"; // mysql package, should be self explanitory
import crypto from "crypto"; // for salting and hashing passwords
import session from "express-session"; // for session storage
// Load environment variables
import dotenv from 'dotenv';
const upload = multer({ storage: multer.memoryStorage() });
dotenv.config();

// Short-circuit the type-checking of the built output.
const BUILD_PATH = "./build/server/index.js";
const DEVELOPMENT = process.env.NODE_ENV === "development";
const PORT = Number.parseInt(process.env.PORT || "5003");

const app = express();
app.use(express.json()); // built-in middleware json parser

// Make sure you have a SESSION_SECRET environment variable or set a default
const sessionSecret = process.env.SESSION_SECRET || "your-secret-key";

// session middleware
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
  })
);

// Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10, // try like 10
});

/*
//---------------------CODE FOR API'S HERE--------------------
*/

/*
app.post("/api/insert", (req, res) => {
  const { name, email } = req.body;
  const groupID = "Student";

  // Insert the request body into the database
  const query = `INSERT INTO Members (FirstName, Email, GroupID) VALUES (?, ?, ?)`;
  db.query(query, [name, email, groupID]);

  res.json({ success: true, message: "Data inserted successfully" });

  console.log(name);
  console.log(email);
  return;
});
*/

app.get("/api/search", (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res
      .status(400)
      .json({ success: false, message: "Missing search query" });
  }

  // Example: search in the Items table using a LIKE query on the ItemTitle column
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting connection:", err);
      return;
    }

    connection.query(
      `SELECT * FROM Items WHERE Title LIKE ?`,
      [`%${query}%`],
      (err, results) => {
        if (err) {
          console.error("Error executing search query:", err.stack);
          return res
            .status(500)
            .json({ success: false, message: "Error searching items" });
        }
        res.json(results);
      }
    );
    // Important: Release the connection back to the pool
    connection.release();
  });
});

/*
// RETURNS ALL MEMBERS
app.get("/api/members", (req, res) => {
  db.query("SELECT * FROM Members", (err, results) => {
    if (err) {
      console.error("Error executing query: " + err.stack);
      res.status(500).send("Error fetching users");
      return;
    }
    res.json(results);
  });
});
*/


/*
// RETURNS MEMBER ID, NAME, THEIR CLASSIFICATION, AND LENDING PRIVILEGES
app.get("/api/memberprivileges", (req, res) => {
  db.query(
    "SELECT Members.MemberID, Members.FirstName, membergroups.GroupID, membergroups.LendingPeriod, membergroups.ItemLimit, membergroups.MediaItemLimit FROM Members INNER JOIN membergroups ON Members.GroupID=membergroups.GroupID",
    (err, results) => {
      if (err) {
        console.error("Error executing query: " + err.stack);
        res.status(500).send("Error fetching user privleges");
        return;
      }
      res.json(results);
    }
  );

});
// Define API routes first
app.get("/api/admin/books", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting connection:", err);
      return res.status(500).json({ error: "Database connection error." });
    }

    const query = `
      SELECT 
        TO_BASE64(Photo) AS photo, -- Encode Photo as Base64
        Title AS title,
        ISBN AS isbn
      FROM Books
      ORDER BY Title;
    `;

    connection.query(query, (err, results) => {
      connection.release();
      if (err) {
        console.error("Error executing query:", err);
        return res.status(500).json({ error: "Error fetching books." });
      }
      res.json({ books: results });
    });
  });
});
*/

// Other API routes...
// Define API routes first

// add media

// Configure multer for file uploads



// Configure multer for file uploads (declare `upload` only once)

// Define the /api/admin/add-media route
app.get("/api/users", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting connection:", err);
      return res.status(500).json({ error: "Database connection error." });
    }

    const query = "SELECT * FROM user_view";

    connection.query(query, (err, results) => {
      connection.release(); // Release the connection back to the pool
      if (err) {
        console.error("Error executing query:", err);
        return res.status(500).json({ error: "Error fetching users." });
      }

      res.json(results);
    });
  });
});
app.get("/api/borrow-summary", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting connection:", err);
      return res.status(500).json({ error: "Database connection error." });
    }

    const query = "SELECT * FROM borrow_summary_view";

    connection.query(query, (err, results) => {
      connection.release(); // Release the connection back to the pool
      if (err) {
        console.error("Error executing query:", err);
        return res.status(500).json({ error: "Error fetching borrow summary." });
      }

      res.json(results);
    });
  });
});
app.post("/api/admin/add-media", upload.single("photo"), (req, res) => {
  const { title, genreId, languageId, director, leads, releaseYear, format, rating } = req.body;
  const photo = req.file ? req.file.buffer : null;

  if (!title || !languageId) {
    return res.status(400).json({ error: "Title and Language ID are required." });
  }

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Connection error:", err);
      return res.status(500).json({ error: "Database connection error." });
    }

    connection.beginTransaction((err) => {
      if (err) {
        connection.release();
        return res.status(500).json({ error: "Transaction initiation error." });
      }

      // Insert into Items table
      const itemQuery = `
        INSERT INTO Items (Title, CreatedAt, LastUpdated, Status)
        VALUES (?, NOW(), NOW(), 'Available');
      `;
      connection.query(itemQuery, [title], (err, itemResult) => {
        if (err) {
          return connection.rollback(() => {
            connection.release();
            console.error("Error inserting item:", err);
            res.status(500).json({ error: "Failed to add item." });
          });
        }

        const itemId = itemResult.insertId;

        // Insert into Media table
        const mediaQuery = `
          INSERT INTO Media (MediaID, Director, Leads, ReleaseYear, GenreID, LanguageID, Format, Rating, Photo)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;
        const mediaParams = [
          itemId,
          director || null,
          leads || null,
          releaseYear || null,
          genreId || null,
          languageId,
          format || null,
          rating || null,
          photo,
        ];

        connection.query(mediaQuery, mediaParams, (err) => {
          if (err) {
            return connection.rollback(() => {
              connection.release();
              console.error("Error inserting media:", err);
              res.status(500).json({ error: "Failed to add media." });
            });
          }

          connection.commit((err) => {
            if (err) {
              return connection.rollback(() => {
                connection.release();
                console.error("Commit error:", err);
                res.status(500).json({ error: "Transaction commit error." });
              });
            }

            connection.release();
            res.status(201).json({ success: true, message: "Media added successfully!" });
          });
        });
      });
    });
  });
});
// Book view
app.get("/api/book-details", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting connection:", err);
      return res.status(500).json({ error: "Database connection error." });
    }

    const query = "SELECT * FROM book_details_view";

    connection.query(query, (err, results) => {
      connection.release(); // Release the connection back to the pool
      if (err) {
        console.error("Error executing query:", err);
        return res.status(500).json({ error: "Error fetching book details." });
      }

      res.json(results);
    });
  });
});
app.get("/api/items", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting connection: ", err);
      return res.status(500).send("Error connecting to the database");
    }

    const query = `
      SELECT 
        ISBN AS ItemID, 
        Title, 
        'Book' AS TypeName, 
        'Available' AS Status, 
        TO_BASE64(Photo) AS PhotoBase64
      FROM Books
    `;

    connection.query(query, (err, results) => {
      connection.release(); // Release the connection back to the pool
      if (err) {
        console.error("Error executing query: " + err.stack);
        return res.status(500).send("Error fetching items");
      }

      res.json(results);
    });
  });
});

//Return itemdevice
app.get("/api/itemdevice/:itemId", (req, res) => {
  const { itemId } = req.params;

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting connection:", err);
      return res.status(500).json({ error: "Database connection error" });
    }

    connection.query(
      "SELECT * FROM Items WHERE ItemID = ?",
      [itemId],
      (err, results) => {
        connection.release(); // Important: Release the connection
        if (err) {
          console.error("Error executing query:", err);
          return res.status(500).json({ error: "Query execution error" });
        }
        if (results.length === 0) {
          return res.status(404).json({ error: "Item not found" });
        }
        res.json(results[0]); // Return the first matching item
      }
    );
  });
});

//Return itemdevice
app.get("/api/itemdevice/:itemId", (req, res) => {
  const { itemId } = req.params;

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting connection:", err);
      return res.status(500).json({ error: "Database connection error" });
    }

    connection.query(
      "SELECT * FROM Items WHERE ItemID = ?",
      [itemId],
      (err, results) => {
        connection.release(); // Important: Release the connection
        if (err) {
          console.error("Error executing query:", err);
          return res.status(500).json({ error: "Query execution error" });
        }
        if (results.length === 0) {
          return res.status(404).json({ error: "Item not found" });
        }
        res.json(results[0]); // Return the first matching item
      }
    );
  });
});
/*
// RETURNS ALL BOOKS
app.get("/api/books", (req, res) => {
  db.query(
    'SELECT Items.ItemID, Items.ItemTitle, Books.Authors, ItemTypes.ISBN, Genres.GenreName FROM (((Items INNER JOIN ItemTypes ON ItemTypes.ItemID=Items.ItemID AND ItemTypes.TypeName="Book") INNER JOIN Books ON ItemTypes.ISBN=Books.ISBN) INNER JOIN Genres ON Books.GenreID=Genres.GenreID)',
    (err, results) => {
      if (err) {
        console.error("Error executing query: " + err.stack);
        res.status(500).send("Error fetching books");
        return;
      }
      res.json(results);
    }
  );
});
*/

// RETURNS ALL FILMS
/*
app.get('/api/films', (req, res) => {
  db.query('SELECT Items.ItemID, Items.ItemTitle, Films.FilmYear, ItemTypes.FilmID, Genres.GenreName FROM (((Items INNER JOIN ItemTypes ON ItemTypes.ItemID=Items.ItemID AND ItemTypes.TypeName="Film") INNER JOIN Films ON ItemTypes.FilmID=Films.FilmID) INNER JOIN Genres ON Films.GenreID=Genres.GenreID)', (err, results) => {
      if (err) {
          console.error('Error executing query: ' + err.stack);
          res.status(500).send('Error fetching films');
          return;
      }
      res.json(results);
  });
});
*/


// FOR SALTING AND HASHING PASSWORDS
/**
 * Generates a secure password hash with salt
 * @param {string} password - The password to hash
 */
function generatePassword(password) {
  const salt = crypto.randomBytes(32).toString("hex");
  const genHash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");

  return `${salt}:${genHash}`;
}
// FOR SALTING AND HASHING PASSWORDS

// FOR SALTING AND HASHING PASSWORDS

// ------------------------------------------------- BEGIN SIGN UP -------------------------------------------------
app.post("/api/signup", async (req, res) => {
  // get Email, Password, & GroupID from request body
  const { email, password, groupid, firstName, middleName, lastName, address } =
    req.body;

  // validation check to ensure email & password were passed to server
  if (!email || !password) {
    res.status(400).json({ error: "Email & Password are poopy." });
    return;
  }

  

  // validation of password strength (ex. minimum 8 characters)
  // can include others, or not if you don't want to be annoying
  if (password.length < 8) {
    res
      .status(400)
      .json({ error: "Password must be at least 8 characters long" });
    return;
  }

  // GroupID should be defaulted to Student, this will happen elsewhere??

  // Okay so we have an Email and Password here
  // We need to check if the Email already exists in database
  try {
    // this is a function decleration to check if an user already exists
    // query is somewhat efficient, LIMIT 1 means as soon as it finds a match the query ends
    // email is an unique index in the database so there shouldnt ever be duplicate entries
    // may have to think about case sensitive emails, but maybe do that in the client side??
    const checkExistingUser = () => {
      return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
          if (err) {
            console.error("Error getting connection: ", err);
            return;
          }

          // use connection
          connection.query(
            "SELECT 1 FROM Members WHERE Email = ? LIMIT 1",
            [email],
            (err, result) => {
              if (err) {
                reject(err);
                return;
              }
              resolve(result && result.length > 0);
            }
          );
          // Important: Release the connection back to the pool
          connection.release();
        });
      });
    };

    // this is a function to insert user into database
    const createUser = () => {
      return new Promise((resolve, reject) => {
        // Hash password
        const hashedPassword = generatePassword(password);

        pool.getConnection((err, connection) => {
          if (err) {
            console.error("Error getting connection: ", err);
            return;
          }

          connection.query(
            "INSERT INTO Members (Email, Password, GroupID, FirstName, MiddleName, LastName, Address) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [
              email,
              hashedPassword,
              groupid,
              firstName,
              middleName,
              lastName,
              address,
            ],
            (err, result) => {
              if (err) {
                reject(err);
                return;
              }
              resolve(result);
            }
          );
          // Important: Release the connection back to the pool
          connection.release();
        });
      });
    };

    // Check if user exists
    const userExists = await checkExistingUser();

    if (userExists) {
      res.status(409).json({ error: "Account already exists" }); // 409 Conflict is more appropriate
      return;
    }

    // Create the user
    await createUser();

    // Log successful registration (consider adding user ID but not PII)
    console.log(`New user registered with email: ${email.substring(0, 3)}...`);

    // Return success response
    res
      .status(201)
      .json({ success: true, message: "Account created successfully!" });
    return;
  } catch (error) {
    console.error("Error in signup process:", error);
    res.status(500).json({ error: "Signup failed" });
    return;
  }
});
// ------------------------------------------------- END SIGN UP -------------------------------------------------

// ------------------------------------------------- BEGIN LOGIN -------------------------------------------------
app.post("/api/login", async (req, res) => {
  // get Email and Password from request body
  // sorry about the capital? capitol? (idk how to spell that) variable names
  // just matching how its stored in the database so I don't get confused
  const { email, password } = req.body;

  // validation check same as signup api
  if (!email || !password) {
    res.status(400).json({ error: "Email & Password are required." });
    return;
  }

  // no need for email validation here b/c it should already have happened when
  // it got inserted into database

  try {
    // Find user by email, this an async function definition that returns promise
    const findMember = () => {
      return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
          if (err) {
            console.error("Error getting connection: ", err);
            return;
          }

          connection.query(
            "SELECT * FROM Members WHERE Email = ? LIMIT 1",
            [email],
            (err, results) => {
              if (err) {
                reject(err);
                return;
              }
              // If no user found or multiple users somehow found (shouldn't happen with unique emails)
              if (!results || results.length !== 1) {
                resolve(null);
                return;
              }
              // Return the user data
              resolve(results[0]);
            }
          );
          // Important: Release the connection back to the pool
          connection.release();
        });
      });
    };

    // Find the member
    const member = await findMember();

    // If no user found, return error (don't specify whether email or password is wrong for security)
    if (!member) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // assuming member found, grab their password
    const storedPassword = member.Password;

    // Split the stored password into salt and hash
    const [salt, storedHash] = storedPassword.split(":");

    if (validPassword(password, storedHash, salt)) {
      // Password is valid, create user session

      // debug check
      //console.log("Member ID from database:", member.ID); // Check the value

      // Ensure this line runs after successful authentication
      req.session.memberID = member.MemberID;
      req.session.groupID = member.GroupID;

      // just work you way up through app.ts, auth.ts, api.ts, layout.tsx, then wherever
      req.session.firstName = member.FirstName;
      req.session.middleName = member.MiddleName;
      req.session.lastName = member.LastName;
      req.session.address = member.Address;

      // Debug check
      //console.log("Session after setting memberID:", req.session);
      //console.log("memberID in session:", req.session.memberID);

      // Explicitly save the session to ensure it's stored
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ error: "Failed to create session" });
        }

        // Return success response
        res.json({
          success: true,
          message: "Login successful",
        });
      });
    } else {
      // Password is invalid
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }
  } catch (error) {
    console.error("Error in login process:", error);
    res.status(500).json({ error: "Login failed" });
    return;
  }
});
// ------------------------------------------------- END LOGIN -------------------------------------------------

// ------------------------------------------------- BEGIN LOGOUT -------------------------------------------------
app.delete("/logout", (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        res.status(400).send("Unable to log out");
      } else {
        // Clear the session cookie
        res.clearCookie("connect.sid");
        res.status(200).send("Logout successful");
      }
    });
  } else {
    res.status(200).send("No session to log out from");
  }
});
// ------------------------------------------------- END LOGOUT -------------------------------------------------


// FOR SALTING AND HASHING PASSWORDS
/**
 * Generates a secure password hash with salt
 * @param {string} password - The password to hash
 */

// FOR SALTING AND HASHING PASSWORDS
/**
 * Generates a secure password hash with salt
 * @param {string} password - The password to hash
 * @param {string} hash
 * @param {string} salt
 */
function validPassword(password, hash, salt) {
  const checkHash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");
  return hash === checkHash;
}
// FOR SALTING AND HASHING PASSWORDS

// ------------------------------------------------- BEGIN SIGN UP -------------------------------------------------
app.get("/api/test-connection", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error connecting to the database:", err);
      return res.status(500).json({ success: false, message: "Database connection failed" });
    }

    connection.query("SELECT 1", (err, results) => {
      connection.release(); // Release the connection back to the pool
      if (err) {
        console.error("Error executing test query:", err);
        return res.status(500).json({ success: false, message: "Test query failed" });
      }

      res.status(200).json({ success: true, message: "Database connection successful", results });
    });
  });
});


// Configure multer for file uploads


app.post("/api/admin/add-book", upload.single("photo"), (req, res) => { 
  console.log("Request body:", req.body); // Debugging
  console.log("Uploaded file:", req.file); // Debugging

  const { isbn, title, authors, genreId, publisher, publicationYear, languageId, cost } = req.body;
  const photo = req.file ? req.file.buffer : null;

  // Validate required fields
  if (!isbn || !title || !languageId) {
    return res.status(400).json({ error: "ISBN, Title, and LanguageID are required." });
  }

  // Obtain a connection for transaction control
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Connection error:", err);
      return res.status(500).json({ error: "Database connection error." });
    }

    connection.beginTransaction(err => {
      if (err) {
        connection.release();
        return res.status(500).json({ error: "Transaction initiation error." });
      }

      // Insert into the Books table
      const bookQuery = `
        INSERT INTO Books 
          (ISBN, Title, Authors, GenreID, Publisher, PublicationYear, LanguageID, Photo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
      `;
      const bookParams = [
        isbn,
        title,
        authors || null,
        genreId || null,
        publisher || null,
        publicationYear || null,
        languageId,
        photo // Binary data for photo
      ];

      connection.query(bookQuery, bookParams, (err, result) => {
        if (err) {
          return connection.rollback(() => {
            connection.release();
            console.error("Error inserting book:", err);
            res.status(500).json({ error: "Failed to add book." });
          });
        }

        
        const itemQuery = `
          INSERT INTO Items 
            (Title, Cost, TimesBorrowed, CreatedAt, CreatedBy, LastUpdated, Status)
          VALUES (?, ?, 0, NOW(), ?, NOW(), ?);
        `;
        const createdBy = req.user ? req.user.id : null; 
        const status = "Available"; 
        const itemParams = [
          title,
          cost || 0,
          createdBy,
          status
        ];

        connection.query(itemQuery, itemParams, (err, result) => {
          if (err) {
            return connection.rollback(() => {
              connection.release();
              console.error("Error inserting item:", err);
              res.status(500).json({ error: "Failed to add item record." });
            });
          }

          connection.commit(err => {
            if (err) {
              return connection.rollback(() => {
                connection.release();
                console.error("Commit error:", err);
                res.status(500).json({ error: "Transaction commit error." });
              });
            }
            connection.release();
            res.status(201).json({ success: true, message: "Book and item added successfully!" });
          });
        });
      });
    });
  });
});

app.post("/api/signup", async (req, res) => {
  // get Email, Password, & GroupID from request body
  const { email, password, groupid, firstName, middleName, lastName, address } =
    req.body;

  // validation check to ensure email & password were passed to server
  if (!email || !password) {
    res.status(400).json({ error: "Email & Password are poopy." });
    return;
  }

  // validation check to ensure format of email is correct
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ error: "Invalid email format" });
    return;
  }

  // validation of password strength (ex. minimum 8 characters)
  // can include others, or not if you don't want to be annoying
  if (password.length < 8) {
    res
      .status(400)
      .json({ error: "Password must be at least 8 characters long" });
    return;
  }

  // GroupID should be defaulted to Student, this will happen elsewhere??

  // Okay so we have an Email and Password here
  // We need to check if the Email already exists in database
  try {
    // this is a function decleration to check if an user already exists
    // query is somewhat efficient, LIMIT 1 means as soon as it finds a match the query ends
    // email is an unique index in the database so there shouldnt ever be duplicate entries
    // may have to think about case sensitive emails, but maybe do that in the client side??
    const checkExistingUser = () => {
      return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
          if (err) {
            console.error("Error getting connection: ", err);
            return;
          }

          // use connection
          connection.query(
            "SELECT 1 FROM Members WHERE Email = ? LIMIT 1",
            [email],
            (err, result) => {
              if (err) {
                reject(err);
                return;
              }
              resolve(result && result.length > 0);
            }
          );
          // Important: Release the connection back to the pool
          connection.release();
        });
      });
    };

    // this is a function to insert user into database
    const createUser = () => {
      return new Promise((resolve, reject) => {
        // Hash password
        const hashedPassword = generatePassword(password);

        pool.getConnection((err, connection) => {
          if (err) {
            console.error("Error getting connection: ", err);
            return;
          }

          connection.query(
            "INSERT INTO Members (Email, Password, GroupID, FirstName, MiddleName, LastName, Address) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [
              email,
              hashedPassword,
              groupid,
              firstName,
              middleName,
              lastName,
              address,
            ],
            (err, result) => {
              if (err) {
                reject(err);
                return;
              }
              resolve(result);
            }
          );
          // Important: Release the connection back to the pool
          connection.release();
        });
      });
    };

    // Check if user exists
    const userExists = await checkExistingUser();

    if (userExists) {
      res.status(409).json({ error: "Account already exists" }); // 409 Conflict is more appropriate
      return;
    }

    // Create the user
    await createUser();

    // Log successful registration (consider adding user ID but not PII)
    console.log(`New user registered with email: ${email.substring(0, 3)}...`);

    // Return success response
    res
      .status(201)
      .json({ success: true, message: "Account created successfully!" });
    return;
  } catch (error) {
    console.error("Error in signup process:", error);
    res.status(500).json({ error: "Signup failed" });
    return;
  }
});
app.delete("/api/items/:itemId", (req, res) => {
  const { itemId } = req.params;

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting connection:", err);
      return res.status(500).json({ error: "Database connection error." });
    }

    connection.beginTransaction((err) => {
      if (err) {
        connection.release();
        return res.status(500).json({ error: "Transaction initiation error." });
      }

      // Delete from Books table
      const deleteBookQuery = `DELETE FROM Books WHERE ISBN = ?`;
      connection.query(deleteBookQuery, [itemId], (err) => {
        if (err) {
          return connection.rollback(() => {
            connection.release();
            console.error("Error deleting book:", err);
            res.status(500).json({ error: "Failed to delete book." });
          });
        }

        // Delete from ItemTypes table
        const deleteItemTypeQuery = `DELETE FROM ItemTypes WHERE ItemID = ?`;
        connection.query(deleteItemTypeQuery, [itemId], (err) => {
          if (err) {
            return connection.rollback(() => {
              connection.release();
              console.error("Error deleting item type:", err);
              res.status(500).json({ error: "Failed to delete item type." });
            });
          }

          // Delete from Items table
          const deleteItemQuery = `DELETE FROM Items WHERE ItemID = ?`;
          connection.query(deleteItemQuery, [itemId], (err) => {
            if (err) {
              return connection.rollback(() => {
                connection.release();
                console.error("Error deleting item:", err);
                res.status(500).json({ error: "Failed to delete item." });
              });
            }

            connection.commit((err) => {
              if (err) {
                return connection.rollback(() => {
                  connection.release();
                  console.error("Commit error:", err);
                  res.status(500).json({ error: "Transaction commit error." });
                });
              }

              connection.release();
              res.status(200).json({ success: true, message: "Item deleted successfully!" });
            });
          });
        });
      });
    });
  });
});
// ------------------------------------------------- END SIGN UP -------------------------------------------------

// ------------------------------------------------- BEGIN LOGIN -------------------------------------------------
app.post("/api/login", async (req, res) => {
  // get Email and Password from request body
  // sorry about the capital? capitol? (idk how to spell that) variable names
  // just matching how its stored in the database so I don't get confused
  const { email, password } = req.body;

  // validation check same as signup api
  if (!email || !password) {
    res.status(400).json({ error: "Email & Password are required." });
    return;
  }

  // no need for email validation here b/c it should already have happened when
  // it got inserted into database

  try {
    // Find user by email, this an async function definition that returns promise
    const findMember = () => {
      return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
          if (err) {
            console.error("Error getting connection: ", err);
            return;
          }

          connection.query(
            "SELECT * FROM Members WHERE Email = ? LIMIT 1",
            [email],
            (err, results) => {
              if (err) {
                reject(err);
                return;
              }
              // If no user found or multiple users somehow found (shouldn't happen with unique emails)
              if (!results || results.length !== 1) {
                resolve(null);
                return;
              }
              // Return the user data
              resolve(results[0]);
            }
          );
          // Important: Release the connection back to the pool
          connection.release();
        });
      });
    };

    // Find the member
    const member = await findMember();

    // If no user found, return error (don't specify whether email or password is wrong for security)
    if (!member) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // assuming member found, grab their password
    const storedPassword = member.Password;

    // Split the stored password into salt and hash
    const [salt, storedHash] = storedPassword.split(":");

    if (validPassword(password, storedHash, salt)) {
      // Password is valid, create user session

      // debug check
      //console.log("Member ID from database:", member.ID); // Check the value

      // Ensure this line runs after successful authentication
      req.session.memberID = member.MemberID;
      req.session.groupID = member.GroupID;

      // just work you way up through app.ts, auth.ts, api.ts, layout.tsx, then wherever
      req.session.firstName = member.FirstName;
      req.session.middleName = member.MiddleName;
      req.session.lastName = member.LastName;
      req.session.address = member.Address;

      // Debug check
      //console.log("Session after setting memberID:", req.session);
      //console.log("memberID in session:", req.session.memberID);

      // Explicitly save the session to ensure it's stored
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ error: "Failed to create session" });
        }

        // Return success response
        res.json({
          success: true,
          message: "Login successful",
        });
      });
    } else {
      // Password is invalid
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }
  } catch (error) {
    console.error("Error in login process:", error);
    res.status(500).json({ error: "Login failed" });
    return;
  }
});
// ------------------------------------------------- END LOGIN -------------------------------------------------

// ------------------------------------------------- BEGIN LOGOUT -------------------------------------------------
app.delete("/logout", (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        res.status(400).send("Unable to log out");
      } else {
        // Clear the session cookie
        res.clearCookie("connect.sid");
        res.status(200).send("Logout successful");
      }
    });
  } else {
    res.status(200).send("No session to log out from");
  }
});

// ------------------------------------------------- END LOGOUT -------------------------------------------------

app.use(compression());
app.disable("x-powered-by");

(async () => {
  if (DEVELOPMENT) {
    console.log("Starting development server");
    const viteDevServer = await import("vite").then((vite) =>
      vite.createServer({
        server: { middlewareMode: true },
      })
    );
    app.use(viteDevServer.middlewares);
    app.use(async (req, res, next) => {
      try {
        const source = await viteDevServer.ssrLoadModule("./server/app.ts");
        return await source.app(req, res, next);
      } catch (error) {
        if (typeof error === "object" && error instanceof Error) {
          viteDevServer.ssrFixStacktrace(error);
        }
        next(error);
      }
    });
  } else {
    console.log("Starting production server");
    app.use(
      "/assets",
      express.static("build/client/assets", { immutable: true, maxAge: "1y" })
    );
    app.use(express.static("build/client", { maxAge: "1h" }));
    app.use(await import(BUILD_PATH).then((mod) => mod.app));
  }

  app.use(morgan("tiny"));

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
})();
