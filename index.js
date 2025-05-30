require('dotenv').config()
const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 3000

// middleware
app.use(cors());
app.use(express.json());






const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@clusterph.bwaiqag.mongodb.net/?retryWrites=true&w=majority&appName=ClusterPH`;

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
     const jobCollection =client.db('careerCode').collection('jobs')
     const applicationCollection = client.db('careerCode').collection('applications')
    // create job api

    app.get('/jobs', async(req, res) => {
      const email = req.query.email;
      const query ={}
      if(email){
        query.hr_email = email
      }
       
        const result = await jobCollection.find(query).toArray()
        res.send(result)
    })
// could be done but should not be done
    // app.get('/jobsByEmailAddress', async(req, res)=>{
    //   const email = req.query.email;
    //   const query = {
    //     hr_email : email
    //   }
    //   const result = await jobCollection.findOne(query)
    //   res.send(result)

    // })
    app.get('/jobs/:id', async(req, res)=>{
        const id = req.params.id;
        const query ={
            _id : new ObjectId(id)
        }
        const result = await jobCollection.findOne(query)
        res.send(result)
    })

   
    

    app.post('/jobs', async(req, res)=>{
      const newJob =req.body;
      const result = await jobCollection.insertOne(newJob);
      res.send(result)

    })
    // application api
    app.get('/applications', async(req, res)=>{
        const email = req.query.email;
        const query = {
            applicant : email
        }
       const result =await applicationCollection.find(query).toArray();
       for(const application of result){
        const jobId = application.jobId;
        const jobQuery = {_id : new ObjectId(jobId)}
        const job =await jobCollection.findOne(jobQuery)
        application.company = job.company
        application.company_logo = job.company_logo
        application.title=job.title;
        application.salaryRange = job.salaryRange;
        application.location = job.location
        application.jobType =job.jobType
        
       }
        res.send(result)
    })



    app.post('/applications', async(req, res) =>{
        const application = req.body;
        const result = await applicationCollection.insertOne(application);
        res.send(result);
    })
    app.get('/applications/:id', async(req, res) =>{
      const applicantId = req.params.id;
      const query = {
        _id :new ObjectId(applicantId)
      }
      const result = await applicationCollection.findOne(query)
      res.send(result)

    })

    app.delete('/applications/:id', async(req, res) =>{
      const applicantId = req.params.id;
      const query = {
        _id :new ObjectId(applicantId)
      }
      const result = await applicationCollection.deleteOne(query)
      res.send(result)

    })
   
   
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    
  }
}
run().catch(console.dir);


app.get('/',(req, res)=>{
    res.send('Career Code Cooking')
})

app.listen(port, () =>{
    console.log(`New code is running on port ${port}`)
})