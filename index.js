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


    //login with JWT
    app.post("/getToken", async (req, res) => {
        const user = req.body.email;
        const payload = {email:user}
        console.log(user)
        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: "1d",
        });
        res.send({ accessToken });
      });

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
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello from to do app");
});

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
