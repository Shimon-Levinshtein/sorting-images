const express = require('express');
const cors = require('cors');
const fileRoutes = require('./routes/fileRoutes');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

// Use the file routes
app.use('/api', fileRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 