import app from "./app";
import dotenv from "dotenv";
import cors from 'cors';

// Load environment variables
dotenv.config();

// Set the timezone
process.env.TZ = process.env.TZ || 'Africa/Nairobi';

const PORT = process.env.PORT || 3000;
app.use(cors({
  origin: 'http://localhost:4200', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  allowedHeaders: ['Content-Type', 'Authorization'] 
}));

// Log the server's current time when starting
console.log(`Server starting at: ${new Date().toLocaleString('en-US', { timeZone: process.env.TZ })}`);


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Server time: ${new Date().toLocaleString('en-US', { timeZone: process.env.TZ })}`);
});