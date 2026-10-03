import express from "express";
import { AIreply,  } from "../controllers/aiResponses.js";



const AIrouter = express.Router();

AIrouter.post("/ai", AIreply);


export default AIrouter;