const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
const httpProxy = require('express-http-proxy');
const routes = require('./routes');
const PORT = 3000;


// Secret key for JWT signing
const secretKey = 'yourSecretKey';

// Middleware to authenticate incoming requests

app.use((req, res, next) => {
    if (req.originalUrl === '/api/generate-token') next();
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized - Token not provided' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            console.error('Error verifying token:', err,token);
            return res.status(401).json({ error: 'Unauthorized - Invalid token' });
        }

        // Log the decoded user information
        console.log('Decoded User:', decoded);

        // Attach the decoded user information to the request object
        req.user = decoded;

        next();
    });
});

app.get('/api/generate-token', (req, res) => {
    const user = { userId: 123, username: 'example' };

    // Sign the JWT token with user information
    const token = jwt.sign(user, secretKey, { expiresIn: '1h' });

    res.json({ token });
});

const pathOptions = {
    proxyReqPathResolver: function (req) {
      var parts = req.url.split("/api/");
      var queryString = parts[1];
      return '/'+queryString;
    }
};

Object.keys(routes).forEach((route)=>{
    app.all(['/api/'+route,'/api/'+route+'/*'],httpProxy(routes[route],pathOptions))
});

app.listen(PORT, () => {
    console.log(`Authentication service is running on http://localhost:${PORT}`);
});
