
const express = require('express');
const app = express();
const cors = require('cors');
var MongoClient = require('mongodb').MongoClient;
require('dotenv').config()
const fileUpload = require('express-fileupload');
const res = require('express/lib/response');
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());
app.use(fileUpload());

var uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-shard-00-00.00ohf.mongodb.net:27017,cluster0-shard-00-01.00ohf.mongodb.net:27017,cluster0-shard-00-02.00ohf.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-ko9svf-shard-0&authSource=admin&retryWrites=true&w=majority`;

const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();
        const database = client.db('TechmeServices');
        const productCollection = database.collection('Products');
        const usersCollection = database.collection('Users');

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);

            res.json(result);
        });

        app.put('/users', async (req, res) => {
            const user = req.body;

            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        })

        app.get('/products', async (req, res) => {
            const cursor = productCollection.find({});
            const products = await cursor.toArray();
            res.json(products);
        })
        app.post('/products', async (req, res) => {
            const name = req.body.name;
            const price = req.body.price;
            const pic = req.files.image;
            const picData = pic.data;
            const encodedPic = picData.toString('base64');
            const imageBuffer = Buffer.from(encodedPic, 'base64');
            const products = {
                name,
                price,
                image: imageBuffer
            }
            const result = await productCollection.insertOne(products);

            res.json(result);
        });
    }
    finally {

    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('This is a Techme Services');
});

app.listen(port, () => {
    console.log('Listening On Port', port);
})