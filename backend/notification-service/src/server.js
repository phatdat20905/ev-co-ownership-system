import express from "express";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

app.get("/", (req, res) => res.json({ message: "Notification Service running 🚀" }));

const PORT = process.env.PORT || 3008;
app.listen(PORT, () => console.log(`Notification Service listening on port ${PORT}`));