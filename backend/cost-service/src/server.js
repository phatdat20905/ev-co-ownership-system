import express from "express";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

app.get("/", (req, res) => res.json({ message: "Cost Service running 🚀" }));

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => console.log(`Cost Service listening on port ${PORT}`));