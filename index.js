const express = require("express");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

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


//verify JWT token
const verifyToken = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
      return res
        .status(401)
        .send({ authorization: false, message: "Unauthorized access" });
    }
    const token = authorization.split(" ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res
          .status(403)
          .send({ authorization: false, message: "Forbidded access" });
      }
      req.decoded = decoded;
      next();
    });
  };


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
        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: "1d",
        });
        res.send({ accessToken });
      });

    //getting user added todos
    app.get("/todos",verifyToken, async (req, res) => {
      const email= req.query.email;
      const cursor = todoCollection.find({email:email});
      const toDos = await cursor.toArray();
      res.send({authorization:true,toDos});
    });

    //add todo
    app.post('/todos',verifyToken, async(req, res)=>{
        const toDo = req.body;
        const result = await todoCollection.insertOne(toDo);
        res.send(result)   
    });

    //delete todo
    app.delete('/todos/:taskId',verifyToken, async(req,res)=>{
        const id = req.params.taskId;
        const query = {_id:ObjectId(id)}
        const result = await todoCollection.deleteOne(query);
        res.send(result);
    })

    //update todo
    app.patch('/todos/:todoId',verifyToken, async(req, res)=>{
        const id = req.params.todoId;
        const updatedField = req.body;
        const filter = {_id:ObjectId(id)};
        const updatedDoc = {
            $set:{
                completed:updatedField.completed
            }
        }
        const result = await todoCollection.updateOne(filter, updatedDoc);
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
