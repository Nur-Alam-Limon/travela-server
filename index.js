const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());
require("dotenv").config();
const port = process.env.PORT || 5000;

const { MongoClient } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xpwab.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const ObjectId = require("mongodb").ObjectId;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
async function run() {
  try {
    await client.connect();
    const database = client.db("travela");
    const events = database.collection("events");
    const booked = database.collection("booked");
    //Create new event
    app.post("/events", async (req, res) => {
      const newEvent = req.body;
      const result = await events.insertOne(newEvent);
      res.json(result);
    });

    //Load Event
    app.get("/events", async (req, res) => {
      const cursor = events.find({});
      const event1 = await cursor.toArray();
      res.send(event1);
    });

    //Update Status
    app.put("/status/:id", async (req, res) => {
      const id = req.params.id;

      const updatedStatus = req.body;

      const filter = { _id: ObjectId(id) };

      const updateDoc = {
        $set: {
          eventStatus: updatedStatus.status,
        },
      };
      const result = await booked.updateOne(filter, updateDoc, options);
      res.json(result);
    });

    //Load Booked Event
    app.get("/allbooking", async (req, res) => {
      const cursor = booked.find({});
      const event2 = await cursor.toArray();
      res.send(event2);
    });

    //delete
    app.delete("/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await booked.deleteOne(query);
      res.json(result);
    });

    //mybooking
    app.get("/mybooking/:mail", async (req, res) => {
      const mail = req.params.mail;
      const order = booked.find({ email: mail });

      res.send(await order.toArray());
    });

    //Load Single Item By ID
    app.get("/placeorder/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const event = await events.findOne(query);
      res.send(event);
    });

    //Booking confirmed
    app.post("/bookconfirm", async (req, res) => {
      const confirmBook = req.body;
      const result = await booked.insertOne(confirmBook);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello");
});

app.listen(port, () => {
  console.log("listening");
});
