const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const fileUpload = require('express-fileupload');
const ObjectId = require('mongodb').ObjectId;
// const bodyParser = require('body-parser')
const port = 4000

const app = express();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xflbu.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

app.use(cors());
app.use(express.json());
app.use(fileUpload());
// app.use(bodyParser())


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const ordersCollection = client.db("creativeAgency").collection("orders");
  const reviewCollection = client.db("creativeAgency").collection("reviews");
  const serviceCollection = client.db("creativeAgency").collection("services");
  const adminsCollection = client.db("creativeAgency").collection("admin");
  
  app.post('/addOrder', async (req, res) =>{
    const orderName = req.body.orderName;
    const orderEmail = req.body.orderEmail;
    const orderCategory = req.body.orderCategory;
    const orderDetails = req.body.orderDetails;
    const price = req.body.price;
    const pic = req.files.file;
    const picData = pic.data;
    const encodedPic = picData.toString('base64');
    const imageBuffer = Buffer.from(encodedPic, 'base64');
    const order = {
        orderName,
        orderEmail,
        orderCategory,
        orderDetails,
        price,
        image: imageBuffer
    }
    const result = await ordersCollection.insertOne(order);
    res.json(result);

  });

  app.post('/addReview', async (req, res) =>{
    const reviews = req.body;
    const result = await reviewCollection.insertOne(reviews)
    res.json(result);
  })

  app.post('/addService', async (req, res) =>{
    const service = req.body;
    const icn = req.files.file;
    const icnData = icn.data;
    const encodedIcn = icnData.toString('base64');
    const iconBuffer = Buffer.from(encodedIcn, 'base64');
    const newService = {
        service,
        icon: iconBuffer
    }
    const result = await serviceCollection.insertOne(newService);
    res.json(result);
  })

  app.get('/allServices', async (req, res) =>{
    const cursor = serviceCollection.find({})
    const totalServices = await cursor.toArray();
    res.json(totalServices);
  })

  app.get('/clientFeedback', async (req, res) =>{
    const cursor = reviewCollection.find({})
    const review = await cursor.toArray();
    res.json(review);
  })

  app.get('/orders', async (req, res) =>{
    const cursor = ordersCollection.find({})
    const orders = await cursor.toArray();
    res.json(orders);
  })

  app.put('/orders', async (req, res) =>{
    const filter =  {_id: ObjectId(req.body.order._id)};
    const updateDoc = { $set: { status: req.body.value } }
    const result = await ordersCollection.updateOne(filter, updateDoc);
    res.json(result);
  })

  app.get('/myOrders', async (req, res) =>{
    const email = req.query.email;
    const cursor = ordersCollection.find({orderEmail: email})
    const myOrdr = await cursor.toArray();
    res.json(myOrdr)
  })

  app.post('/addAdmin', async (req, res) =>{
    const admin = req.body;
    const cursor = await adminsCollection.insertOne(admin);
    res.json(cursor)
  })

  // app.get('/admin', async (req, res) =>{
  //   const cursor = adminsCollection.find({})
  //   const admins = await cursor.toArray();
  //   res.json(admins)
  // })

  app.get('/admin', async (req, res) =>{
    adminsCollection.find({})
    .toArray((err, doc) =>{
      res.send(doc)
    });
  })

});

app.get('/', (req, res) => {
  res.send('Hello World!')
});

app.listen(process.env.PORT || port);