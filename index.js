const express = require("express");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mdick.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    await client.connect();
    const todoCollection = client
      .db("TO_DO_LIST")
      .collection("user_added_to_do");

    //getting user added todos
    app.get("/todos", async (req, res) => {
      const email= req.query;
      const cursor = todoCollection.find({email:email});
      const toDos = await cursor.toArray();
      res.send(toDos);
    });

    //add todo
    app.post('/todos', async(req, res)=>{
        const toDo = req.body;
        const result = await todoCollection.insertOne(toDo);
        res.send(result)   
    });

    //delete todo
    app.delete('/todos/:id', async(req,res)=>{
        const todoId = req.params.id;
        const query = {_id:Object(todoId)};
        const result = await todoCollection.deleteOne(query);
        res.send(result);

    })


  } 
  finally {

  }
};

app.get("/", (req, res) => {
  res.send("Hello from to do app");
});

app.listen(port, () => {
  console.log(`Doctors app listening on port ${port}`);
});
