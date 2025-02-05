// Required modules
const http = require('http');
const url = require('url');
const express = require('express');
const path = require('path');
const EventEmitter = require('events');

// Setup
const port = process.env.PORT || 3000;
const app = express();
const chatEmitter = new EventEmitter();

// Serve static files from public directory
app.use(express.static(__dirname + '/public'));

/**
 * Responds with plain text
 * 
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
function respondText(req, res) {
    res.setHeader('Content-Type', 'text/plain');
    res.end('hi');
}

/**
 * Responds with JSON
 * 
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
function respondJson(req, res) {
    res.json({
        text: 'hi',
        numbers: [1, 2, 3]
    });
}

/**
 * Responds with a 404 not found
 * 
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
function respondNotFound(req, res) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
}

/**
 * Responds with the input string in various formats
 * 
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
function respondEcho(req, res) {
    const { input = '' } = req.query;
    
    res.json({
        normal: input,
        shouty: input.toString().toUpperCase(),
        charCount: input.length,
        backwards: input.split('').reverse().join('')
    });
}

/**
 * Serves up the chat.html file
 * 
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
function chatApp(req, res) {
    res.sendFile(path.join(__dirname, 'chat.html'));
}

/**
 * Handles chat messages
 * 
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
function respondChat(req, res) {
    const { message } = req.query;
    if (message) {
        chatEmitter.emit('message', message);
    }
    res.end();
}

/**
 * This endpoint will respond to the client with a stream of server sent events
 * 
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
function respondSSE(req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
    });

    const onMessage = (msg) => {
        res.write(`data: ${msg}\n\n`);
    };

    chatEmitter.on('message', onMessage);

    res.on('close', () => {
        chatEmitter.off('message', onMessage);
    });
}

// Routes
app.get('/', chatApp);
app.get('/json', respondJson);
app.get('/echo', respondEcho);
app.get('/chat', respondChat);
app.get('/sse', respondSSE);

// Start server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});