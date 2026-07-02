require('dotenv').config();

const express = require("express");
const path = require("path");
const fs = require("fs");
const morgan = require("morgan");

const { connectToMongoDB } = require("./connect");
const urlRoute = require("./routes/url");
const staticRoute = require("./routes/staticRouter");
const cookieParser = require("cookie-parser");
const userRoute = require("./routes/user");

const {
  restrictToLoggedinUserOnly,
  checkAuth,
} = require("./middlewares/auth");

const URL = require("./models/url");

const app = express();
const PORT = process.env.PORT || 8001;

// Create logs folder if not exists
const logsDir = path.join(__dirname, "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Create log stream
const accessLogStream = fs.createWriteStream(
  path.join(logsDir, "access.log"),
  { flags: "a" }
);

// Morgan logger middleware
morgan.format("custom", (tokens, req, res) => {
  const time = new Date().toLocaleString();
  const ip = tokens["remote-addr"](req, res);
  const method = tokens.method(req, res);
  const route = tokens.url(req, res);
  const status = tokens.status(req, res);

  let action = "Page Visit";
  let shortId = "N/A";

  if (route.includes("/url/") && method === "GET") {
    action = "Redirect Click";
    shortId = route.split("/url/")[1];
  } else if (route === "/url" && method === "POST") {
    action = "Short URL Generated";
  }

  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Time     : ${time}
IP       : ${ip}
Action   : ${action}
Short ID : ${shortId}
Route    : ${route}
Status   : ${status}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
});

app.use(morgan("custom", { stream: accessLogStream }));

connectToMongoDB(process.env.MONGO_URL).then(() =>
  console.log("Mongo is started")
);

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

// Routes
app.use("/url", restrictToLoggedinUserOnly, urlRoute);
app.use("/", checkAuth, staticRoute);
app.use("/user", userRoute);

// Redirect route
app.get("/url/:shortId", async (req, res) => {
  const shortId = req.params.shortId;

  const entry = await URL.findOneAndUpdate(
    { shortId },
    {
      $push: {
        visitHistory: {
          timestamp: Date.now(),
        },
      },
    }
  );

  res.redirect(entry.redirectURL);
});

app.listen(PORT, () =>
  console.log(`Server started at PORT: ${PORT}`)
);