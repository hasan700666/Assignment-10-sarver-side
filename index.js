const express = require("express"); //
const app = express(); //
const port = process.env.PORT || 3000; //
var cors = require("cors"); //
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb"); //
require("dotenv").config();

// Pick the json data from client
app.use(express.json());

// Middleware
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wkvhhbf.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

//firebase admin
const admin = require("firebase-admin");

//const serviceAccount = require("./firebaseAdminKye.json");

//index.js
const decoded = Buffer.from(process.env.fireBase_kye, "base64").toString(
  "utf8"
);
const serviceAccount = JSON.parse(decoded);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

//middleware
const verifyTokan = async (req, res, next) => {
  const autorization = req.headers.authorization;

  if (!autorization) {
    return res.status(401).send({
      message: "unauthrorized token",
    });
  }

  const token = autorization.split(" ")[1];

  try {
    const decode = await admin.auth().verifyIdToken(token);
    req.decodeEmail = decode.email;
    next();
  } catch (error) {
    res.status(401).send({
      message: "unauthrorized token",
    });
  }
};

async function run() {
  try {
    const myDB = client.db("FoodLover");
    const publicFoodCollection = myDB.collection("publicFoodCollection"); //public
    const privateFoodCollection = myDB.collection("privateFoodCollection"); //privet
    const favoriteCollection = myDB.collection("favoriteCollection"); //favorite
    const topFoodBloggers = myDB.collection("topFoodBloggers"); //foodBloggers

    //home --> react start  id = 1
    app.get("/publicFoodCollectionHome", async (req, res) => {
      const corsor = publicFoodCollection
        .find({})
        .sort({ starRating: -1 })
        .limit(6);
      const all = await corsor.toArray();
      res.send(all);
    });

    //home --> react end

    // all review --> react start  id = 2
    app.get("/publicFoodCollection", async (req, res) => {
      const corsor = publicFoodCollection.find({}).sort({ date: -1 });
      const all = await corsor.toArray();
      res.send(all);
    });

    // all review --> react end

    //add review --> react start id = 3
    app.post("/publicFoodCollection", verifyTokan, async (req, res) => {
      const New = req.body;
      const result = await publicFoodCollection.insertOne(New);
      res.send(result);
    });

    //add review --> react end

    //add review --> react start id = 4
    app.post("/privateFoodCollection", verifyTokan, async (req, res) => {
      const New = req.body;
      const result = await privateFoodCollection.insertOne(New);
      res.send(result);
    });

    //add review --> react end

    //my review --> react start id = 5
    app.get("/privateFoodCollection", verifyTokan, async (req, res) => {
      const decodedEmailfromVeryfecation = req.decodeEmail;

      const query = {};
      const email = req.query.email;

      if (email == decodedEmailfromVeryfecation) {
        query.userEmail = email;
        const corsor = privateFoodCollection.find(query);
        const allData = await corsor.toArray();
        res.send(allData);
      } else {
        res.status(400).send({
          message: "bed req",
        });
      }
    });

    //my review --> react end

    //update --> react start id = 6
    app.get("/privateFoodCollection/:id", verifyTokan, async (req, res) => {
      const id = req.params.id;
      const queary = { _id: new ObjectId(id) };
      const result = await privateFoodCollection.findOne(queary);
      res.send(result);
    });

    // //update --> react end

    //update --> react start id = 7
    app.patch("/publicFoodCollection/:id", verifyTokan, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const body = req.body;
      const update = {
        $set: body,
      };
      const options = {};
      const result = await publicFoodCollection.updateOne(
        query,
        update,
        options
      );
      res.send(result);
    });

    //update --> react end

    //update --. react start id = 8
    app.patch("/privateFoodCollection", verifyTokan, async (req, res) => {
      const food_id = req.query.foodId;
      const query = {};

      if (food_id) {
        query.foodId = food_id;
        const body = req.body;
        const update = {
          $set: body,
        };
        const option = {};
        const result = await privateFoodCollection.updateOne(
          query,
          update,
          option
        );
        res.send(result);
      } else {
        return res.status(400).send({ message: "foodId is required" });
      }
    });

    //update --> react end

    //my review --> react start id = 9
    app.delete("/privateFoodCollection/:id", verifyTokan, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await privateFoodCollection.deleteOne(query);
      res.send(result);
    });

    //my review --> react end

    //my review --> react start id = 10
    app.delete("/publicFoodCollection/:id", verifyTokan, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await publicFoodCollection.deleteOne(query);
      res.send(result);
    });

    //my review --> react end

    //(favoriteCollection) all review --> react start id = 11
    app.post("/favoriteCollection", verifyTokan, async (req, res) => {
      const NewData = req.body;
      const alreadyEx = await favoriteCollection.findOne({
        foodId: NewData.foodId,
        userEmail: NewData.userEmail,
      });
      if (alreadyEx) {
        res.send({ message: "message already exsit" });
      } else {
        const result = await favoriteCollection.insertOne(NewData);
        res.send(result);
      }
    });

    //(favoriteCollection) all review --> react end

    //(favoriteCollection) my favorite --> react start id = 12
    app.get("/favoriteCollection", verifyTokan, async (req, res) => {
      const FromDecodeEmail = req.decodeEmail;
      const email = req.query.email;
      if (email == FromDecodeEmail) {
        const corsor = favoriteCollection.find({});
        const allData = await corsor.toArray();
        res.send(allData);
      } else {
        res.status(404).send({
          message: "no email on path or unauthroriz access",
        });
      }
    });

    //(favoriteCollection) my favorite --> react end

    //(favoriteCollection) my favorites card --> react start id = 13
    app.delete("/favoriteCollection/:id", verifyTokan, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await favoriteCollection.deleteOne(query);
      res.send(result);
    });

    //(favoriteCollection) my favorites card --> react end

    //(favoriteCollection) update --> react start id = 14
    app.patch("/favoriteCollection", verifyTokan, async (req, res) => {
      const food_id = req.query.foodId;
      console.log("i = 14", food_id);
      const query = {};

      if (food_id) {
        query.foodId = food_id;
        const body = req.body;
        const update = {
          $set: body,
        };
        const option = {};
        const result = await favoriteCollection.updateOne(
          query,
          update,
          option
        );
        res.send(result);
      } else {
        return res.status(400).send({ message: "foodId is required" });
      }
    });

    //(favoriteCollection) update --> react end

    //(favoriteCollection) update --> react start id = 15
    app.delete("/favoriteCollection", verifyTokan, async (req, res) => {
      const food_id = req.query.foodId;
      console.log("i = 15", food_id);
      const queary = { foodId: food_id };
      const result = await favoriteCollection.deleteOne(queary);
      res.send(result);
    });

    //(favoriteCollection) update --> react end

    //food details --> react start id = 16
    app.get("/publicFoodCollection/:id", async (req, res) => {
      const id = req.params.id;
      const qurry = { _id: new ObjectId(id) };
      const result = await publicFoodCollection.findOne(qurry);
      res.send(result);
    });

    //food details --> react end

    //search function --> react start id = 17
    app.get("/searchPublicFoodCollection", async (req, res) => {
      const search = req.query.search;
      console.log("search query:", search);
      let query = {};

      if (search) {
        query = { foodName: { $regex: search, $options: "i" } };
      }

      const corsor = publicFoodCollection.find(query);
      const Data = await corsor.toArray();
      res.send(Data);
    });

    //search function --> react end

    //top food bloggers data
    app.get("/topFoodBloggers", async (req, res) => {
      const carsor = topFoodBloggers.find({});
      const allData = await carsor.toArray();
      res.send(allData);
    });

    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
