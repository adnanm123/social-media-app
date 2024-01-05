require('dotenv').config(); // Ensure this is at the top to load environment variables

const express = require('express');
const { expressjwt: jwt } = require('express-jwt'); // Corrected line: use destructuring to rename expressjwt to jwt
const jwksRsa = require('jwks-rsa');
const app = express();

// Middleware for checking JWT tokens
const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: process.env.JWKS_URI // Use the JWKS_URI from your .env file
  }),
  audience: process.env.AUTH0_CLIENT_ID, // Use the AUTH0_CLIENT_ID from your .env file
  issuer: `https://${process.env.AUTH0_DOMAIN}/`, // Use the AUTH0_DOMAIN from your .env file
  algorithms: ['RS256']
});

// Public route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Protected route
app.get('/protected', checkJwt, (req, res) => {
  res.send('Hello from a protected route!');
});

// Error handling for unauthorized access
app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).send('Invalid token, or no token supplied!');
  } else {
    next(err);
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
