const express = require('express');
const mongoose = require('mongoose');
const cors=require('cors');
const dotenv=require('dotenv').config();
const bodyparser=require('body-parser');

const app = express();

app.use(express.json());
app.use(cors());
app.use(bodyparser.urlencoded({ extended: false }));
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URL)
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});

const Schema = mongoose.Schema;
const sampleSchema = new Schema({
  latitude: String,
  longitude: String,
  time:String,
  weather_condition:String,
  nearby_places: String,
  visibility:String,
});

const EDPModel = mongoose.model('edp_data', sampleSchema);

app.get('/details', async (req, res) => {
  try {
    const samples = await EDPModel.find();
    res.json(samples);
  } catch (error) {
    console.error('Error querying samples:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/addData',async(req,res)=>{

    const data=req.body;
    console.log(data);

    try {
        const newSample = new EDPModel(data);
        await newSample.save();
        res.status(201).json(newSample);
      } catch (error) {
        console.error('Error creating sample:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
