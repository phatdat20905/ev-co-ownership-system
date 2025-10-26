import express from "express";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

app.get("/", (req, res) => res.json({ message: "Admin Service running 🚀" }));

const PORT = process.env.PORT || 3007;
app.listen(PORT, () => console.log(`Admin Service listening on port ${PORT}`));