const express = require("express");
const cors = require("cors");
//cors extra --------------

// ------------

//jwt
const jwt = require("jsonwebtoken");
require("dotenv").config();
const {
  MongoClient,
  ServerApiVersion,
  ObjectId,
  ClientSession,
} = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

////////////////////////////////////////
// mongoDB  everything starts
////////////////////////////////////////

const uri = `mongodb+srv://${process.env.db_user}:${process.env.db_pass}@simple-del.4ijtj0g.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect();
    const toysCollection = client.db("toysDB").collection("toys");

    ////////////////////////////////////////
    // mongoDB  API CRUD starts here
    ////////////////////////////////////////

    // get all toys data from the mongoDB server //
    try {
      app.get("/toys", async (req, res) => {
        const results = await toysCollection.find().toArray();
        res.send(results);
      });
    } catch (error) {
      console.log(error);
    }

    // // all updated
    // try {
    //   app.patch("/toys/all", async (req, res) => {
    //     // Specify the filter to match the documents you want to update
    //     const filter = { subCategory: { $gte: "Art & Books" } };

    //     // Specify the update to be applied to the matching documents
    //     const update = { $inc: { age: 1 } };

    //     // Use the updateMany method to update all matching documents
    //     const result = await collection.updateMany(filter, update);

    //     console.log(`${result.modifiedCount} documents updated`);

    //     res.send(result);
    //   });
    // } catch (error) {
    //   console.log(error);
    // }
    // get toy by id from mongodb
    try {
      app.get("/toy/:id", async (req, res) => {
        const id = req.params.id;
        const results = await toysCollection.findOne({ _id: new ObjectId(id) });
        res.send(results);
      });
    } catch (error) {
      console.log(object);
    }

    // get by category
    try {
      app.get("/category/:id", async (req, res) => {
        const category = req.params.id;
        console.log(category);
        const results = await toysCollection
          .find({ subID: category })
          .toArray();
        res.send(results);
      });
    } catch (error) {
      console.log(error);
    }

    // delete toy by id from
    try {
      app.delete("/toys/:id", async (req, res) => {
        const id = req.params.id;
        const results = await toysCollection.deleteOne({
          _id: new ObjectId(id),
        });
        res.send(results);
      });
    } catch (error) {
      console.log(error);
    }

    // insert toys
    try {
      app.post("/toysadd", async (req, res) => {
        const body = req.body;
        const result = await toysCollection.insertOne(body);
        res.send(result);
      });
    } catch (error) {
      console.log(error);
    }

    // update toys by id
    try {
      app.put("/toysedit/:id", async (req, res) => {
        const id = req.params.id;
        const {
          name,
          pictureURL,
          sellerName,
          sellerEmail,
          subCategory,
          price,
          rating,
          availableQuantity,
          description,
        } = req.body;
        const filter = { _id: new ObjectId(id) };
        const update = {
          $set: {
            name,
            pictureURL,
            sellerName,
            sellerEmail,
            subCategory,
            price,
            rating,
            availableQuantity,
            description,
          },
        };
        const options = { upsert: true };
        const results = await toysCollection.updateOne(filter, update, options);
        res.send(results);
        console.log(results);
      });
    } catch (error) {
      console.log(error);
    }

    //search
    try {
      const indexKey = { name: 1, category: 1 };
      const indexOptions = { name: "nameCategory" };

      await toysCollection.createIndex(indexKey, indexOptions);

      app.get("/toySearch/:text", async (req, res) => {
        const searchQuery = req.params.text;

        const result = await toysCollection
          .find({
            $or: [
              { name: { $regex: searchQuery, $options: "i" } },
              { category: { $regex: searchQuery, $options: "i" } },
            ],
          })
          .toArray();
        res.send(result);
      });
    } catch (error) {
      console.log(error);
    }

    //////////////////// sort //////////////////////////////////
    app.get("/toys/all", async (req, res) => {
      try {
        const sortOrder = req.query.sortOrder === "ascending" ? 1 : -1;
        const sortedToys = await toysCollection
          .find()
          .sort({ price: sortOrder })
          .toArray();
        res.json(sortedToys);
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .json({ error: "An error occurred while fetching toys." });
      }
    });

    ////////////////////////////////////////
    // mongoDB  everything ends here
    ////////////////////////////////////////

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

////////////////////////////////////////
// mongoDB  everything ends here
////////////////////////////////////////

// test and home routes
app.get("/", (req, res) => {
  res.send("simple toy CRUD");
});
app.listen(port, () => {
  console.log(`simple CRUD listening on ${port}`);
});
