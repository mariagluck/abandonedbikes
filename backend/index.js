import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import requestlogger from "./middleware/requestlogger.js";
import Report from './models/report.js';
import mongoose from 'mongoose';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(requestlogger);


const {
  DB_USER,
  DB_PASS,
  DB_HOST,
  DB_PORT
} = process.env;
const connectionString = `mongodb://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/exampledb`;

mongoose.connection.on('error', (e) => console.log(">> Error!", e) || process.exit(0));
mongoose.connection.on('connecting', () => console.log(">> Connecting"));
mongoose.connection.on('disconnecting', () => console.log(">> Disconnecting"));
mongoose.connection.on('disconnected', () => console.log(">> Disconnected"));


app.get('/notifications', (req,res,next)=> {
  mongoose.connect(connectionString)
  .then(async () => {
      const allNotifications = await Report.find();
      res.json(allNotifications)
  })
  .catch((err) => {
      console.log("Error connecting to MongoDB", err);
      res.status(500);
      res.json({ success: false, error: "Connection error!" });
  })
  .finally(() => {
  mongoose.connection.close()
  })
});

    // mongoose.connect(connectionString)
    // .listCollections()
    // .toArray()
    // .then(collection => {
    //     const dataArr = []; 
    //     collection.forEach(el => dataArr.push(el._id));
    //     res.status(200).json({ status: 'success', data: { dataArr } })
//     });
// })

app.post("/notifications", (req, res) => {
  console.log("Received", req.body);
  // Somehow save data to DB
  mongoose.connect(connectionString)
    .then(async () => {
      console.log("Saving report");
      const report = new Report(req.body);

      await report.save();

      console.log("new abandoned bike report filed!");
      res.status(201);
      res.json({
        success: true
      });
    })
    .catch((error) => {
      console.log("There was an error registering your report: ", error);
      res.status(500);
      res.json({
        success: false,
        error: "Connection error!"
      });
    })
    .finally(() => {
      mongoose.connection.close();
    });
});


app.use((req, res) => {
  res.status(404);
  res.send("I don't have what you seek");
});

app.listen(process.env.PORT, () => {
  console.info(`App listening on http://localhost:${process.env.PORT}`);
});