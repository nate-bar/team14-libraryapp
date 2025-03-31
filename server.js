// server.js
// disable typescript checks
// @ts-nocheck
import compression from "compression";
import express from "express";
import morgan from "morgan";
import mysql from "mysql"; // mysql package, should be self explanitory
import crypto from "crypto"; // for salting and hashing passwords
import session from "express-session"; // for session storage
import path from "path";
import multer from "multer";
// Load environment variables
import dotenv from "dotenv";
dotenv.config();

const upload = multer({ storage: multer.memoryStorage() });

// Short-circuit the type-checking of the built output.
const BUILD_PATH = "./build/server/index.js";
const DEVELOPMENT = process.env.NODE_ENV === "development";
const PORT = Number.parseInt(process.env.PORT || "3000");

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
app.get("/api/search", (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res
      .status(400)
      .json({ success: false, message: "Missing search query" });
  }

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting connection:", err);
      return res
        .status(500)
        .json({ success: false, message: "Database connection error" });
    }

    const searchQuery = `
      SELECT
        b.ISBN AS ItemID,
        b.Title,
        'Book' AS TypeName,
        'Available' AS Status,
        TO_BASE64(b.Photo) AS PhotoBase64
      FROM books b
      WHERE b.Title LIKE ?
      
      UNION ALL
      
      SELECT
        m.MediaID AS ItemID,
        i.Title,
        'Media' AS TypeName,
        i.Status,
        TO_BASE64(m.Photo) AS PhotoBase64
      FROM media m
      JOIN items i ON m.MediaID = i.ItemID
      WHERE i.Title LIKE ?
      
      UNION ALL
      
      SELECT
        d.DeviceID AS ItemID,
        d.DeviceName AS Title,
        'Device' AS TypeName,
        'Available' AS Status,
        TO_BASE64(d.Photo) AS PhotoBase64
      FROM itemdevice d
      WHERE d.DeviceName Like ?;
      `;

    connection.query(
      searchQuery,
      [`%${query}%`, `%${query}%`, `%${query}%`],
      (err, results) => {
        connection.release();
        if (err) {
          console.error("Error executing search query:", err.stack);
          return res
            .status(500)
            .json({ success: false, message: "Error searching items" });
        }

        res.json(results);
      }
    );
  });
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
        connection.release();
        if (err) {
          console.error("Error executing search query:", err.stack);
          return res
            .status(500)
            .json({ success: false, message: "Error searching items" });
        }
        res.json(results);
      }
    );
  });
});

app.get("/api/genres", (req, res) => {
  pool.query(`SELECT * FROM genres`, (err, results) => {
    if (err) {
      console.error("Error executing query:", +err.stack);
      res.status(500).send("Error fetching genres");
      return;
    }
    res.json(results);
  });
});

const checkLimits = (memberID, itemIDs, connection) => {
  return new Promise((resolve, reject) => {
    // Step 1: Get member limits
    connection.query(
      `SELECT mg.ItemLimit, mg.MediaItemLimit, mg.DeviceLimit 
       FROM Members m 
       JOIN MemberGroups mg ON m.GroupID = mg.GroupID 
       WHERE m.MemberID = ?`,
      [memberID],
      (err, memberLimits) => {
        if (err) {
          console.error("Error fetching member limits:", err);
          return reject(new Error("Failed to retrieve member limits"));
        }

        if (memberLimits.length === 0) {
          return reject(new Error("Member not found or has no group limits"));
        }

        const limits = memberLimits[0];
        console.log("Member limits:", limits);

        // Step 2: Count currently borrowed items
        connection.query(
          `SELECT COUNT(*) as totalBorrowed
           FROM borrowrecord 
           WHERE MemberID = ? AND ReturnDate IS NULL`,
          [memberID],
          (err, totalResults) => {
            if (err) {
              console.error("Error counting total borrows:", err);
              return reject(new Error("Failed to count current borrows"));
            }

            const totalBorrowed = totalResults[0].totalBorrowed || 0;

            // Step 3: Count borrowed items by type
            connection.query(
              `SELECT it.TypeName, COUNT(*) as count
               FROM borrowrecord br
               JOIN Items i ON br.ItemID = i.ItemID
               JOIN ItemTypes it ON i.ItemID = it.ItemID
               WHERE br.MemberID = ? AND br.ReturnDate IS NULL
               GROUP BY it.TypeName`,
              [memberID],
              (err, typeResults) => {
                if (err) {
                  console.error("Error counting borrows by type:", err);
                  return reject(new Error("Failed to count borrows by type"));
                }

                // Convert results to counts by type
                let booksBorrowed = 0;
                let mediaBorrowed = 0;
                let deviceBorrowed = 0;

                typeResults.forEach((row) => {
                  if (row.TypeName === "Book") booksBorrowed = row.count;
                  if (row.TypeName === "Media") mediaBorrowed = row.count;
                  if (row.TypeName === "Device") deviceBorrowed = row.count;
                });

                console.log(
                  `Current borrows: Total: ${totalBorrowed}, Books: ${booksBorrowed}, Media: ${mediaBorrowed}, Devices: ${deviceBorrowed}`
                );

                // Step 4: Get types of items being checked out
                connection.query(
                  `SELECT it.TypeName
                   FROM Items i 
                   JOIN ItemTypes it ON i.ItemID = it.ItemID 
                   WHERE i.ItemID IN (?)`,
                  [itemIDs],
                  (err, checkoutItems) => {
                    if (err) {
                      console.error("Error getting checkout item types:", err);
                      return reject(new Error("Failed to get item types"));
                    }

                    // Count new items by type
                    const newBooks = checkoutItems.filter(
                      (i) => i.TypeName === "Book"
                    ).length;
                    const newMedia = checkoutItems.filter(
                      (i) => i.TypeName === "Media"
                    ).length;
                    const newDevices = checkoutItems.filter(
                      (i) => i.TypeName === "Device"
                    ).length;

                    console.log(
                      `New checkouts: Books: ${newBooks}, Media: ${newMedia}, Devices: ${newDevices}`
                    );

                    // Ensure limits exist
                    const bookLimit = limits.ItemLimit;
                    const mediaLimit = limits.MediaLimit;
                    const deviceLimit = limits.DeviceLimit;

                    if (booksBorrowed + newBooks > bookLimit) {
                      return reject(
                        new Error(
                          `Checkout would exceed book limit of ${bookLimit}`
                        )
                      );
                    }

                    if (mediaBorrowed + newMedia > mediaLimit) {
                      return reject(
                        new Error(
                          `Checkout would exceed media limit of ${mediaLimit}`
                        )
                      );
                    }

                    if (deviceBorrowed + newDevices > deviceLimit) {
                      return reject(
                        new Error(
                          `Checkout would exceed device limit of ${deviceLimit}`
                        )
                      );
                    }

                    // All checks passed
                    resolve(true);
                  }
                );
              }
            );
          }
        );
      }
    );
  });
};

app.post("/api/return", (req, res) => {
  try {
    const { items } = req.body;

    console.log(items);

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: "Invalid or empty items array" });
      return;
    }

    pool.getConnection((err, connection) => {
      if (err) {
        console.error("Error getting connection:", err);
        res.status(500).json({ error: "Database connection error" });
        return;
      }

      connection.beginTransaction((err) => {
        if (err) {
          connection.release();
          res.status(500).json({ error: "Transaction error" });
          return;
        }

        const returnedItems = [];
        let hasErrors = false;

        const returnItem = (index) => {
          if (index >= items.length || hasErrors) {
            if (hasErrors) {
              connection.rollback(() => {
                connection.release();
                res.status(500).json({
                  error: "Failed to return some items",
                  returned: returnedItems,
                });
              });
            } else {
              connection.commit((err) => {
                if (err) {
                  connection.rollback(() => {
                    connection.release();
                    res.status(500).json({ error: "Failed to return item" });
                    return;
                  });
                } else {
                  connection.release();
                  res.status(200).json({
                    success: true,
                    message: `${returnedItems.length} Items returned successfully`,
                    items: returnedItems,
                  });
                }
              });
            }
            return;
          }

          const itemid = items[index];

          connection.query(
            `UPDATE borrowrecord SET ReturnDate = NOW() WHERE ItemID = ? AND ReturnDate IS NULL`,
            [itemid],
            (err, returnResult) => {
              if (err) {
                console.error(`Error returning Item ${itemid}:`, err);
                hasErrors = true;
                returnItem(index + 1);
                return;
              }

              // update item status
              connection.query(
                `UPDATE Items SET Status = 'Available', LastUpdated = NOW() WHERE ItemID = ?`,
                [itemid],
                (err, updateResult) => {
                  if (err) {
                    console.error(`Error updating Item ${itemid}:`, err);
                    hasErrors = true;
                  } else {
                    returnedItems.push(itemid);
                  }
                  returnItem(index + 1);
                }
              );
            }
          );
        };

        returnItem(0);
      });
    });
  } catch (err) {
    console.error("Checkout error:", err);
    res.status(500).json({ error: "Server error processing checkout" });
    return;
  }
});

app.post("/api/checkout", (req, res) => {
  try {
    const { items, memberID } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: "Invalid or empty items array" });
      return;
    }

    console.log("MemberID: ", memberID);
    console.log("Items: ", items);

    // first, grab connection for sure cause will have to make multiple queries
    pool.getConnection((err, connection) => {
      if (err) {
        console.error("Error getting connection:", err);
        res.status(500).json({ error: "Database connection error" });
        return;
      }

      // First, check if borrowing limits would be exceeded
      checkLimits(memberID, items, connection)
        .then(() => {
          // If limits check passes, begin the transaction
          connection.beginTransaction((err) => {
            // ERROR HANDLING
            if (err) {
              connection.release();
              res.status(500).json({ error: "Transaction error" });
              return;
            }

            // Array for tracking processed items
            const processedItems = [];
            let hasErrors = false;

            // begin processing each item
            const processItem = (index) => {
              if (index >= items.length || hasErrors) {
                if (hasErrors) {
                  connection.rollback(() => {
                    connection.release();
                    res.status(500).json({
                      error: "Failed to process some items",
                      processed: processedItems,
                    });
                  });
                } else {
                  connection.commit((err) => {
                    if (err) {
                      connection.rollback(() => {
                        connection.release();
                        res
                          .status(500)
                          .json({ error: "Failed to commit transaction" });
                        return;
                      });
                    } else {
                      connection.release();
                      res.status(200).json({
                        success: true,
                        message: `${processedItems.length} Items checked out successfully`,
                        items: processedItems,
                      });
                    }
                  });
                }
                return;
              }

              const itemid = items[index];

              connection.query(
                `INSERT INTO borrowrecord (MemberID, ItemID) VALUES (?, ?)`,
                [memberID, itemid],
                (err, insertResult) => {
                  if (err) {
                    console.error(`Error inserting item ${itemid}:`, err);
                    hasErrors = true;
                    processItem(index + 1);
                    return;
                  }
                  // update item status
                  connection.query(
                    `UPDATE Items SET Status = 'Checked Out', LastUpdated = NOW(), TimesBorrowed = TimesBorrowed + 1 WHERE ItemID = ?`,
                    [itemid],
                    (err, updateResult) => {
                      if (err) {
                        console.error(`Error updating Item ${itemid}:`, err);
                        hasErrors = true;
                      } else {
                        processedItems.push(itemid);
                      }
                      processItem(index + 1);
                    }
                  );
                }
              );
            };

            // Start processing the first item
            processItem(0);
          });
        })
        .catch((error) => {
          // If limits check fails, return error and release connection
          connection.release();
          res.status(400).json({ error: error.message });
        });
    });
  } catch (err) {
    console.error("Checkout error:", err);
    res.status(500).json({ error: "Server error processing checkout" });
    return;
  }
});

/*
app.get("/api/items", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting connection: ", err);
      return res.status(500).send("Error connecting to the database");
    }

    const query = `
      SELECT 
        b.ISBN AS ItemID, 
        b.Title, 
        'Book' AS TypeName, 
        'Available' AS Status, 
        TO_BASE64(b.Photo) AS PhotoBase64,
        b.GenreID AS GenreID -- Include GenreID from books table
      FROM books b

      UNION ALL

      SELECT 
        m.MediaID AS ItemID, 
        i.Title, 
        'Media' AS TypeName, 
        i.Status, 
        TO_BASE64(m.Photo) AS PhotoBase64,
        m.GenreID AS GenreID -- Include GenreID from media table
      FROM media m
      JOIN items i ON m.MediaID = i.ItemID

      UNION ALL

      SELECT 
        d.DeviceID AS ItemID, 
        d.DeviceName AS Title, 
        'Device' AS TypeName, 
        'Available' AS Status, 
        NULL AS PhotoBase64, -- Devices may not have photos
        NULL AS GenreID -- Devices do not have a GenreID
      FROM itemdevice d;
    `;

    connection.query(query, (err, results) => {
      connection.release(); // Release the connection back to the pool
      if (err) {
        console.error("Error executing query: ", err.stack);
        return res.status(500).send("Error fetching items");
      }

      res.json(results);
    });
  });
});
*/
// RETURNS ALL ITEMS AND THEIR TYPE
app.get("/api/items", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting connection: ", err);
      return;
    }

    // use connection for queries
    connection.query(
      `SELECT 
        i.ItemID, 
        i.Title, 
        it.TypeName, 
        i.Status, 
        i.LastUpdated, 
        i.CreatedAt, 
        i.TimesBorrowed, 
        TO_BASE64(i.Photo) AS Photo, 
        g.GenreID, 
        g.GenreName 
      FROM Items i
      INNER JOIN ItemTypes it ON it.ItemID=i.ItemID
      LEFT JOIN Books b ON b.ISBN = it.ISBN
      LEFT JOIN Media m ON m.MediaID = it.MediaID
      LEFT JOIN Genres g ON b.GenreID = g.GenreID OR m.GenreID = g.GenreID`,
      (err, results) => {
        connection.release();
        if (err) {
          console.error("Error executing query: " + err.stack);
          res.status(500).send("Error fetching items");
          return;
        }
        res.json(results);
      }
    );
  });
});

app.get("/api/borroweditems/:memberID", (req, res) => {
  const { memberID } = req.params;

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting connection:", err);
      return res.status(500).json({ error: "Database connection error" });
    }

    connection.query(
      `SELECT Items.ItemID, Items.Title, BorrowRecord.DueDate, BorrowRecord.MemberID FROM BorrowRecord INNER JOIN Items ON BorrowRecord.ItemID = Items.ItemID WHERE BorrowRecord.MemberID = ? AND ReturnDate IS NULL`,
      [memberID],
      (err, results) => {
        connection.release();
        if (err) {
          console.error("Error fetching book detail:", err);
          return res.status(500).json({ error: "Database query error" });
        }

        if (results.length === 0) {
          return res.status(404).json({ error: "Book not found" });
        }

        res.json(results);
      }
    );
  });
});

/***********************************
 *****RETURNS DETAILED INFORMATION**
 *****BASED ON ITEM TYPE************
 ***********************************/
app.get("/api/itemdetail/:itemid", (req, res) => {
  const { itemid } = req.params;

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting connection:", err);
      res.status(500).json({ error: "Database connection error" });
      return;
    }

    connection.query(
      `SELECT itemtypes.TypeName FROM itemtypes  WHERE itemtypes.ItemID = ?`,
      [itemid],
      (err, typeResult) => {
        if (err) {
          console.error("Error fetching item type:", err);
          connection.release();
          res.status(500).json({ error: "Database query error" });
          return;
        }

        if (!typeResult || typeResult.length === 0) {
          connection.release();
          res.status(404).json({ error: "Item type not found" });
          return;
        }

        const currentItem = typeResult[0];
        const currentType = currentItem.TypeName;
        let q;

        if (currentType === "Book") {
          q = `SELECT i.ItemID, TO_BASE64(i.Photo) AS Photo, i.Title, i.Status, it.TypeName, b.Authors, b.Publisher, b.PublicationYear, it.ISBN, g.GenreName, g.GenreID
       FROM Items i
       INNER JOIN ItemTypes it ON it.ItemID = i.ItemID
       INNER JOIN Books b ON it.ISBN = b.ISBN
       INNER JOIN Genres g ON b.GenreID = g.GenreID
       WHERE i.ItemID = ? AND it.TypeName = 'Book'`;
        } else if (currentType === "Media") {
          q = `SELECT i.ItemID, TO_BASE64(i.Photo) AS Photo, i.Title, i.Status, it.TypeName, im.Director, im.Leads, im.ReleaseYear, it.MediaID, g.GenreName, g.GenreID, l.LanguageID, l.Language
       FROM Items i
       INNER JOIN ItemTypes it ON it.ItemID = i.ItemID
       INNER JOIN Media im ON it.MediaID = im.MediaID
       INNER JOIN Genres g ON im.GenreID = g.GenreID
       INNER JOIN Languages l ON im.LanguageID = l.LanguageID
       WHERE i.ItemID = ? AND it.TypeName = 'Media'`;
        } else if (currentType === "Device") {
          q = `SELECT i.ItemID, TO_BASE64(i.Photo) AS Photo, i.Title, i.Status, it.TypeName, id.DeviceID, id.DeviceType, id.Manufacturer FROM Items i INNER JOIN ItemTypes it ON it.ItemID = i.ItemID
      INNER JOIN ItemDevice id ON it.DeviceID = id.DeviceID
      WHERE i.ItemID = ? AND it.TypeName = 'Device'`;
        } else {
          connection.release();
          res.status(400).json({ error: `Unknown item type: ${currentType}` });
          return;
        }

        connection.query(q, [itemid], (err, results) => {
          connection.release();

          if (err) {
            console.error("Error fetching details", err);
            res.status(500).json({ error: "Database query error" });
            return;
          }

          if (results.length === 0) {
            return res.status(404).json({ error: "Item not found" });
          }

          res.json(results[0]);
        });
      }
    );
  });
});

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------- SHOULD NOT HAVE TO GO BELOW THIS LINE ------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------------------------------------

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
              connection.release();

              if (err) {
                reject(err);
                return;
              }
              resolve(result && result.length > 0);
            }
          );
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
              connection.release();
              if (err) {
                reject(err);
                return;
              }
              resolve(result);
            }
          );
        });
      });
    };

    // Check if user exists
    const userExists = await checkExistingUser();

    if (userExists) {
      res.status(409).json({ error: "Account already exists" });
      return;
    }

    // Create the user
    await createUser();

    // Log successful registration
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
              connection.release();
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
