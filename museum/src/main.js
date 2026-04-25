import dotenv from "dotenv";
import express from "express";

import { logRequests, handleErrors } from "./middleware.js";

dotenv.config();

const app = express();
const host = process.env.LISTEN_HOST || "127.0.0.1";
const port = Number(process.env.LISTEN_PORT || 9001);

app.use(express.json());
app.use(logRequests);

app.get("/health", (req, res) => {
    res.status(200).json({
        service: "museum",
        status: "ok",
    });
});

app.use(handleErrors);

app.listen(port, host, () => {
    console.log(`Museum-Service läuft auf http://${host}:${port}`);
});