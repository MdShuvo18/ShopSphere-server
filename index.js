const express = require('express');
require('dotenv').config()
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ameizfp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    const allProductsCollection = client.db('ShopSphereCollection').collection('productCollection')


    // all products get api
    app.get('/products', async (req, res) => {
      // console.log(req.query)
      // for searcing

      // console.log(query)
      // for pagination
      const page = parseInt(req.query.page)
      const size = parseInt(req.query.size)
      const filter = req.query
      console.log(filter)
      const query = {
        productName: {
          $regex: filter.search, $options: 'i'

        }
      }

      const result = await allProductsCollection.find()
        .skip(page * size)
        .limit(size)
        .toArray();
      console.log(result)
      res.send(result);
    })

    app.get('/search', async (req, res) => {
      console.log(req.query)
      const filter = req.query
      console.log(filter)
      const query = {
        productName: {
          $regex: filter.search,
          $options: 'i'

        }
      }
      const cursor = allProductsCollection.find(query)
      const result = await cursor.toArray()
      console.log(result)
      res.send(result)
    })
    // products count api
    app.get('/productsCount', async (req, res) => {
      const count = await allProductsCollection.estimatedDocumentCount()
      // console.log(count)
      res.send({ count })
    })


    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello shuvo!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})