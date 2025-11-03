import express from "express";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

app.get("/", (req, res) => res.json({ message: "API Gateway running 🚀" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API Gateway listening on port ${PORT}`));