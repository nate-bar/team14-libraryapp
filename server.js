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
import cron from "node-cron";

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

//payoverdue.tsx
// Get overdue amount for a member
app.get("/api/fines/:memberid", (req, res) => {
  const memberID = req.params.memberid;
  pool.query(
    "SELECT SUM(FineAmount - PaymentAmount) AS TotalDue FROM paymenthistory WHERE MemberID = ? AND (FineAmount > PaymentAmount OR PaymentAmount = 0)",
    [memberID],
    (err, results) => {
      if (err) {
        console.error("Error executing query: " + err.stack);
        res.status(500).send("Error fetching overdue amount");
        return;
      }
      const totalDue = results[0].TotalDue || 0;
      res.json({ FineAmount: totalDue });
    }
  );
});

// Handle payments for overdue items
app.post("/api/pay", (req, res) => {
  const { memberID, amount } = req.body;
  const paymentAmount = parseFloat(amount);

  if (isNaN(paymentAmount) || paymentAmount <= 0) {
    return res.status(400).json({ success: false, message: "Invalid payment amount" });
  }

  // Get a connection from the pool
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting DB connection:", err);
      return res
        .status(500)
        .json({ success: false, message: "Payment processing error" });
    }

    // Start a transaction
    connection.beginTransaction(err => {
      if (err) {
        connection.release();
        console.error("Error starting transaction:", err);
        return res.status(500).json({ success: false, message: "Payment processing error" });
      }

      // First, get all unpaid fines for this member
      connection.query(
        "SELECT PaymentID, FineAmount, PaymentAmount FROM paymenthistory WHERE MemberID = ? AND FineAmount > PaymentAmount ORDER BY CreatedAt ASC",
        [memberID],
        (err, results) => {
          if (err) {
            return connection.rollback(() => {
              connection.release();
              console.error("Error fetching fines:", err);
              res.status(500).json({ success: false, message: "Payment processing error" });
            });
          }

          let remainingPayment = paymentAmount;
          const updates = [];

          for (const fine of results) {
            if (remainingPayment <= 0) break;

            const outstanding = fine.FineAmount - fine.PaymentAmount;
            const appliedPayment = Math.min(outstanding, remainingPayment);

            updates.push(
              new Promise((resolve, reject) => {
                connection.query(
                  "UPDATE paymenthistory SET PaymentAmount = PaymentAmount + ? WHERE PaymentID = ?",
                  [appliedPayment, fine.PaymentID],
                  err => {
                    if (err) reject(err);
                    else resolve();
                  }
                );
              })
            );

            remainingPayment -= appliedPayment;
          }

          Promise.all(updates)
            .then(() => {
              connection.commit(err => {
                connection.release();
                if (err) {
                  return connection.rollback(() => {
                    connection.release();
                    console.error("Error committing transaction:", err);
                    res.status(500).json({ success: false, message: "Payment processing error" });
                  });
                }

                connection.release();
                res.json({ success: true, remainingBalance: remainingPayment });
              });
            })
            .catch(err => {
              connection.rollback(() => {
                connection.release();
                console.error("Error updating payments:", err);
                res.status(500).json({ success: false, message: "Payment processing error" });
              });
            });
        }
      );
    });
  });
});

//shows borrowing history for a specific member
app.get("/api/borrowing-history/:memberid", (req, res) => {
  const memberId = req.params.memberid;

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Database connection error:", err);
      return res.status(500).json({ error: "Database connection error" });
    }
    connection.query(
      `SELECT 
    rr.ReturnID, 
    rr.MemberID, 
    rr.ItemID, 
    rr.BorrowDate, 
    rr.DueDate, 
    rr.ReturnDate, 
    rr.FineAccrued, 
    i.Title, 
    it.TypeName 
FROM 
    returnrecord rr 
INNER JOIN 
    Items i ON rr.ItemID = i.ItemID 
INNER JOIN 
    ItemTypes it ON i.ItemID = it.ItemID
WHERE 
    rr.MemberID = ?`,
      [memberId],
      (err, results) => {
        connection.release();

        if (err) {
          return res.status(500).json({ error: "Database query error" });
        }

        if (results.length === 0) {
          return res.status(404).json({ error: "Borrowing history not found" });
        }

        res.json(results);
      }
    );
  });
});

// returns * from Members table
app.get("/api/members", (req, res) => {
  pool.query("SELECT * FROM Members", (err, results) => {
    if (err) {
      console.error("Error executing query: " + err.stack);
      res.status(500).send("Error fetching users");
      return;
    }
    res.json(results);
  });
});

// Fetch notifications for a specific member
app.get("/api/notifications/:memberid", (req, res) => {
  const memberId = req.params.memberid;
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Database connection error:", err);
      return res.status(500).json({ error: "Database connection error" });
    }
    connection.query(
      "SELECT id, message, type, created_at, is_read, BorrowID FROM notifications WHERE MemberID = ? ORDER BY created_at DESC",
      [memberId],
      (err, results) => {
        connection.release();

        if (err) {
          return res.status(500).json({ error: "Database query error" });
        }

        if (results.length === 0) {
          return res.status(404).json({ error: "Member not found" });
        }
        console.log("Fetched notifications for memberID:", memberId);
        console.table(results); // Nicely formats the output in the console

        res.json(results); // Send the response with multiple notifications
      }
    );
  });
});

// gets user borrowed items view
app.get("/api/user-borrowed-items-report", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting connection:", err);
      return res.status(500).json({ error: "Database connection error." });
    }

    const query = "SELECT * FROM user_borrowed_items_report";

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

function handleQuantityInserts(
  title,
  photo,
  createdBy,
  typename,
  typeID,
  callback
) {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("DB Connection Error:", err);
      return callback({ error: "DB connection error", details: err.message });
    }

    // Begin transaction to ensure data consistency
    connection.beginTransaction((err) => {
      if (err) {
        connection.release();
        console.error("Transaction Error:", err);
        return callback({ error: "Transaction error", details: err.message });
      }

      connection.query(
        `INSERT INTO Items (Title, Photo, CreatedBy) VALUES (?, ?, ?)`,
        [title, photo, createdBy],
        (err, results) => {
          if (err) {
            connection.rollback(() => {
              connection.release();
            });
            console.error("Items Insert Error:", err);
            return callback({
              error: "Failed to insert item",
              details: err.message,
            });
          }

          // Get the inserted item ID
          const returnedItemID = results.insertId;
          let query;

          if (typename === "Book") {
            query = `INSERT INTO ItemTypes (ItemID, TypeName, ISBN) VALUES (?, ?, ?)`;
          } else if (typename === "Media") {
            query = `INSERT INTO ItemTypes (ItemID, TypeName, MediaID) VALUES (?, ?, ?)`;
          } else {
            connection.rollback(() => {
              connection.release();
            });
            return callback({ error: "Invalid type name" });
          }

          connection.query(
            query,
            [returnedItemID, typename, typeID],
            (err, results) => {
              if (err) {
                connection.rollback(() => {
                  connection.release();
                });
                console.error("ItemTypes Insert Error:", err);
                return callback({
                  error: "Failed to insert item type",
                  details: err.message,
                });
              }

              // Commit the transaction
              connection.commit((err) => {
                if (err) {
                  connection.rollback(() => {
                    connection.release();
                  });
                  console.error("Commit Error:", err);
                  return callback({
                    error: "Failed to commit transaction",
                    details: err.message,
                  });
                }

                // Release the connection back to the pool
                connection.release();

                // Success
                return callback(null, {
                  success: true,
                  itemID: returnedItemID,
                  message: "Item inserted successfully",
                });
              });
            }
          );
        }
      );
    });
  });
}

app.post("/api/insert/:typename", upload.single("photo"), (req, res) => {
  const typename = req.params.typename;
  const item = req.body;
  const photo = req.file ? req.file.buffer : null;

  if (typename === "Book") {
    console.log("Received Book Data:", {
      title: item.title,
      isbn: item.isbn,
      authors: item.authors,
      publisher: item.publisher,
      publicationYear: item.publicationyear,
      genreId: item.genreid,
      languageId: item.languageid,
      summary: item.summary,
      createdby: item.createdby,
      quantity: item.quantity,
    });
    //console.log("Photo:", photo ? "Received" : "No photo");

    pool.getConnection((err, connection) => {
      if (err) {
        console.error("DB Connection Error:", err);
        return res
          .status(500)
          .json({ error: "DB connection error", details: err.message });
      }

      connection.beginTransaction((transactionErr) => {
        if (transactionErr) {
          connection.release();
          console.error("Transaction Begin Error:", transactionErr);
          return res.status(500).json({
            error: "Transaction error",
            details: transactionErr.message,
          });
        }

        connection.query(
          `INSERT INTO Items (Title, Photo, CreatedBy) VALUES (?, ?, ?)`,
          [item.title, photo, item.createdby],
          (itemErr, itemsResult) => {
            if (itemErr) {
              console.error("Items Insert Error:", {
                message: itemErr.message,
                sqlMessage: itemErr.sqlMessage,
                code: itemErr.code,
                sql: itemErr.sql,
              });

              return connection.rollback(() => {
                connection.release();
                res.status(500).json({
                  error: "Item insert failed",
                  details: itemErr.message,
                  sqlMessage: itemErr.sqlMessage,
                });
              });
            }

            const returnedItemID = itemsResult.insertId;
            console.log("Generated Item ID:", returnedItemID);

            connection.query(
              `INSERT INTO Books (ISBN, Authors, GenreID, Publisher, PublicationYear, LanguageID, Summary) VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [
                item.isbn,
                item.authors,
                item.genreid,
                item.publisher,
                item.publicationyear,
                item.languageid,
                item.summary,
              ],
              (bookErr, booksResult) => {
                if (bookErr) {
                  console.error("Books Insert Error:", {
                    message: bookErr.message,
                    sqlMessage: bookErr.sqlMessage,
                    code: bookErr.code,
                    sql: bookErr.sql,
                  });

                  return connection.rollback(() => {
                    connection.release();
                    res.status(500).json({
                      error: "Book insert failed",
                      details: bookErr.message,
                      sqlMessage: bookErr.sqlMessage,
                    });
                  });
                }

                console.log("Books Insert Result:", booksResult);

                connection.query(
                  `INSERT INTO ItemTypes (ItemID, TypeName, ISBN) VALUES (?, ?, ?)`,
                  [returnedItemID, typename, item.isbn],
                  (itemTypeErr, itResult) => {
                    if (itemTypeErr) {
                      console.error("ItemTypes Insert Error:", {
                        message: itemTypeErr.message,
                        sqlMessage: itemTypeErr.sqlMessage,
                        code: itemTypeErr.code,
                        sql: itemTypeErr.sql,
                      });

                      return connection.rollback(() => {
                        connection.release();
                        res.status(500).json({
                          error: "Item Types insert failed",
                          details: itemTypeErr.message,
                          sqlMessage: itemTypeErr.sqlMessage,
                        });
                      });
                    }

                    connection.commit((commitErr) => {
                      if (commitErr) {
                        console.error("Commit Error:", commitErr);
                        return connection.rollback(() => {
                          connection.release();
                          res.status(500).json({
                            error: "Commit error",
                            details: commitErr.message,
                          });
                        });
                      }

                      const insertPromises = [];

                      for (let i = 0; i < item.quantity - 1; i++) {
                        insertPromises.push(
                          new Promise((resolve, reject) => {
                            handleQuantityInserts(
                              item.title,
                              photo,
                              item.createdby,
                              typename,
                              item.isbn,
                              (err, result) => {
                                if (err) reject(err);
                                else resolve(result);
                              }
                            );
                          })
                        );
                      }

                      Promise.all(insertPromises)
                        .then((results) => {
                          connection.release();
                          res.status(201).json({
                            success: true,
                            message: `${item.quantity} copies of book added successfully!`,
                            itemId: returnedItemID,
                            additionalCopies: results,
                          });
                        })
                        .catch((error) => {
                          connection.release();
                          console.error(
                            "Error inserting additional copies:",
                            error
                          );
                          res.status(500).json({
                            error:
                              "Some additional copies could not be inserted",
                            details: error.message,
                          });
                        });
                    });
                  }
                );
              }
            );
          }
        );
      });
    });
  } else if (typename === "Media") {
    console.log("Received Media Data:", {
      title: item.title,
      director: item.director,
      leads: item.leads,
      releaseyear: item.releaseyear,
      genreid: item.genreid,
      languageid: item.languageid,
      format: item.format,
      rating: item.rating,
      createdby: item.createdby,
      quantity: item.quantity,
    });
    //console.log("Photo:", photo ? "Received" : "No photo");

    pool.getConnection((err, connection) => {
      if (err) {
        console.error("DB Connection Error:", err);
        return res
          .status(500)
          .json({ error: "DB connection error", details: err.message });
      }

      connection.beginTransaction((transactionErr) => {
        if (transactionErr) {
          connection.release();
          console.error("Transaction Begin Error:", transactionErr);
          return res.status(500).json({
            error: "Transaction error",
            details: transactionErr.message,
          });
        }

        connection.query(
          `INSERT INTO Items (Title, Photo, CreatedBy) VALUES (?, ?, ?)`,
          [item.title, photo, item.createdby],
          (itemErr, itemsResult) => {
            if (itemErr) {
              console.error("Items Insert Error:", {
                message: itemErr.message,
                sqlMessage: itemErr.sqlMessage,
                code: itemErr.code,
                sql: itemErr.sql,
              });

              return connection.rollback(() => {
                connection.release();
                res.status(500).json({
                  error: "Item insert failed",
                  details: itemErr.message,
                  sqlMessage: itemErr.sqlMessage,
                });
              });
            }

            const returnedItemID = itemsResult.insertId;
            console.log("Generated Item ID:", returnedItemID);

            connection.query(
              `INSERT INTO Media (MediaID, Director, Leads, ReleaseYear, GenreID, LanguageID, Format, Rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                item.mediaid,
                item.director,
                item.leads,
                item.releaseyear,
                item.genreid,
                item.languageid,
                item.format,
                item.rating,
              ],
              (mediaErr, mediaResults) => {
                if (mediaErr) {
                  console.error("Media Insert Error:", {
                    message: mediaErr.message,
                    sqlMessage: mediaErr.sqlMessage,
                    code: mediaErr.code,
                    sql: mediaErr.sql,
                  });

                  return connection.rollback(() => {
                    connection.release();
                    res.status(500).json({
                      error: "Media insert failed",
                      details: mediaErr.message,
                      sqlMessage: mediaErr.sqlMessage,
                    });
                  });
                }

                const returnedMediaID = mediaResults.insertId;
                console.log("Media Insert Result:", mediaResults);

                connection.query(
                  `INSERT INTO ItemTypes (ItemID, TypeName, MediaID) VALUES (?, ?, ?)`,
                  [returnedItemID, typename, returnedMediaID],
                  (itemTypeErr, itResult) => {
                    if (itemTypeErr) {
                      console.error("ItemTypes Insert Error:", {
                        message: itemTypeErr.message,
                        sqlMessage: itemTypeErr.sqlMessage,
                        code: itemTypeErr.code,
                        sql: itemTypeErr.sql,
                      });

                      return connection.rollback(() => {
                        connection.release();
                        res.status(500).json({
                          error: "Item Types insert failed",
                          details: itemTypeErr.message,
                          sqlMessage: itemTypeErr.sqlMessage,
                        });
                      });
                    }

                    connection.commit((commitErr) => {
                      if (commitErr) {
                        console.error("Commit Error:", commitErr);
                        return connection.rollback(() => {
                          connection.release();
                          res.status(500).json({
                            error: "Commit error",
                            details: commitErr.message,
                          });
                        });
                      }

                      const insertPromises = [];

                      for (let i = 0; i < item.quantity - 1; i++) {
                        insertPromises.push(
                          new Promise((resolve, reject) => {
                            handleQuantityInserts(
                              item.title,
                              photo,
                              item.createdby,
                              typename,
                              item.isbn,
                              (err, result) => {
                                if (err) reject(err);
                                else resolve(result);
                              }
                            );
                          })
                        );
                      }

                      Promise.all(insertPromises)
                        .then((results) => {
                          connection.release();
                          res.status(201).json({
                            success: true,
                            message: `${item.quantity} copies of book added successfully!`,
                            itemId: returnedItemID,
                            additionalCopies: results,
                          });
                        })
                        .catch((error) => {
                          connection.release();
                          console.error(
                            "Error inserting additional copies:",
                            error
                          );
                          res.status(500).json({
                            error:
                              "Some additional copies could not be inserted",
                            details: error.message,
                          });
                        });
                    });
                  }
                );
              }
            );
          }
        );
      });
    });
  } else if (typename === "Device") {
    console.log("Received Device Data:", {
      title: item.title,
      devicetype: item.devicetype,
      manufacturer: item.manufacturer,
      createdby: item.createdby,
    });
    //console.log("Photo:", photo ? "Received" : "No photo");

    pool.getConnection((err, connection) => {
      if (err) {
        console.error("DB Connection Error:", err);
        return res
          .status(500)
          .json({ error: "DB connection error", details: err.message });
      }

      connection.beginTransaction((transactionErr) => {
        if (transactionErr) {
          connection.release();
          console.error("Transaction Begin Error:", transactionErr);
          return res.status(500).json({
            error: "Transaction error",
            details: transactionErr.message,
          });
        }

        connection.query(
          `INSERT INTO Items (Title, Photo, createdBy) VALUES (?, ?, ?)`,
          [item.title, photo, item.createdby],
          (itemErr, itemsResult) => {
            if (itemErr) {
              console.error("Items Insert Error:", {
                message: itemErr.message,
                sqlMessage: itemErr.sqlMessage,
                code: itemErr.code,
                sql: itemErr.sql,
              });

              return connection.rollback(() => {
                connection.release();
                res.status(500).json({
                  error: "Item insert failed",
                  details: itemErr.message,
                  sqlMessage: itemErr.sqlMessage,
                });
              });
            }

            const returnedItemID = itemsResult.insertId;
            console.log("Generated Item ID:", returnedItemID);

            connection.query(
              `INSERT INTO ItemDevice (DeviceType, Manufacturer) VALUES (?, ?)`,
              [item.devicetype, item.manufacturer],
              (deviceErr, deviceResults) => {
                if (deviceErr) {
                  console.error("Media Insert Error:", {
                    message: deviceErr.message,
                    sqlMessage: deviceErr.sqlMessage,
                    code: deviceErr.code,
                    sql: deviceErr.sql,
                  });

                  return connection.rollback(() => {
                    connection.release();
                    res.status(500).json({
                      error: "Media insert failed",
                      details: deviceErr.message,
                      sqlMessage: deviceErr.sqlMessage,
                    });
                  });
                }
                const returnedDeviceID = deviceResults.insertId;
                console.log("Media Insert Result:", deviceResults);

                connection.query(
                  `INSERT INTO ItemTypes (ItemID, TypeName, DeviceID) VALUES (?, ?, ?)`,
                  [returnedItemID, typename, returnedDeviceID],
                  (itemTypeErr, itResult) => {
                    if (itemTypeErr) {
                      console.error("ItemTypes Insert Error:", {
                        message: itemTypeErr.message,
                        sqlMessage: itemTypeErr.sqlMessage,
                        code: itemTypeErr.code,
                        sql: itemTypeErr.sql,
                      });

                      return connection.rollback(() => {
                        connection.release();
                        res.status(500).json({
                          error: "Item Types insert failed",
                          details: itemTypeErr.message,
                          sqlMessage: itemTypeErr.sqlMessage,
                        });
                      });
                    }

                    connection.commit((commitErr) => {
                      if (commitErr) {
                        console.error("Commit Error:", commitErr);
                        return connection.rollback(() => {
                          connection.release();
                          res.status(500).json({
                            error: "Commit error",
                            details: commitErr.message,
                          });
                        });
                      }

                      connection.release();
                      return res.status(201).json({
                        success: true,
                        message: "Device added successfully!",
                        itemId: returnedItemID,
                      });
                    });
                  }
                );
              }
            );
          }
        );
      });
    });
  } else {
    res.status(400).json({ error: "Invalid type name" });
  }
});

app.post("/api/holdrequest", (req, res) => {
  const { itemid, memberid } = req.body;

  // quick validation of input
  if (!itemid || !memberid) {
    return res.status(400).json({ error: "ItemID and MemberID are required" });
  }

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("DB Connection Error:", err);
      return res
        .status(500)
        .json({ error: "DB connection error", details: err.message });
    }

    // perform check for duplicate entry
    connection.query(
      `SELECT * FROM holdrequest WHERE ItemID = ? AND MemberID = ?`,
      [itemid, memberid],
      (err, existingHolds) => {
        if (err) {
          connection.release();
          console.error("Hold check Error:", {
            message: err.message,
            sqlMessage: err.sqlMessage,
            code: err.code,
            sql: err.sql,
          });
          return res.status(500).json({
            error: "Failed to check existing hold requests",
            details: err.message,
          });
        }

        // return error message if hold exists
        if (existingHolds.length > 0) {
          connection.release();
          return res.status(409).json({
            error: "You already have a hold request for this item",
          });
        }

        // no existing hold, continue to inserting
        connection.query(
          `INSERT INTO holdrequest (ItemID, MemberID, CreatedAt) VALUES (?, ?, NOW())`,
          [itemid, memberid],
          (err, results) => {
            // release connection
            connection.release();

            if (err) {
              console.error("Hold request Error:", {
                message: err.message,
                sqlMessage: err.sqlMessage,
                code: err.code,
                sql: err.sql,
              });
              return res.status(500).json({
                error: "Failed to create hold request",
                details: err.message,
              });
            }

            // return success
            return res.status(201).json({
              success: true,
              message: "Hold request created successfully",
              requestId: results.insertId,
            });
          }
        );
      }
    );
  });
});

// gets row information for specific member
app.get("/api/profile/:memberid", (req, res) => {
  const memberId = req.params.memberid;

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Database connection error:", err);
      return res.status(500).json({ error: "Database connection error" });
    }

    connection.query(
      "SELECT m.FirstName, m.LastName, m.MiddleName, m.Email, m.PhoneNumber, m.BirthDate, m.Address, m.Balance, m.GroupID, mg.LendingPeriod, mg.ItemLimit, mg.MediaItemLimit, mg.DeviceLimit FROM Members m INNER JOIN membergroups mg ON mg.GroupID = m.GroupID WHERE MemberID = ?",
      [memberId],
      (err, results) => {
        connection.release();

        if (err) {
          return res.status(500).json({ error: "Database query error" });
        }

        if (results.length === 0) {
          return res.status(404).json({ error: "Member not found" });
        }

        const member = results[0];
        res.json({
          firstName: member.FirstName,
          lastName: member.LastName,
          middleName: member.MiddleName,
          email: member.Email,
          phoneNumber: member.PhoneNumber,
          birthDate: member.BirthDate,
          address: member.Address,
          balance: member.Balance,
          memberGroup: member.GroupID,
          lendingPeriod: member.LendingPeriod,
          itemLimit: member.ItemLimit,
          mediaItemLimit: member.MediaItemLimit,
          deviceLimit: member.DeviceLimit,
        });
      }
    );
  });
});

// edit profile information
app.put("/api/profile/edit", async (req, res) => {
  const profile = req.body;
  console.log(profile);

  // validation check to ensure email was passed to server
  if (!profile.email) {
    return res.status(400).json({ error: "Email is required" });
  }

  // double up email regex cause why not
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(profile.email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  try {
    // Check if email or phone already exists for a DIFFERENT user
    const checkExistingUser = () => {
      return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
          if (err) {
            console.error("Error getting connection: ", err);
            reject(err);
            return;
          }

          // Check if another user has this email or phone
          connection.query(
            "SELECT 1 FROM Members WHERE (Email = ? OR PhoneNumber = ?) AND MemberID != ? LIMIT 1",
            [profile.email, profile.phoneNumber, profile.memberID],
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

    // Update user function
    const updateUser = () => {
      return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
          if (err) {
            console.error("Error getting connection: ", err);
            reject(err);
            return;
          }

          connection.query(
            `UPDATE Members 
             SET FirstName = ?, 
                 MiddleName = ?, 
                 LastName = ?, 
                 Email = ?, 
                 PhoneNumber = ?, 
                 BirthDate = ?, 
                 Address = ?
             WHERE MemberID = ?`,
            [
              profile.firstName,
              profile.middleName,
              profile.lastName,
              profile.email,
              profile.phoneNumber,
              profile.birthDate,
              profile.address,
              profile.memberID,
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

    // Check if email/phone already exists for another user
    const userExists = await checkExistingUser();
    if (userExists) {
      return res.status(409).json({
        error: "Email or phone number already in use by another account",
      });
    }

    // Update the user
    await updateUser();

    // Return success response
    return res
      .status(200)
      .json({ success: true, message: "Account updated successfully!" });
  } catch (error) {
    console.error("Error in update process:", error);
    return res.status(500).json({ error: "Update failed" });
  }
});

// edit item information
app.post("/api/edit/:typename", upload.single("Photo"), (req, res) => {
  const typename = req.params.typename;
  const item = req.body;
  let Photo = null;

  if (req.file) {
    // A new file was uploaded
    Photo = req.file.buffer;
  } else if (typeof item.Photo === "string" && item.Photo) {
    // The original photo was sent back as base64
    Photo = Buffer.from(item.Photo, "base64");
  }

  if (typename === "Book") {
    console.log("Received Book Data:", {
      ItemID: item.ItemID,
      Title: item.Title,
      ISBN: item.ISBN,
      Authors: item.Authors,
      Publisher: item.Publisher,
      PublicationYear: item.PublicationYear,
      GenreID: item.GenreID,
      LanguageID: item.LanguageID,
      Summary: item.Summary,
      UpdatedBy: item.UpdatedBy,
      newISBN: item.newISBN,
    });
    //console.log("Photo:", Photo ? "Received" : "No photo");

    pool.getConnection((err, connection) => {
      if (err) {
        console.error("DB Connection Error:", err);
        return res
          .status(500)
          .json({ error: "DB connection error", details: err.message });
      }

      connection.beginTransaction((transactionErr) => {
        if (transactionErr) {
          connection.release();
          console.error("Transaction Begin Error:", transactionErr);
          return res.status(500).json({
            error: "Transaction error",
            details: transactionErr.message,
          });
        }

        // temporarily disable foreign key checks
        connection.query(`SET FOREIGN_KEY_CHECKS=0;`, (fkErr) => {
          if (fkErr) {
            connection.rollback(() => {
              connection.release();
              res.status(500).json({
                error: "Failed to disable foreign key checks",
                details: fkErr.message,
              });
            });
            return;
          }

          // update items
          connection.query(
            `UPDATE Items SET Title = ?, Photo = ?, UpdatedBy = ? WHERE ItemID = ?`,
            [item.Title, Photo, item.UpdatedBy, item.ItemID],
            (itemErr, itemsResult) => {
              if (itemErr) {
                // error handling
                connection.query(`SET FOREIGN_KEY_CHECKS=1;`); // if errors out, re-enable foreign key checks
                return connection.rollback(() => {
                  connection.release();
                  res.status(500).json({
                    error: "Item update failed",
                    details: itemErr.message,
                    sqlMessage: itemErr.sqlMessage,
                  });
                });
              }

              // update books table
              connection.query(
                `UPDATE Books SET ISBN = ?, Authors = ?, GenreID = ?, Publisher = ?, PublicationYear = ?, LanguageID = ?, Summary = ? WHERE Books.ISBN = ?`,
                [
                  item.newISBN,
                  item.Authors,
                  item.GenreID,
                  item.Publisher,
                  item.PublicationYear,
                  item.LanguageID,
                  item.Summary,
                  item.ISBN,
                ],
                (bookErr, booksResult) => {
                  if (bookErr) {
                    connection.query(`SET FOREIGN_KEY_CHECKS=1;`);
                    return connection.rollback(() => {
                      connection.release();
                      res.status(500).json({
                        error: "Book update failed",
                        details: bookErr.message,
                        sqlMessage: bookErr.sqlMessage,
                      });
                    });
                  }

                  // update itemtypes table
                  connection.query(
                    `UPDATE ItemTypes SET ISBN = ? WHERE ItemTypes.ISBN = ?`,
                    [item.newISBN, item.ISBN],
                    (itemTypeErr, itResult) => {
                      if (itemTypeErr) {
                        // Error handling...
                        connection.query(`SET FOREIGN_KEY_CHECKS=1;`);
                        return connection.rollback(() => {
                          connection.release();
                          res.status(500).json({
                            error: "Item Types Update failed",
                            details: itemTypeErr.message,
                            sqlMessage: itemTypeErr.sqlMessage,
                          });
                        });
                      }

                      // if no errors, re-enable foreign key checks
                      connection.query(
                        `SET FOREIGN_KEY_CHECKS=1;`,
                        (enableErr) => {
                          if (enableErr) {
                            return connection.rollback(() => {
                              connection.release();
                              res.status(500).json({
                                error: "Failed to re-enable foreign key checks",
                                details: enableErr.message,
                              });
                            });
                          }

                          // commit transaction
                          connection.commit((commitErr) => {
                            if (commitErr) {
                              console.error("Commit Error:", commitErr);
                              return connection.rollback(() => {
                                connection.release();
                                res.status(500).json({
                                  error: "Commit error",
                                  details: commitErr.message,
                                });
                              });
                            }

                            connection.release();
                            return res.status(201).json({
                              success: true,
                              message: "Book updated successfully!",
                              itemId: item.ItemID,
                            });
                          });
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        });
      });
    });
  } else if (typename === "Media") {
    console.log("Received Media Data:", {
      ItemID: item.ItemID,
      MediaID: item.MediaID,
      Title: item.Title,
      Director: item.Director,
      Leads: item.Leads,
      ReleaseYear: item.ReleaseYear,
      GenreID: item.GenreID,
      LanguageID: item.LanguageID,
      Format: item.Format,
      Rating: item.Rating,
      UpdatedBy: item.UpdatedBy,
    });
    console.log("Photo:", Photo ? "Received" : "No photo");

    pool.getConnection((err, connection) => {
      if (err) {
        console.error("DB Connection Error:", err);
        return res
          .status(500)
          .json({ error: "DB connection error", details: err.message });
      }

      connection.beginTransaction((transactionErr) => {
        if (transactionErr) {
          connection.release();
          console.error("Transaction Begin Error:", transactionErr);
          return res.status(500).json({
            error: "Transaction error",
            details: transactionErr.message,
          });
        }

        connection.query(
          `UPDATE Items SET Title = ?, Photo = ?, UpdatedBy = ? WHERE Items.ItemID = ?`,
          [item.Title, Photo, item.UpdatedBy, item.ItemID],
          (itemErr, itemsResult) => {
            if (itemErr) {
              console.error("Items update Error:", {
                message: itemErr.message,
                sqlMessage: itemErr.sqlMessage,
                code: itemErr.code,
                sql: itemErr.sql,
              });

              return connection.rollback(() => {
                connection.release();
                res.status(500).json({
                  error: "Item update failed",
                  details: itemErr.message,
                  sqlMessage: itemErr.sqlMessage,
                });
              });
            }

            connection.query(
              `UPDATE Media SET Director = ?, Leads = ?, ReleaseYear = ?, GenreID = ?, LanguageID = ?, Format = ?, Rating = ? WHERE Media.MediaID = ?`,
              [
                item.Director,
                item.Leads,
                item.ReleaseYear,
                item.GenreID,
                item.LanguageID,
                item.Format,
                item.Rating,
                item.MediaID,
              ],
              (mediaErr, mediaResults) => {
                if (mediaErr) {
                  console.error("Media update Error:", {
                    message: mediaErr.message,
                    sqlMessage: mediaErr.sqlMessage,
                    code: mediaErr.code,
                    sql: mediaErr.sql,
                  });

                  return connection.rollback(() => {
                    connection.release();
                    res.status(500).json({
                      error: "Media update failed",
                      details: mediaErr.message,
                      sqlMessage: mediaErr.sqlMessage,
                    });
                  });
                }

                connection.commit((commitErr) => {
                  if (commitErr) {
                    console.error("Commit Error:", commitErr);
                    return connection.rollback(() => {
                      connection.release();
                      res.status(500).json({
                        error: "Commit error",
                        details: commitErr.message,
                      });
                    });
                  }

                  connection.release();
                  return res.status(201).json({
                    success: true,
                    message: "Media updated successfully!",
                    itemId: item.ItemID,
                  });
                });
              }
            );
          }
        );
      });
    });
  } else if (typename === "Device") {
    console.log("Received Device Data:", {
      Title: item.Title,
      DeviceID: item.DeviceID,
      DeviceType: item.DeviceType,
      Manufacturer: item.Manufacturer,
      UpdatedBy: item.UpdatedBy,
    });
    //console.log("Photo:", Photo ? "Received" : "No photo");

    pool.getConnection((err, connection) => {
      if (err) {
        console.error("DB Connection Error:", err);
        return res
          .status(500)
          .json({ error: "DB connection error", details: err.message });
      }

      connection.beginTransaction((transactionErr) => {
        if (transactionErr) {
          connection.release();
          console.error("Transaction Begin Error:", transactionErr);
          return res.status(500).json({
            error: "Transaction error",
            details: transactionErr.message,
          });
        }

        connection.query(
          `UPDATE Items SET Title = ?, Photo = ?, UpdatedBy = ? WHERE Items.ItemID = ?`,
          [item.Title, Photo, item.UpdatedBy, item.ItemID],
          (itemErr, itemsResult) => {
            if (itemErr) {
              console.error("Items update Error:", {
                message: itemErr.message,
                sqlMessage: itemErr.sqlMessage,
                code: itemErr.code,
                sql: itemErr.sql,
              });

              return connection.rollback(() => {
                connection.release();
                res.status(500).json({
                  error: "Item update failed",
                  details: itemErr.message,
                  sqlMessage: itemErr.sqlMessage,
                });
              });
            }

            connection.query(
              `UPDATE ItemDevice SET DeviceType = ?, Manufacturer = ? WHERE ItemDevice.DeviceID = ?`,
              [item.DeviceType, item.Manufacturer, item.DeviceID],
              (deviceErr, deviceResults) => {
                if (deviceErr) {
                  console.error("device update Error:", {
                    message: deviceErr.message,
                    sqlMessage: deviceErr.sqlMessage,
                    code: deviceErr.code,
                    sql: deviceErr.sql,
                  });

                  return connection.rollback(() => {
                    connection.release();
                    res.status(500).json({
                      error: "device update failed",
                      details: deviceErr.message,
                      sqlMessage: deviceErr.sqlMessage,
                    });
                  });
                }

                connection.commit((commitErr) => {
                  if (commitErr) {
                    console.error("Commit Error:", commitErr);
                    return connection.rollback(() => {
                      connection.release();
                      res.status(500).json({
                        error: "Commit error",
                        details: commitErr.message,
                      });
                    });
                  }

                  connection.release();
                  return res.status(201).json({
                    success: true,
                    message: "Device updated successfully!",
                    itemId: item.ItemID,
                  });
                });
              }
            );
          }
        );
      });
    });
  } else {
    res.status(400).json({ error: "Invalid type name" });
  }
});

// returns most borrowed items view
app.get("/api/most-borrowed-items", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting connection:", err);
      return res.status(500).json({ error: "Database connection error." });
    }
    const query = "SELECT * FROM most_borrowed_items_view";
    connection.query(query, (err, results) => {
      connection.release(); // Release the connection back to the pool
      if (err) {
        console.error("Error executing query:", err);
        return res
          .status(500)
          .json({ error: "Error fetching most borrowed items." });
      }
      res.json(results);
    });
  });
});

// gets book details view, dont know if this is being used
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

// displays all users in the system
app.get("/api/users", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting connection:", err);
      return res.status(500).json({ error: "Database connection error." });
    }

    const query = `
      SELECT 
        MemberID, 
        FirstName, 
        MiddleName, 
        LastName 
      FROM Members
    `;

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

// deletes a user from the system
app.delete("/api/usersdelete/:userId", (req, res) => {
  const { userId } = req.params;

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting connection:", err);
      return res.status(500).json({ error: "Database connection error." });
    }

    const query = "DELETE FROM Members WHERE MemberID = ?";

    connection.query(query, [userId], (err, results) => {
      connection.release(); // Release the connection back to the pool
      if (err) {
        console.error("Error executing query:", err);
        return res.status(500).json({ error: "Error deleting user." });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ error: "User not found." });
      }

      res
        .status(200)
        .json({ success: true, message: "User deleted successfully." });
    });
  });
});

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

// returns languages
app.get("/api/languages", (req, res) => {
  pool.query(`SELECT LanguageID, Language FROM languages`, (err, results) => {
    if (err) {
      console.error("Error executing query:", +err.stack);
      res.status(500).send("Error fetching languages");
      return;
    }
    res.json(results);
  });
});

// returns media genres
app.get("/api/mediagenres", (req, res) => {
  pool.query(
    `SELECT GenreID, GenreName FROM genres WHERE GenreID BETWEEN 200 AND 299`,
    (err, results) => {
      if (err) {
        console.error("Error executing query:", +err.stack);
        res.status(500).send("Error fetching genres");
        return;
      }
      res.json(results);
    }
  );
});

// returns book genres
app.get("/api/bookgenres", (req, res) => {
  pool.query(
    `SELECT GenreID, GenreName FROM genres WHERE GenreID BETWEEN 100 AND 199`,
    (err, results) => {
      if (err) {
        console.error("Error executing query:", +err.stack);
        res.status(500).send("Error fetching genres");
        return;
      }
      res.json(results);
    }
  );
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
                    const mediaLimit = limits.MediaItemLimit;
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

app.post("/api/profile/return", (req, res) => {
  try {
    const { items } = req.body;
    console.log(items);

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Invalid or empty items array" });
    }

    pool.getConnection((err, connection) => {
      if (err) {
        console.error("Error getting connection:", err);
        return res.status(500).json({ error: "Database connection error" });
      }

      connection.beginTransaction((err) => {
        if (err) {
          connection.release();
          return res.status(500).json({ error: "Transaction error" });
        }

        const returnedItems = [];
        let hasErrors = false;

        const returnItem = (index) => {
          if (index >= items.length || hasErrors) {
            if (hasErrors) {
              return connection.rollback(() => {
                connection.release();
                res.status(500).json({
                  error: "Failed to return some items",
                  returned: returnedItems,
                });
              });
            }

            return connection.commit((err) => {
              connection.release();
              if (err) {
                console.error("Commit error:", err);
                return res
                  .status(500)
                  .json({ error: "Failed to commit transaction" });
              }

              res.status(200).json({
                success: true,
                message: `${returnedItems.length} item(s) returned successfully`,
                items: returnedItems,
              });
            });
          }

          const itemid = items[index];

          // Get current borrow record
          connection.query(
            `SELECT * FROM borrowrecord WHERE ItemID = ? AND ReturnDate IS NULL`,
            [itemid],
            (err, rows) => {
              if (err || rows.length === 0) {
                console.error(
                  `Error finding borrow record for Item ${itemid}:`,
                  err
                );
                hasErrors = true;
                return returnItem(index + 1);
              }

              const record = rows[0];

              // Insert into returnrecord
              connection.query(
                `INSERT INTO returnrecord (
                  ReturnID, MemberID, ItemID, BorrowDate, DueDate, ReturnDate, FineAccrued
                ) VALUES (?, ?, ?, ?, ?, NOW(), ?)`,
                [
                  record.BorrowID,
                  record.MemberID,
                  record.ItemID,
                  record.BorrowDate,
                  record.DueDate,
                  record.FineAccrued,
                ],
                (err) => {
                  if (err) {
                    console.error(
                      `Error inserting return record for Item ${itemid}:`,
                      err
                    );
                    hasErrors = true;
                    return returnItem(index + 1);
                  }

                  // Delete borrow record
                  connection.query(
                    `DELETE FROM borrowrecord WHERE ItemID = ? AND ReturnDate IS NULL`,
                    [itemid],
                    (err) => {
                      if (err) {
                        console.error(
                          `Error deleting borrow record for Item ${itemid}:`,
                          err
                        );
                        hasErrors = true;
                        return returnItem(index + 1);
                      }

                      // Update item status
                      connection.query(
                        `UPDATE Items SET Status = 'Available', LastUpdated = NOW() WHERE ItemID = ?`,
                        [itemid],
                        (err) => {
                          if (err) {
                            console.error(
                              `Error updating Item ${itemid}:`,
                              err
                            );
                            hasErrors = true;
                          } else {
                            returnedItems.push(itemid);
                          }

                          // Check if there's an active hold
                          connection.query(
                            `SELECT * FROM HoldRequest WHERE ItemID = ? AND HoldStatus = 'active'`,
                            [itemid],
                            (err, holdRows) => {
                              if (err) {
                                console.error(
                                  `Error checking hold requests for Item ${itemid}:`,
                                  err
                                );
                              } else if (holdRows.length > 0) {
                                console.log(
                                  `Active hold found for ItemID ${itemid}, updating NextInLine...`
                                );

                                // Call updateNextInLine function after the return logic
                                setImmediate(() => {
                                  console.log(
                                    "Calling updateNextInLine for ItemID:",
                                    itemid
                                  );
                                  updateNextInLine(itemid).catch((err) => {
                                    console.error(
                                      `Error updating NextInLine for Item ${itemid}:`,
                                      err
                                    );
                                  });
                                });
                              }

                              console.log(
                                "Moving to the next item:",
                                index + 1
                              );
                              returnItem(index + 1); // Continue to next item
                            }
                          );
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        };
        returnItem(0); // Start processing items
      });
    });
  } catch (err) {
    console.error("Return error:", err);
    res.status(500).json({ error: "Server error processing return" });
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

/*
app.post("/api/profile/cancelhold", (req, res) => {
  const { memberID, itemID } = req.body;

  // quick validation
  if (!memberID || !itemID) {
    return res.status(400).json({ error: "MemberID and ItemID are required" });
  }

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("DB Connection Error:", err);
      return res
        .status(500)
        .json({ error: "Database connection error", details: err.message });
    }

    // delete from hold request table where itemID and memberID match
    connection.query(
      "DELETE FROM holdrequest WHERE ItemID = ? AND MemberID = ?",
      [itemID, memberID],
      (err, result) => {
        connection.release();

        if (err) {
          console.error("Error canceling hold request:", err);
          return res.status(500).json({
            error: "Failed to cancel hold request",
            details: err.message,
          });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({
            error: "No matching hold request found",
          });
        }

        return res.status(200).json({
          success: true,
          message: "Hold request cancelled successfully",
        });
      }
    );
  });
});
*/

// Function to fetch hold items for a member
app.get("/api/profile/holditems/:memberID", async (req, res) => {
  const { memberID } = req.params;
  console.log("Fetching hold items for memberID:", memberID);

  try {
    const connection = await getConnectionFromPool();

    const results = await new Promise((resolve, reject) => {
      connection.query(
        `SELECT Items.ItemID, Items.Title, Items.Status, HoldRequest.MemberID, HoldRequest.CreatedAt, HoldRequest.HoldStatus, HoldRequest.NextInLine 
         FROM HoldRequest 
         INNER JOIN Items ON HoldRequest.ItemID = Items.ItemID 
         WHERE HoldRequest.MemberID = ?`,
        [memberID],
        (err, results) => {
          if (err) {
            reject(new Error("Error fetching items on hold from database"));
          } else {
            resolve(results);
          }
        }
      );
    });

    connection.release();

    if (results.length === 0) {
      console.log("No hold requests found for memberID:", memberID);
      return res
        .status(404)
        .json({ error: "No hold requests found for this member" });
    }

    // Enrich holds with NextInLine status
    const enrichedHolds = await Promise.all(
      results.map(async (hold) => {
        const isNextInLine = await isMemberNextInLineForItem(
          hold.ItemID,
          memberID
        );
        return { ...hold, NextInLine: isNextInLine };
      })
    );

    console.log("Fetched and enriched hold items:", enrichedHolds);
    res.json(enrichedHolds);
  } catch (error) {
    console.error("Error fetching hold items:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Function to get a connection from the pool
function getConnectionFromPool() {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(new Error("Error getting database connection"));
      } else {
        resolve(connection);
      }
    });
  });
}

// Function to check if a member is the next in line for an item with HoldStatus 'active' and NextInLine 1
async function isMemberNextInLineForItem(itemID, memberID) {
  try {
    const connection = await getConnectionFromPool();

    const results = await new Promise((resolve, reject) => {
      connection.query(
        `SELECT * FROM HoldRequest 
         WHERE ItemID = ? AND MemberID = ? AND HoldStatus = 'active' AND NextInLine = 1`,
        [itemID, memberID],
        (err, results) => {
          if (err) {
            reject(new Error("Error fetching hold queue from database"));
          } else {
            resolve(results);
          }
        }
      );
    });

    connection.release();

    // Check if a record is found for the given conditions
    if (results.length > 0) {
      return true; // Member is the next in line with 'active' hold and 'NextInLine' set to 1
    }

    return false; // Member is not the next in line
  } catch (error) {
    console.error("Error checking member's hold status:", error.message);
    throw error; // Rethrow the error so the caller can handle it
  }
}

async function updateNextInLine(itemID) {
  console.log(`Updating NextInLine for ItemID: ${itemID}`);

  // Check for active requests first
  const [rows] = await new Promise((resolve, reject) => {
    pool.query(
      `SELECT * FROM HoldRequest WHERE ItemID = ? AND HoldStatus = 'active' ORDER BY CreatedAt ASC LIMIT 1`,
      [itemID],
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      }
    );
  });

  // Log the type and structure of rows
  console.log("Type of rows:", typeof rows);
  console.log("Structure of rows:", rows);

  // Check if rows is not null or undefined (it should contain the row data)
  if (rows) {
    const memberID = rows.MemberID; // Directly access MemberID from the object
    console.log(`Found NextInLine MemberID: ${memberID} for ItemID: ${itemID}`);

    // Set NextInLine to 1 for the earliest active request (i.e., the returned row)
    const updateResult = await new Promise((resolve, reject) => {
      pool.query(
        `UPDATE HoldRequest SET NextInLine = 1 WHERE ItemID = ? AND MemberID = ? AND HoldStatus = 'active'`,
        [itemID, memberID],
        (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        }
      );
    });

    // Log the updated result
    if (updateResult.affectedRows > 0) {
      console.log(
        `NextInLine updated for ItemID: ${itemID}, MemberID: ${memberID}`
      );
    } else {
      console.log(
        `Failed to update NextInLine for ItemID: ${itemID}, MemberID: ${memberID}`
      );
    }

    // Re-check and log the row after the update to confirm the change
    const [updatedRows] = await new Promise((resolve, reject) => {
      pool.query(
        `SELECT * FROM HoldRequest WHERE ItemID = ? AND HoldStatus = 'active' ORDER BY CreatedAt ASC LIMIT 1`,
        [itemID],
        (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        }
      );
    });

    // Log the updated row to confirm NextInLine was set
    console.log(`Updated row for ItemID ${itemID}:`, updatedRows);
  } else {
    console.log(`No active requests found for ItemID: ${itemID}`);
  }
}

// Endpoint to cancel hold and update the next in line
app.post("/api/cancelhold", async (req, res) => {
  const { itemID, memberID } = req.body;

  try {
    console.log(
      `Canceling hold for ItemID: ${itemID} and MemberID: ${memberID}`
    );

    // Update the hold status to cancelled
    await new Promise((resolve, reject) => {
      pool.query(
        `UPDATE HoldRequest SET HoldStatus = 'cancelled' 
         WHERE ItemID = ? AND MemberID = ?`,
        [itemID, memberID],
        (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        }
      );
    });

    // Update the next in line status after the hold is cancelled
    await updateNextInLine(itemID);

    res.json({ success: true });
  } catch (error) {
    console.error("Cancel hold error:", error);
    res.status(500).send("Failed to cancel hold");
  }
});

// Endpoint to fulfill hold and update the next in line
app.post("/api/fulfillhold", async (req, res) => {
  const { itemID, memberID } = req.body;

  try {
    // Update the hold status to fulfilled and reset NextInLine
    await new Promise((resolve, reject) => {
      pool.query(
        `UPDATE HoldRequest 
         SET HoldStatus = 'fulfilled', NextInLine = 0
         WHERE ItemID = ? AND MemberID = ?`,
        [itemID, memberID],
        (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        }
      );
    });

    // Update the next in line status after fulfilling the hold
    await updateNextInLine(itemID);

    res.json({ success: true });
  } catch (error) {
    console.error("Fulfill hold error:", error);
    res.status(500).send("Failed to fulfill hold");
  }
});

cron.schedule("* * * * *", () => {
  console.log("Running overdue charge check...");

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Connection error:", err);
      return;
    }

    const overdueQuery = `
      SELECT br.MemberID, br.ItemID, it.TypeName
      FROM BorrowRecord br
      JOIN itemtypes it ON br.ItemID = it.ItemID
      WHERE br.ReturnDate IS NULL
        AND br.DueDate < CURDATE()
        AND NOT EXISTS (
          SELECT 1 FROM overduecharges oc 
          WHERE oc.MemberID = br.MemberID 
          AND oc.ItemID = br.ItemID
        )
    `;

    connection.query(overdueQuery, (err, overdues) => {
      if (err) {
        console.error("Query error:", err);
        connection.release();
        return;
      }

      let processed = 0;
      if (overdues.length === 0) {
        connection.release();
        return;
      }

      overdues.forEach((row) => {
        const { MemberID, ItemID, TypeName } = row;

        connection.query(
          "SELECT FineAmount FROM fines WHERE FineID = ?",
          [TypeName],
          (err, fineResults) => {
            if (err || !fineResults.length) {
              console.error("Fine lookup error:", err);
              if (++processed === overdues.length) connection.release();
              return;
            }

            const fineAmount = fineResults[0].FineAmount;

            connection.query(
              `INSERT INTO overduecharges (MemberID, ItemID, Amount, ChargedAt)
               VALUES (?, ?, ?, NOW())`,
              [MemberID, ItemID, fineAmount],
              (err) => {
                if (err) console.error("Insert error:", err);
                else
                  console.log(
                    `Charged $${fineAmount} to Member ${MemberID} for Item ${ItemID}`
                  );
                if (++processed === overdues.length) connection.release();
              }
            );
          }
        );
      });
    });
  });
});

// Every day at midnight, the cron job checks for pending notifications
cron.schedule("0 0 * * *", () => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting connection:", err);
      return;
    }

    const updateQuery = `
      UPDATE PendingNotifications 
      SET processed = 1
      WHERE DATEDIFF(notify_at, CURDATE()) = 3 AND processed = 0
    `;

    connection.query(updateQuery, (err, results) => {
      connection.release();

      if (err) {
        console.error("Error updating PendingNotifications:", err);
        return;
      }

      console.log(`✅ Updated ${results.affectedRows} pending notifications.`);
    });
  });
});

// API endpoint: Get borrowed items for a member
app.get("/api/profile/borroweditems/:memberID", (req, res) => {
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
          q = `SELECT i.ItemID, TO_BASE64(i.Photo) AS Photo, i.Title, i.Status, it.TypeName, b.Authors, b.Publisher, b.PublicationYear, b.Summary, it.ISBN, g.GenreName, g.GenreID, l.Language, l.LanguageID
       FROM Items i
       INNER JOIN ItemTypes it ON it.ItemID = i.ItemID
       INNER JOIN Books b ON it.ISBN = b.ISBN
       INNER JOIN Genres g ON b.GenreID = g.GenreID
       INNER JOIN Languages l ON b.LanguageID = l.LanguageID
       WHERE i.ItemID = ? AND it.TypeName = 'Book'`;
        } else if (currentType === "Media") {
          q = `SELECT i.ItemID, TO_BASE64(i.Photo) AS Photo, i.Title, i.Status, it.TypeName, im.Director, im.Leads, im.ReleaseYear, im.MediaID, im.Format, im.Rating, it.MediaID, g.GenreName, g.GenreID, l.LanguageID, l.Language
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

app.get("/api/itemfull", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting connection:", err);
      res.status(500).json({ error: "Database connection error" });
      return;
    }

    let q = `SELECT
                i.ItemID,
                i.Title,
                i.Status,
                it.TypeName,
                it.ISBN,
                b.Authors,
                b.Publisher,
                b.PublicationYear,
                b.Summary,
                g.GenreName,
                g.GenreID,
                l.LanguageID,
                l.Language,
                m.Director,
                m.Leads,
                m.ReleaseYear,
                m.Format,
                m.Rating,
                d.DeviceType,
                d.Manufacturer
            FROM Items i
            INNER JOIN ItemTypes it ON it.ItemID = i.ItemID
            LEFT JOIN Books b ON b.ISBN = it.ISBN
            LEFT JOIN Media m ON m.MediaID = it.MediaID
            LEFT JOIN ItemDevice d ON d.DeviceID = it.DeviceID
            LEFT JOIN Genres g ON b.GenreID = g.GenreID OR m.GenreID = g.GenreID
            LEFT JOIN Languages l ON b.LanguageID = l.LanguageID OR m.LanguageID = l.LanguageID`;

    connection.query(q, (err, results) => {
      connection.release();

      if (err) {
        console.error("Error fetching details", err);
        res.status(500).json({ error: "Database query error" });
        return;
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "Item not found" });
      }

      res.json(results);
    });
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
  const {
    email,
    password,
    groupid,
    firstName,
    middleName,
    lastName,
    address,
    phoneNumber,
    birthDate,
  } = req.body;

  //console.log(birthDate);
  //console.log(phoneNumber);

  // validation check to ensure email & password were passed to server
  // shouldnt ever see this just in case though
  if (!email || !password) {
    return;
  }

  // double up email regex cause why not
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ error: "Invalid email format" });
    return;
  }

  // validation of password strength (ex. minimum 8 characters)
  // can include others, or not if you don't want to be annoying
  // do this shit if you want to be annoying
  // ^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$
  if (password.length < 8) {
    res
      .status(400)
      .json({ error: "Password must be at least 8 characters long" });
    return;
  }
  // if keeping it to just length check shouldnt ever see this

  // GroupID should be defaulted to Student, this will happen elsewhere??
  if (groupid === null) {
    groupid = "Student";
  }
  // just default it here tooo

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
            "SELECT 1 FROM Members WHERE Email = ? OR PhoneNumber = ? LIMIT 1",
            [email, phoneNumber],
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
            "INSERT INTO Members (FirstName, MiddleName, LastName, GroupID, Email, Password, PhoneNumber, BirthDate, Address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
              firstName,
              middleName,
              lastName,
              groupid,
              email,
              hashedPassword,
              phoneNumber,
              birthDate,
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
    // this is an important error return
    if (userExists) {
      res.status(409).json({ error: "Account already exists" });
      return;
    }

    // Create the user
    await createUser();

    // Log successful registration
    console.log(`New user registered with email: ${email.substring(0, 3)}...`);

    // Return success response, commenting out
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
      req.session.lastName = member.LastName;
      req.session.email = member.Email;

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
  (async () => {
    console.log("Starting development server");
    const vite = await import("vite");
    const viteDevServer = await vite.createServer({
      server: { middlewareMode: true },
    });

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
  })();
} else {
  (async () => {
    console.log("Starting production server");
    app.use(
      "/assets",
      express.static("build/client/assets", { immutable: true, maxAge: "1y" })
    );
    app.use(express.static("build/client", { maxAge: "1h" }));
    
    const mod = await import(BUILD_PATH);
    app.use(mod.app);
  })();
}

app.use(morgan("tiny"));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
