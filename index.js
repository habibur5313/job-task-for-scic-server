const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8yejb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
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
    await client.connect();
    const document = client.db("jobTaskDB");
    const userCollection = document.collection("users");
    const tasksCollection = document.collection("tasks");
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already exists", insertedId: null });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await userCollection.findOne(query);
      res.send(result);
    });

    app.get("/tasks", async (req, res) => {
      const result = await tasksCollection.find().toArray();
      res.send(result);
    });
    app.post("/tasks", async (req, res) => {
      const list = req.body;
      const result = await tasksCollection.insertOne(list);
      res.send(result);
    });

    app.delete("/tasks/:id",async(req,res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await tasksCollection.deleteOne(query)
      res.send(result)
    })

    app.patch("/tasks/:id",async(req,res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const task = req.body;      
      const update = {
        $set:  {title: task.title,
          description: task.description
        }
      }
      const result = await tasksCollection.updateOne(query,update)
      res.send(result)
      
    })
    app.put("/tasks/:id", async (req, res) => {
      const query = req.params.id;
      console.log(query);
    });
    //     Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //     await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("hello from home");
});

app.listen(port, () => {
  console.log("server is running");
});
