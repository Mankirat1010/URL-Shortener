const shortid = require("shortid");
const URL = require("../models/url");

async function handelGenerateNewShortURL(req, res) {
  const body = req.body;

  if (!body.url) {
    return res.status(400).json({ error: "url is required" });
  }

  const shortID = shortid();

  await URL.create({
    shortId: shortID,
    redirectURL: body.url,
    visitHistory: [],
    createdBy: req.user.id,
  });

  const allurls = await URL.find({ createdBy: req.user.id });

  return res.render("home", {
    id: shortID,
    urls: allurls,
  });
}

async function handleGetAnalytics(req, res) {
  const shortId = req.params.shortId;
  const result = await URL.findOne({ shortId });

  return res.json({
    totalClicks: result.visitHistory.length,
    analytics: result.visitHistory,
  });
}

async function handleDeleteURL(req, res) {
  const id = req.params.id;

  await URL.findByIdAndDelete(id);

  return res.redirect("/");
}

module.exports = {
  handelGenerateNewShortURL,
  handleGetAnalytics,
  handleDeleteURL,
};