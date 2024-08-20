const express = require('express');
require('dotenv').config();
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

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
    const allProductsCollection = client.db('ShopSphereCollection').collection('productCollection');

    // All products get API with sorting, pagination, and search
    app.get('/products', async (req, res) => {
      const page = parseInt(req.query.page) || 0;
      const size = parseInt(req.query.size) || 10;
      const search = req.query.search || '';
      const sortOrder = req.query.sort || '';

      // Construct the query for search
      const query = {
        productName: { $regex: search, $options: 'i' }
      };

      // Construct the sort object based on the sortOrder
      let sort = {};
      if (sortOrder === 'price-asc') {
        sort = { price: 1 };  // Ascending order by price
      } else if (sortOrder === 'price-desc') {
        sort = { price: -1 }; // Descending order by price
      } else if (sortOrder === 'date-desc') {
        sort = { createdAt: -1 }; // Newest first by date added
      }

      const result = await allProductsCollection.find(query)
        .sort(sort) // Apply sorting
        .skip(page * size)
        .limit(size)
        .toArray();

      res.send(result);
    });

    // Search products API
    app.get('/search', async (req, res) => {
      const search = req.query.search || '';
      const query = {
        productName: { $regex: search, $options: 'i' }
      };
      const result = await allProductsCollection.find(query).toArray();
      res.send(result);
    });

    // Products count API
    app.get('/productsCount', async (req, res) => {
      const count = await allProductsCollection.estimatedDocumentCount();
      res.send({ count });
    });

    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello Shuvo!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
