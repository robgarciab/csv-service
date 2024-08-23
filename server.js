const express = require('express');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const multer = require('multer');
const { Parser } = require('json2csv');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure Multer for file uploads
const upload = multer({ dest: 'uploads/' });

let csvData = {};
let currentIndexes = {};
let resetTimers = {};

// Get RESET_TIME_MS from environment variables or default to 5 minutes
const RESET_TIME_MS = process.env.RESET_TIME_MS ? parseInt(process.env.RESET_TIME_MS, 10) : 5 * 60 * 1000;

// Initialize csvData with files in the /uploads folder
function initializeCsvData() {
  const uploadDir = path.join(__dirname, 'uploads');

  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      console.error('Error reading uploads directory:', err);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(uploadDir, file);
      const data = [];

      fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (row) => {
            data.push(row);
          })
          .on('end', () => {
            csvData[file] = data;
            currentIndexes[file] = 0;
            setResetTimer(file); // Set a reset timer for each file
            console.log(`File ${file} initialized with ${data.length} records.`);
          });
    });
  });
}

// Upload and parse the CSV file
app.post('/upload', upload.single('file'), (req, res) => {
  const filename = req.file.originalname;
  const filePath = path.join(__dirname, req.file.path);
  const data = [];

  fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        data.push(row);
      })
      .on('end', () => {
        csvData[filename] = data;
        currentIndexes[filename] = 0;
        clearTimeout(resetTimers[filename]); // Clear any existing timer
        setResetTimer(filename); // Set a new reset timer
        res.json({ message: `File ${filename} uploaded and parsed successfully.` });
      });
});

// Retrieve the next set of records as a CSV file
app.get('/splitedfile', (req, res) => {
  const { filename, n } = req.query;
  const count = parseInt(n, 10);

  if (!csvData[filename]) {
    return res.status(404).json({ error: 'File not found.' });
  }

  const startIndex = currentIndexes[filename];
  const endIndex = startIndex + count;
  const records = csvData[filename].slice(startIndex, endIndex);

  currentIndexes[filename] = endIndex >= csvData[filename].length ? 0 : endIndex;

  // Clear any existing timer and reset it
  clearTimeout(resetTimers[filename]);
  setResetTimer(filename);

  if (records.length === 0) {
    return res.status(204).json({ message: 'No more records available.' });
  }

  // Convert the records to CSV format
  const json2csvParser = new Parser();
  const csvDataString = json2csvParser.parse(records);

  // Set headers and send the CSV file
  res.header('Content-Type', 'text/csv');
  res.attachment(`split_${filename}`);
  res.send(csvDataString);
});

// Set a reset timer for a specific file
function setResetTimer(filename) {
  resetTimers[filename] = setTimeout(() => {
    currentIndexes[filename] = 0;
    console.log(`File ${filename} index has been reset due to inactivity.`);
  }, RESET_TIME_MS);
}

// Function to clear all active timers
function clearAllTimers() {
  for (const filename in resetTimers) {
    clearTimeout(resetTimers[filename]);
  }
}

// Start the server and initialize csvData
const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Reset time is set to ${RESET_TIME_MS / 1000} seconds.`);
  initializeCsvData(); // Initialize csvData on server start
});

// Clear timers when the server is closed
server.on('close', clearAllTimers);

module.exports = server;