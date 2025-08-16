const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// CORS (allow your frontend; comma-separate multiple origins in CLIENT_ORIGIN)
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN
      ? process.env.CLIENT_ORIGIN.split(",")
      : true,
    credentials: true,
  })
);
app.use(express.json());

// DB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB:", err));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/mood", require("./routes/moodRoutes"));
app.use("/api/journal", require("./routes/journalRoutes"));
app.use("/api/cbt", require("./routes/cbtRoutes"));
app.use("/api/profile", require("./routes/profileRoutes"));
app.use("/api/admin", require("./routes/admin")); // ← admin routes (users list/actions/export)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
