// *****************************************************
// <!-- Import Dependencies -->
// *****************************************************

const express = require('express');
const app = express();
const handlebars = require('express-handlebars');
const path = require('path');
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcryptjs'); //  To hash passwords
const http = require('http');
const server = http.createServer(app);
//initialize a new instance of socket.io by passing the server object
const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true
}); // socket instance

const pgSession = require('connect-pg-simple')(session);

// *****************************************************
// <!-- Connect to DB -->
// *****************************************************

// create `ExpressHandlebars` instance and configure the layouts and partials dir.
const hbs = handlebars.create({
    extname: 'hbs',
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials',
});

// database configuration
const dbConfig = {
    host: process.env.POSTGRES_HOST, // the database server
    port: process.env.POSTGRES_PORT, // the database port
    database: process.env.POSTGRES_DB, // the database name
    user: process.env.POSTGRES_USER, // the user account to connect with
    password: process.env.POSTGRES_PASSWORD, // the password of the user account
  };

const db = pgp(dbConfig);

//ADDED for GCP
const { Pool } = require('pg');
const sessionPool = new Pool(dbConfig);
//ADDED for GCP
  
// test database
db.connect()
    .then(obj => {
        console.log('Database connection successful');
        obj.done(); // success, release the connection;
    })
    .catch(error => {
        console.log('ERROR:', error.message || error);
    });

// *****************************************************
// <!-- App Settings -->
// *****************************************************

//only used in login when creating user session
const user = {
    username: undefined
  };

// Register `hbs` as our view engine using its bound `engine()` function.
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.

// initialize session variables ALERT: COOKIE COULD BE PROBLEMATIC... AND IT WAS, Hence the following line
app.set('trust proxy',1); //1 = trust the first hop from proxy

app.use(
  session({
    store: new pgSession({
      pool: sessionPool,
      tableName: 'user_sessions',
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 86400000 //24 hours
    }
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use("/js",express.static(path.join(__dirname, 'public/js')));
app.use("/css",express.static(path.join(__dirname, 'public/css')));

//if already logged in tell the user. Otherwise go to login page
app.get("/",(req,res) => 
{
  if(req.session.user)
  {
    res.render("./pages/altLogin", { message: `Already logged in as, ${req.session.user.username}` , username: req.session.user.username} );
  }
  else
  {
    res.render("./pages/login",{message: "Login or Register To Start Coloring"});
  }
});

app.get("/homeCanvas", (req, res) => 
{
  if(req.session.user)
  {
    console.log("Rendering page");
    res.render("./pages/homeCanvas",{username: req.session.user.username});
  }
  else
  {
    res.render("./pages/login",{message: "Login or Register To Start Coloring"});
  }

});

app.get("/login", (req, res) => 
{
  if(req.session.user)
  {
    res.render("./pages/altLogin",{ message: `Already logged in as, ${req.session.user.username}` , username: req.session.user.username} );
  }
  else
  {
    res.render("./pages/login",{message: "Login or Register To Start Coloring"});
  }
});

//The following app.get initializes all required items for a canvas to be created
app.get('/pixel-art', async(req, res) => {
  if(req.session.user)
  {
    const canvasRows = [];
    const canvasWidth = 32;
    const canvasHeight = 32;
    const paletteRows = [];
    const paletteWidth = 5;
    const paletteHeight = 5;

    for (let i = 0; i < canvasHeight; i++) 
    {
      const row = [];
      for (let j = 0; j < canvasWidth; j++) 
      {
        row.push({});
      }
      canvasRows.push(row);
    }

    for (let i = 0; i < paletteHeight; i++) 
    {
      const row = [];
      for (let j = 0; j < paletteWidth; j++) 
      {
        row.push({});
      }
    paletteRows.push(row);
    }
    console.log('Rendered: /pixel-art');

    console.dir(paletteHeight,paletteRows,canvasHeight,canvasRows)
    res.status(200).render('./pages/pixel-art', {
    title: 'Pixel Art Creator',
    canvasRows: canvasRows,
    paletteRows: paletteRows,
    saved_canvas: req.session.saved_canvas,
    artwork_id: req.session.artwork_id,
    artwork_name: req.session.artwork_name,
    username: req.session.user.username
    });
  }
  else
  {
    res.render("./pages/login",{message: "Login or Register To Start Coloring"});
  }
});


app.post("/login", async(req, res) => {
  const query = "SELECT password FROM users WHERE username = $1"; // Use $1 for the first parameter
  try
  {
      const results = await db.any(query, [req.body.username]); // Pass parameters as an array preventing SQL injection
      if(results.length == 0)
      {
        res.redirect("/register");
      }
      else
      {
        const match = await bcrypt.compare(req.body.password, results[0].password);
        if(match === true)
        {
          user.username = req.body.username;
          req.session.user = user;
          req.session.save();
          res.redirect("/homeCanvas");

        }
        else
        {
          res.status(400).render("./pages/login",{message:"Incorrect username or password"});
        }
      }
  }
  catch(err)
  {
    res.redirect("/register");
    console.log(err);
  }
});

app.get("/register", (req, res) => 
{
  res.render("./pages/register",{message: "Login or Register To Start Coloring"});
});

app.post("/register", async (req,res) => {
  const hash = await bcrypt.hash(req.body.password, 10);
  const query = "Insert into users (username,password) values ($1, $2);";
  const testUsername = req.body.username.replace(/\s/g,"");
  try
  {
    if(testUsername.length !== 0)
    {
      await db.any(query, [req.body.username,hash]); //preventing SQL injection
      
      user.username = req.body.username;
      req.session.user = user;
      req.session.save();
      res.redirect("/homeCanvas");
    }
    else
    {
      res.status(400).render("./pages/register",{message:"Invalid Username"});
    }
  }
  catch(err)
  {
    res.status(400).render("./pages/register",{message: "Username: "+ req.body.username + " Is Taken"});
  }

});
/**
 * /save_canvas will save artwork to the artwork database. 
 * It also adds a linking entry into users_to_artwork which connects user to their artwork.
 * Artwork is saved using JSON.Stringify( argx ). argx is a 2D array with the HEX format.
 * If an artwork created by a user has the same name as another peice of their art, then the previous peice of art will be updated.
 */
app.post('/save_canvas', async(req, res) => {
  if(req.session.user)
  {
    const removeSpace = req.body.name.replace(/\s/g,"");
    let saveUser = req.session.user.username;

    if(removeSpace.length > 0)
    {
      let lookForId= [];
      try
      {
        const findId = "select artwork_id from users left join users_to_artwork on users.username = users_to_artwork.username left join artwork on users_to_artwork.artwork = artwork.artwork_id where users.username = $1 AND artwork.private_name = $2;";
        lookForId = await db.any(findId,[saveUser,(req.body.name+saveUser)]);
      }
      catch(err)
      {
        console.log("Error in looking for artwork ", err);
      }

      if(lookForId[0] == undefined)
      {
        let query = '';

        try 
        {
          if(req.body.image == null)
          {
            query = `
            INSERT INTO artwork (artwork_name, private_name, properties)
            VALUES ($1, $2, $3);`;
            await db.none(query, [req.body.name,(req.body.name + saveUser), JSON.stringify(req.body.properties)]);
            console.log(query, [req.body.name,(req.body.name + saveUser), JSON.stringify(req.body.properties)]);
          }
          else
          {
            query = `
            INSERT INTO artwork (artwork_name, private_name, properties,thumbnail)
            VALUES ($1, $2, $3, $4);`;
            await db.none(query, [req.body.name,(req.body.name + saveUser), JSON.stringify(req.body.properties),req.body.image]);
            console.log(query, [req.body.name,(req.body.name + saveUser), JSON.stringify(req.body.properties),req.body.image]);
          }
          const findNewId = "SELECT artwork_id FROM artwork WHERE artwork.private_name = $1;";
          const newArtwork = await db.any(findNewId, [(req.body.name + saveUser)]);
          const addLinkFromUserToArt = "INSERT INTO users_to_artwork(username, artwork) VALUES ($1, $2);";
          await db.none(addLinkFromUserToArt, [saveUser, newArtwork[0].artwork_id]);
        }
        catch (err) 
        {
          console.log("Error with run condition updating canvas:",err);
        }
        res.status(204).end()
      }
      else
      {
        try
        {
          let updateExistingQuery = '';
          if(req.body.image == null)
          {
            updateExistingQuery = `update artwork set properties = $1 where artwork.private_name = $2;`;
            await db.none(updateExistingQuery,[JSON.stringify(req.body.properties),(req.body.name+saveUser)]);
          }
          else
          {
            updateExistingQuery = `update artwork set properties = $1, thumbnail = $2 where artwork.private_name= $3;`;
            await db.none(updateExistingQuery,[JSON.stringify(req.body.properties),req.body.image,(req.body.name+saveUser)]);
          }
          res.status(204).end()
        }
        catch(err)
        {
          console.log("Error updating existing canvas:",err);
        }
      }
    }
    else
    {
      res.send("Invalid name");
    }
  }
  else
  {
    res.render("./pages/login",{message: "Login or Register To Start Coloring"});
  }
  
});

app.get('/logout', (req, res) => {
  if(req.session.user)
  {
    const PastUser = req.session.user.username;
    req.session.destroy( () => {
      res.render('./pages/logout',{Loggedout: PastUser});
      user.username = undefined;  // reseting username feild
    })
  }
  else
  {
    res.render("./pages/login",{message: "Login or Register To Start Coloring"});
  }
});   

/**
 * If a user enters an exclusive canvas then /canvas will create the nessesary items for a collaborative canvas and send 
 * that to pixel-art.hbs
 */
app.post("/canvas", async(req, res) => {
  if(req.session.user)
  {
    req.session.saved_canvas = false;
    req.session.artwork_id = -1;
    req.session.artwork_name = "";

    const roomId = await req.body.roomInput;
    req.body.roomInput = '';
    const canvasRows = [];
    const canvasWidth = 32;
    const canvasHeight = 32;
    const paletteRows = [];
    const paletteWidth = 5;
    const paletteHeight = 5;

    for (let i = 0; i < canvasHeight; i++) 
    {
      const row = [];
      for (let j = 0; j < canvasWidth; j++) 
      {
        row.push({});
      }
      canvasRows.push(row);
    }

    for (let i = 0; i < paletteHeight; i++) 
    {
      const row = [];
      for (let j = 0; j < paletteWidth; j++) 
        {
          row.push({});
        }
      paletteRows.push(row);
    }

    //SETTING UP CANVAS
  
      res.render('./pages/pixel-art', {
      title: 'Pixel Art Creator',
      canvasRows: canvasRows,
      paletteRows: paletteRows,
      saved_canvas: req.session.saved_canvas,
      artwork_id: req.session.artwork_id,
      artwork_name: req.session.artwork_name,
      username: req.session.user.username,
      canvasNumber: roomId
      });
  }
  else
  {
    res.render("./pages/login",{message: "Login or Register To Start Coloring"});
  }
});

// *****************************************************
// <!-- Authentication middleware. -->
// *****************************************************

const auth = (req, res, next) => {
  if (!req.session.user) 
  {
  // Default to login page.
  return res.redirect('/login');
  }
  next();
};

app.use(auth);
/**
 * Private Gallary will get all artworks pertaining to the logged-in user from the artwork table and send them in a list to privateGallery.hbs page
 */
app.get('/private_gallery', async (req, res) => {
  //added wait time so that autosaved canvases would appear
  setTimeout(async() => {
    if(req.session.user)
    {
      const COLS_PER_ROW = 3;
      const query = `
          WITH user_artwork_ids AS (
            SELECT artwork FROM users_to_artwork
            WHERE username = $1
          )
          SELECT artwork_id, artwork_name, properties, thumbnail 
          FROM artwork INNER JOIN user_artwork_ids
          ON artwork.artwork_id = user_artwork_ids.artwork;
        `;
      
      try 
      {
          const results = await db.any(query,[req.session.user.username]);
          const num_rows = Math.floor(results.length / COLS_PER_ROW) + 1;
          const split_results = [];
          for (let i = 0; i < num_rows; i++) 
          {
            split_results[i] = results.slice(i * COLS_PER_ROW, i * COLS_PER_ROW + COLS_PER_ROW);
          }   
          res.status(200).render('./pages/privateGallery.hbs', {
            artworks: split_results,
            username: req.session.user.username
          });
      }
      catch (err) 
      {
        res.status(404).render('./pages/privateGallery.hbs', {
          artworks: [],
          username: req.session.user.username
        });
      }
    }
    else
    {
      res.render("./pages/login",{message: "Login or Register To Start Coloring"});
    }
  },500);
});

app.post('/load_canvas', (req, res) => {

  if ("new_canvas" in req.body) 
  {
    req.session.saved_canvas = false;
    req.session.artwork_id = -1;
    req.session.artwork_name = "";
  }
  else 
  {
    req.session.saved_canvas = true;
    req.session.artwork_id = req.body.artwork_id;
    req.session.artwork_name = req.body.artwork_name;
  }

  res.status(200).redirect('/pixel-art')
});

// get('/load_canvas') will search for artwork by name and artwork id from the artworks table in users_db. 
// This will then be sent to the front end to load the canvas.
app.get('/load_canvas', async (req, res) => {
  if(req.session.artwork_id != -1)
  {
      const query = `
      WITH user_artwork_ids AS (
        SELECT artwork FROM users_to_artwork
        WHERE username = $1
      ),
      user_artworks AS (
        SELECT * 
        FROM artwork INNER JOIN user_artwork_ids
        ON artwork.artwork_id = user_artwork_ids.artwork
      )
      SELECT * FROM user_artworks
      WHERE user_artworks.artwork_id = $2;
    `;

    try 
    {
      const result = await db.one(query,[req.session.user.username,req.session.artwork_id]);
      if(result.artwork_id != -1)
        {
          res.status(200).send(result);
        }
    }
    catch (err) 
    {
      res.status(400).end("Error Loading Canvas " + err.message);
    }
  }
});

const rooms = new Map();
const socketsToRooms = new Map();

/**
 * This function cleans up after a socket has been disconnected from a room.
 * If a room(Exclusive canvas) is empty then the canvas will be deleted from rooms
 */
function roomOrganizer(socket,roomName)
{
  if(socketsToRooms.has(roomName))
  {
    const sockets = [];
    for (const socketIn of socketsToRooms.get(roomName))
      {
        if(socketIn !== socket.id)
        {
          sockets.push(socketIn);
        }
      }
    if(sockets.length === 0)
    {
      socketsToRooms.delete(roomName);
      rooms.delete(roomName);
      return true;
    }
    else
    {
      socketsToRooms.set(roomName,sockets);
    }
    return false;
  }
}

//This server side code will proccess the transmitted information from the client side and then broadcast the information out to the appropriate websockets
function designateRoom(socket, newRoom) 
{
  console.log("Socket ID: " + socket.id + " Is In Room:" + newRoom);

  socket.join(newRoom);

  if (!socketsToRooms.has(newRoom)) {
    console.log("New Room! Initializing custom room record.");
    socketsToRooms.set(newRoom, [socket.id]);
  } else {
    console.log("User is updated in custom room record.");
    socketsToRooms.get(newRoom).push(socket.id);
  }

  console.log("Socket's current Socket.IO rooms:", socket.rooms);

  const roomData = rooms.get(newRoom);

  if (roomData) 
  {
    console.log("updating room");
    io.to(socket.id).emit("update all", roomData);
  } else 
  {
    console.warn(`Attempted to send 'update all' for room '${newRoom}' but no data found in 'rooms' map.`);
  }
}


io.on('connection', (socket) => {
  console.log('User connected');
  // health ping pong
  socket.on('ping', () => {
    socket.emit('pong');
  });

  // boradcasting update to the room/s that the socket is in. However sockets will only ever be in one room
  socket.on('update', (row, col, chosen_color, canvasHeight, canvasWidth) => {
      for(const roomName of socket.rooms)
      {
        if(roomName !== socket.id)
        {
          console.log(`painting in room ${roomName}`);
          if(!rooms.has(roomName))
          {
            const canvasData = [];
            for (let i = 0; i < canvasHeight; i++) {
                const row = [];
                for (let j = 0; j < canvasWidth; j++) {
                    row.push(0); // 0 means white/empty, 1 means black/filled
                }
                canvasData.push(row);
            }
            canvasData[row][col] = chosen_color;
            rooms.set(roomName,canvasData);
            io.to(roomName).emit("update", row, col, chosen_color);  //broadcasting message to everyone in room
          }
          else
          {
              rooms.get(roomName)[row][col] = chosen_color  //adding message to record
              io.to(roomName).emit("update", row, col, chosen_color);  //broadcasting message to everyone in room
          }
          break;
        }
        
      }
    });

    socket.on('joinRoom', (roomId) => {
      console.log(`Socket ${socket.id} requested to join room: ${roomId}`);
      designateRoom(socket, roomId);
    });

    // on disconnection of websocket roomOrganizer will delete any rooms/saved information about rooms that are now vacant
    socket.on("disconnecting", () => {
    for(const roomName of socket.rooms)
    {
      if(socket.id != roomName)
      {
        roomOrganizer(socket,roomName);
      }
    }
    console.log('User disconnected')
    });

  });

module.exports = server.listen(process.env.PORT || 8080, () => {
  console.log("listening on: "+ process.env.PORT || 8080);
});