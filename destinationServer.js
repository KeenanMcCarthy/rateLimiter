const express = require('express');

const app = express();

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

app.get('/:username', (req, res) => {
  let username = req.params.username;
  console.log("request received");
  res.send(`hello from port ${port} ${username}\n`);
});
