const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");
const userRoutes = require("./src/routes/userRoutes");
dotenv.config();

const app = express();
connectDB();
const PORT = process.env.PORT || 4000; 

// middleware
app.use(express.json());
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Athletix API is running 🚀");
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})
