import express from "express";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

app.get("/", (req, res) => res.json({ message: "Contract Service running 🚀" }));

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => console.log(`Contract Service listening on port ${PORT}`));