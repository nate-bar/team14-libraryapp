// server.js
// disable typescript checks
// @ts-nocheck
import compression from "compression";
import express from "express";
import morgan from "morgan";
import mysql from "mysql"; // mysql package, should be self explanitory
import crypto from "crypto"; // for salting and hashing passwords
import session from "express-session"; // for session storage

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

//connect to MySQL DB
const db = mysql.createConnection({
  host: "t14librarydb.mysql.database.azure.com",
  user: "T14Admin",
  password: "D^7L=kM3-EHX>m>",
  database: "librarysystem",
});

db.connect();

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

/*
//---------------------CODE FOR API'S HERE--------------------
*/
// this will be for registering new users
// database check to see if user exists => if not create user
app.post("/api/signup", async (req, res) => {
  // get Email, Password, & GroupID from request body
  const { email, password, groupid } = req.body;

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
        db.query(
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
      });
    };

    // this is a function to insert user into database
    const createUser = () => {
      return new Promise((resolve, reject) => {
        // Hash password
        const hashedPassword = generatePassword(password);

        // Insert new user
        db.query(
          "INSERT INTO Members (Email, Password, GroupID) VALUES (?, ?, ?)",
          [email, hashedPassword, groupid],
          (err, result) => {
            if (err) {
              reject(err);
              return;
            }
            resolve(result);
          }
        );
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

// USER LOGIN
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
        db.query(
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

app.get("/api/search", (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res
      .status(400)
      .json({ success: false, message: "Missing search query" });
  }

  // Example: search in the Items table using a LIKE query on the ItemTitle column
  const sql = `SELECT * FROM Items WHERE Title LIKE ?`;
  db.query(sql, [`%${query}%`], (err, results) => {
    if (err) {
      console.error("Error executing search query:", err.stack);
      return res
        .status(500)
        .json({ success: false, message: "Error searching items" });
    }
    res.json(results);
  });
});

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

// RETURNS ALL ITEMS AND THEIR TYPE
app.get("/api/items", (req, res) => {
  db.query(
    "SELECT Items.ItemID, Items.Title, itemtypes.TypeName, Items.Status, Items.LastUpdated, Items.CreatedAt, Items.TimesBorrowed FROM Items INNER JOIN ItemTypes ON ItemTypes.ItemID=Items.ItemID",
    (err, results) => {
      if (err) {
        console.error("Error executing query: " + err.stack);
        res.status(500).send("Error fetching items");
        return;
      }
      res.json(results);
    }
  );
});

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
