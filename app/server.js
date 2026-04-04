const express = require("express");
const { version } = require("./version");
const {
  register,
  httpRequestCounter,
  httpRequestDuration
} = require("./metrics");

const app = express();

app.get("/", (req, res) => {
  const end = httpRequestDuration.startTimer();

  httpRequestCounter.inc();

  res.send(`App running - Version: ${version}`);

  end();
});

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.listen(3000, () => console.log("Running on 3000"));