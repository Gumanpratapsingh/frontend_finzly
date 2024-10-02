const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist/finzly-gps-frontend')));

// Send index.html for any other requests
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/finzly-gps-frontend/index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});