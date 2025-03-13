import compression from "compression";
import express from "express";
import morgan from "morgan";
import mysql from "mysql2";
import crypto from "crypto";

// Short-circuit the type-checking of the built output.
const BUILD_PATH = "./build/server/index.js";
const DEVELOPMENT = process.env.NODE_ENV === "development";
const PORT = Number.parseInt(process.env.PORT || "3000");

const app = express();
app.use(express.json()); // built-in middleware json parser



db.connect()

/**
 * Generates a secure password hash with salt
 * @param {string} password - The password to hash
 */
function generatePassword(password) {
  const salt = crypto.randomBytes(32).toString("hex");
  const genHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');

  return `${salt}:${genHash}`;
}
/**
 * Generates a secure password hash with salt
 * @param {string} password - The password to hash
 * @param {string} hash
 * @param {string} salt
 */
function validPassword(password, hash, salt) {
  const checkHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === checkHash;
}

app.post("/api/login", async (req, res) => {
  // get email and password from request body
  const { email, password } = req.body;
})

// USER REGISTRATION
app.post("/api/register", async (req, res) => {
  // get email, password, and group from request body
  const { email, password, group } = req.body;

  // validate existence of email and password
  if (!email || !password) {
    // return error message
    res.status(400).json({ error: "Email and password are required"});
    return;
  }

  // if email and password are recieved
  try {
    // query the database to see if user already exists
    db.query(`SELECT 1 FROM Members WHERE Email = ? LIMIT 1`, email, (err, result) => {
      if (err) {
        // output error to console
        console.error("Database error:", err);
        // return error message
        res.status(500).json({ error: "Database error" });
        return;
      }
      
      // like 90% sure this is stupid but havent found a better way
      const accountExists = result && Object.keys(result).length > 0;
      // returns true if account is found and false otherwise

      if (accountExists) {
        // Account already exists, return error
        res.status(500).json({ error: "Account already exists" });
        return;
      }

      // ACCOUNT DOESNT EXIST => CREATE ACCOUNT

      // initialize query
      const query = `INSERT INTO Members (Email, Password, GroupID) VALUES (?, ?, ?)`;

      // need to hash password
      const hashedPassword = generatePassword(password);

      // okay can call query now
      db.query(query, [email, hashedPassword, group]);

      // for debugging
      //console.log("Query result:", result);
      //console.log("Exists:", accountExists);

      // Account created successfully return success
      res.json({ success: true, message: "Account created successfully!" });
      return;
    })
  } catch (error) {
    console.error("Error in registration process:", error);
    res.status(500).json({ error: "Registration failed"});
    return;
  }

});

app.post('/api/insert', (req, res) => {
  const {name, email} = req.body;
  const classID = 0;

  // Insert the request body into the database
  const query = `INSERT INTO Members (FirstName, Email, GroupID) VALUES (?, ?, ?)`;
  db.query(query, [name, email, classID]);

  res.json({ success: true, message: "Data inserted successfully" });

  console.log(name);
  console.log(email);
  return;
});

// RETURNS ALL MEMBERS
app.get('/api/members', (req,res) => {
  db.query('SELECT * FROM Members', (err, results) => {
      if (err) {
          console.error('Error executing query: ' + err.stack);
          res.status(500).send('Error fetching users');
          return;
      }
      res.json(results);
  });
});

// RETURNS MEMBER ID, NAME, THEIR CLASSIFICATION, AND LENDING PRIVILEGES
app.get('/api/memberprivileges', (req, res) => {
  db.query('SELECT Members.MemberID, Members.FirstName, membergroups.GroupID, membergroups.LendingPeriod, membergroups.ItemLimit, membergroups.MediaItemLimit FROM Members INNER JOIN membergroups ON Members.GroupID=membergroups.GroupID', (err, results) => {
      if (err) {
          console.error('Error executing query: ' + err.stack);
          res.status(500).send('Error fetching user privleges');
          return;
      }
      res.json(results);
  });
});

// RETURNS ALL ITEMS AND THEIR TYPE
app.get('/api/items', (req, res) => {
  db.query('SELECT Items.ItemID, Items.Title, itemtypes.TypeName, Items.Status, Items.LastUpdated, Items.CreatedAt, Items.TimesBorrowed FROM Items INNER JOIN ItemTypes ON ItemTypes.ItemID=Items.ItemID', (err, results) => {
      if (err) {
          console.error('Error executing query: ' + err.stack);
          res.status(500).send('Error fetching items');
          return;
      }
      res.json(results);
  });
});

// RETURNS ALL BOOKS
app.get('/api/books', (req, res) => {
  db.query('SELECT Items.ItemID, Items.ItemTitle, Books.Authors, ItemTypes.ISBN, Genres.GenreName FROM (((Items INNER JOIN ItemTypes ON ItemTypes.ItemID=Items.ItemID AND ItemTypes.TypeName="Book") INNER JOIN Books ON ItemTypes.ISBN=Books.ISBN) INNER JOIN Genres ON Books.GenreID=Genres.GenreID)', (err, results) => {
      if (err) {
          console.error('Error executing query: ' + err.stack);
          res.status(500).send('Error fetching books');
          return;
      }
      res.json(results);
  });
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
