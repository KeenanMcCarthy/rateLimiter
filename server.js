const express = require('express');
const https = require('http');
const { Pool, Client } = require("pg");

const app = express();

const port = process.env.PORT;
const loadBalancer = process.env.LB;
const interval = process.env.TINT;
const maxRequests = process.env.MAXREQ;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "rlproject"+port,
  password: "maeve33",
  port: "5432"
});

function register(){
  let reqBody = JSON.stringify({
    port: port
  });
  const server = {
    hostname: 'localhost',
    port: loadBalancer,
    path: '/registerServer',
    method: 'POST',
    headers: {
      'Content-type': 'application/JSON',
      'Content-length': reqBody.length
    }
  }
  var req = https.request(server, (res) => {
    res.setEncoding('utf8');
    res.on('data', (chunk) =>{
      console.log(chunk);
    });
  });
  req.write(reqBody);
  req.on('error', (err) => {
    console.log("ERROR: " + JSON.stringify(err));
  });
  req.end();
}

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
  register();
});

app.get('/hello/:username', (req, res) => {
  var username = req.params.username;
  var query = "BEGIN; SELECT get_user_requests('"+username+"'::text, "+interval+","+maxRequests+"); COMMIT;";

  pool.query(query, (error, response) => {
    numQueries = response[1]["rows"][0]["get_user_requests"];
    res.send(JSON.stringify({port: port, numQueries: numQueries}));
  });
});
