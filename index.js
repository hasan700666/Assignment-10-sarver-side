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

//firebase admin
const admin = require("firebase-admin");

const serviceAccount = require("./firebaseAdminKye.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

//midialware
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
    console.log("decode", decode.email);
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
    const publicFoodCollection = myDB.collection("publicFoodCollection");
    const privateFoodCollection = myDB.collection("privateFoodCollection");

    //create
    app.post("/publicFoodCollection", async (req, res) => {
      //ok
      const New = req.body;
      //console.log("hasan", New);

      const result = await publicFoodCollection.insertOne(New);
      res.send(result);
    });

    //send to privet with email
    //get
    app.get("/privateFoodCollection", verifyTokan, async (req, res) => {
      //ok
      const email = req.query.email;
      const decode = req.decodeEmail;

      if (email == decode) {
        const query = {};
        query.userEmail = email;

        const sorsor = privateFoodCollection.find(query);

        const result = await sorsor.toArray();
        res.send(result);
      }

      res.status(404).send({
        message: "error email",
      });
    });

    //post
    app.post("/privateFoodCollection", async (req, res) => {
      //ok
      const New = req.body;

      const result = await privateFoodCollection.insertOne(New);
      res.send(result);
    });

    //

    //read (one)
    app.get("/publicFoodCollection/:id", async (req, res) => {
      //ok
      const id = req.params.id;
      const qurry = { _id: new ObjectId(id) };
      const result = await publicFoodCollection.findOne(qurry);
      res.send(result);
    });

    //read (all)
    app.get("/publicFoodCollection", async (req, res) => {
      //ok

      const email = req.query.email;
      //console.log(email);
      const query = {};

      if (email) {
        query.userEmail = email;
      }

      const corsor = publicFoodCollection.find(query).sort({ date: -1 });
      const all = await corsor.toArray();
      res.send(all);
    });

    //for my reviews
    // app.get("/publicFoodCollection", async (req, res) => {
    //   //running

    //   const email = req.query.email;
    //   //console.log(email);
    //   const query = {};

    //   if (email) {
    //     query.userEmail = email;
    //   }

    //   const corsor = publicFoodCollection.find(query).sort({ date: -1 });
    //   const all = await corsor.toArray();
    //   res.send(all);
    // });

    //for home
    app.get("/publicFoodCollectionHome", async (req, res) => {
      //ok
      const corsor = publicFoodCollection.find({}).sort({ date: -1 }).limit(6);
      const all = await corsor.toArray();
      res.send(all);
    });

    //privet

    //get
    app.get("/privateFoodCollection/:id", async (req, res) => {
      //ok
      const id = req.params.id;
      const qurry = { _id: new ObjectId(id) };
      const result = await privateFoodCollection.findOne(qurry);
      res.send(result);
    });

    //update
    app.patch("/privateFoodCollection/:id", async (req, res) => {
      //ok

      console.log("hello");
      //
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const body = req.body;
      console.log(body);

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
      const result = await privateFoodCollection.updateOne(
        query,
        update,
        options
      );
      res.send(result);
    });

    //delete
    app.delete("/privateFoodCollection/:id", async (req, res) => {
      //ok
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await privateFoodCollection.deleteOne(query);
      res.send(result);
    });

    //

    //favoriteCollection

    const favoriteCollection = myDB.collection("favoriteCollection");

    //gat
    app.get("/favoriteCollection", verifyTokan, async (req, res) => {
      //ok
      const FromDecodeEmail = req.decodeEmail;
      //console.log("from",FromDecodeEmail);

      const email = req.query.email;
      //console.log(email);
      const query = {};

      if (email == FromDecodeEmail) {
        query.userEmail = email;
        const corsor = favoriteCollection.find(query);
        const allData = await corsor.toArray();
        console.log(allData);
        res.send(allData);
      } else {
        res.status(404).send({
          message: "no email on path or unauthroriz access",
        });
      }
    });

    //post
    app.post("/favoriteCollection", async (req, res) => {
      const NewData = req.body;
      //console.log(NewData);
      const alreadyEx = await favoriteCollection.findOne({
        foodId: NewData.foodId,
        userEmail: NewData.userEmail,
      });
      if (alreadyEx) {
        res.send({ message: "message already exsit" });
      } else {
        const result = await favoriteCollection.insertOne(NewData);
        //console.log(result);

        res.send(result);
      }
    });

    //delete
    app.delete("/favoriteCollection/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await favoriteCollection.deleteOne(query);
      res.send(result);
    });

    //search function
    //get
    app.get("/searchpublicFoodCollection", async (req, res) => {
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
