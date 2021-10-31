const express = require('express');
const app = express();
const cors = require('cors')
const port = process.env.PORT || 5000;

const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

require('dotenv').config()

app.use(cors());
app.use(express.json());

//user: dreamIsland
//pass: PF2tL2VgZMvONx83

//database connection

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jz7ev.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {


      await client.connect();
      const database = client.db("dreamIsland");
      const orderCollection = database.collection("order");
      const servicesCollection = database.collection("services");
      


      //load all data
      app.get('/services', async (req, res) => {
        
        const cursor = servicesCollection.find({});
        const services = await cursor.toArray();

        console.log('data load successfully');
        res.json(services);
      }) 
      //get single data by key
      app.get('/services/:id', async (req, res) => {
          const id = req.params.id;
          
          const query = { _id: ObjectId(id) };
          
          const result = await servicesCollection.findOne(query);

          console.log('data base find', result);
          res.json(result);
      })

      app.post('/addService', async (req, res) => {
          const data = req.body;
          const result = await servicesCollection.insertOne(data);

          res.json(result);
      })


      //update status
      app.post('/updateStatus', async (req, res) => {
        const id = req.body.id;
        const status = req.body.status;

        const filter = { _id: ObjectId(id) }
        const options = { upsert: true };
        const updateStatus =  {
            $set: {
              "status": status === 'pending' ? 'approved ' : 'pending'
            },
          };

        const result = await orderCollection.updateOne(filter, updateStatus, options);

        console.log('database hitted', result);
        res.json(result);
      })

      //get my order by gmail
      app.post('/services/myOrder', async (req, res) => {
          const email = req.body.email;

          const query = {"email": email};

          const result = await orderCollection.find(query).toArray();

          res.json(result);
      })

      //delete order item by _id
      app.get("/order/deleteOrder/:id", async (req, res) => {
          const id = req.params.id;
          console.log(id);
          const query = {_id: ObjectId(id)}

          const result = await orderCollection.deleteOne(query);

          console.log('delete successfully', result);
          res.json(result);
      })

      //get all order
      app.get('/allOrder', async (req, res) => {
          const result = orderCollection.find({});
          const allOrders = await result.toArray();
          console.log('server is ready');
          res.json(allOrders);
      })
      

      //insert order
      app.post('/services/order', async (req, res) => {
          const data = req.body;
          const result = await orderCollection.insertOne(data);
          res.json(result);
      })

    } finally {
    //   await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('hello world');
})

app.listen(port, (req, res) => {
    console.log('listening to port: ', port);
})