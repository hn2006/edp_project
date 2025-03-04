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
  speed:{
    type:String,
    default:'0'
  },
  pwm:String,
  location:String
});

const EDPModel = mongoose.model('edp_data', sampleSchema);

app.get('/', async (req, res) => {
  try {
    const samples = await EDPModel.find();
    res.json(samples);
  } catch (error) {
    console.error('Error querying samples:', error);
    res.json({ error: 'Internal server error' });
  }
});

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

app.get('/dashboard_details',async(req,res)=>{

  try {
      const data =await EDPModel.find();
      const new_data=[];
      var max_speed=-1,min_speed=100,total=0;
      data.forEach((data)=>{
        if(Number(data.speed)>max_speed){
          max_speed=Number(data.speed);
        }
        if(Number(data.speed)<min_speed){
          min_speed=Number(data.speed);
        }
        total=total+Number(data.speed);
      })

      const n=data.length;
      for(var i=n-30;i<n;i++){

        if(i>=0){
          new_data.push(data[i]);
        }
        
      }
      console.log(new_data);
      res.status(201).json({max_speed:max_speed.toPrecision(2),min_speed:min_speed.toPrecision(2),avg_speed:(total/n).toPrecision(2),data:new_data});
    } catch (error) {
      console.error('Error creating sample:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(8000, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
