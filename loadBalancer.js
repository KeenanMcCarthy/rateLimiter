const https = require('http');
const express = require('express');
const crypto = require('crypto');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

var serverMap = {};

const port = process.env.PORT;
const quorumSize = process.env.QSIZE;
const maxLimit = process.env.LIMIT;
const destPort = process.env.DESTPORT;
const destIP = process.env.DESTIP;

let availNodes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];

function deleteServer(to_delete){
  for (var key in serverMap){
    if (serverMap[key] === to_delete){
      availNodes.push(key);
      delete serverMap[key];
    }
  }
}

app.listen(port, () => {});

app.post('/registerServer', (req, res) => {
  var registereePort = req.body.port;
  var virtualNodes = [];
  for (var i=0; i<3; i++){
    const randInd = Math.floor(Math.random()*availNodes.length);
    serverMap[availNodes[randInd]] = registereePort;
    virtualNodes.push(availNodes[randInd]);
    availNodes.splice(randInd, 1);
  }
  res.send(`registered on virtual nodes: ${virtualNodes.toString()}`);
});

app.get('/:username', (request, response)=>{

  var username = request.params.username;

  const md5sum = crypto.createHash('md5');
  md5sum.update(username);
  const encrypted = parseInt(md5sum.digest('hex'), 16);
  var serverNum = encrypted%61;
  var requestedNodes = [];
  var quorumNodes = {};

  let p1 = new Promise((resolve, reject) => {
    function sendRequest(username, serverNum){
      const server = {
        hostname: 'localhost',
        port: serverMap[serverNum],
        path: '/hello/'+username,
        method: 'GET'
      };
      var req = https.request(server, (res)=>{
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          let quorumPort = JSON.parse(chunk).port;
          quorumNodes[quorumPort] = JSON.parse(chunk).numQueries;
          if (Object.keys(quorumNodes).length >= quorumSize){
            resolve();
          }
        });
      });
      req.on('error', (e)=>{
        console.log("error: " + e);
        serverNum = (serverNum+1)%61;
        while (!(serverNum in serverMap && !(requestedNodes.includes(serverMap[serverNum])))){
          serverNum = (serverNum+1)%61;
        }
        requestedNodes.push(serverMap[serverNum]);
        sendRequest(username, serverNum);
      });
      req.end();
    }
    for (var i=0; i<quorumSize; i++){
      while (!(serverNum in serverMap && !(requestedNodes.includes(serverMap[serverNum])))){
        serverNum = (serverNum+1)%61;
      }
      requestedNodes.push(serverMap[serverNum]);
      sendRequest(username, serverNum);
      serverNum = (serverNum+1)%61;
    }
  })
  .then(() => {
    console.log("quorum nodes: " + JSON.stringify(quorumNodes));
    let max = 0;
    for (const node in quorumNodes){
      if (quorumNodes[node] > max){
        max = quorumNodes[node];
      }
    }
    if (max >= maxLimit){
      response.send("Request blocked, try again in 5 minutes\n");
    } else {
      const server = {
        hostname: destIP,
        port: destPort,
        path: '/:username',
        method: 'GET'
      };
      var req = https.request(server, (res)=>{
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
            response.send(chunk);
        });
      });
      req.end();
    }
  });
});
