const express = require("express");
const app = express();
const port = 3000;
var cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const e = require("express");

// Pick the json data from client
app.use(express.json());

// Middleware
app.use(cors());

//mongodb
//LocalFoodLoversNetwork
//oaH9nDYQwss01XZt

const uri =
  "mongodb+srv://LocalFoodLoversNetwork:oaH9nDYQwss01XZt@cluster0.wkvhhbf.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const myDB = client.db("FoodLover");
    const foodCollection = myDB.collection("foodsCollection");

    //create
    app.post("/foodCollection", async (req, res) => {
      const New = req.body;
      const result = await foodCollection.insertOne(New);
      res.send(result);
    });

    //read (one)
    app.get("/foodCollection/:id", async (req, res) => {
      const id = req.params.id;
      const qurry = { _id: new ObjectId(id) };
      const result = await foodCollection.findOne(qurry);
      res.send(result);
    });

    //read (all)
    app.get("/foodCollection", async (req, res) => {
      const email = req.query.email;
      console.log(email);
      const query = {};

      if (email) {
        query.userEmail = email;
      }

      const corsor = foodCollection.find(query).sort({ date: -1 });
      const all = await corsor.toArray();
      res.send(all);
    });

    //update
    app.patch("/foodCollection/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const body = req.body;
      const update = {
        // $set: {
        //   foodName: body.foodName,
        //   foodImage: body.foodImage,
        //   restaurantName: body.restaurantName,
        //   location: body.location,
        //   starRating: body.starRating,
        //   reviewText: body.reviewText,
        //   userEmail: body.userEmail,
        //   date: body.date,
        // }
        $set: body,
      };
      const options = {};
      const result = foodCollection.updateOne(query, update, options);
      res.send(result);
    });

    //delete
    app.delete("/foodCollection/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodCollection.deleteOne(query);
      res.send(result);
    });

    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
