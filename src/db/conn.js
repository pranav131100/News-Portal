const mongoose = require("mongoose");
const mongoURL = process.env.MONGODB_URL || "mongodb://localhost:27017/registration"
mongoose.connect(mongoURL,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
    
}).then(()=>{
    console.log("Connection successful.");
}).catch((err)=>{
    console.log("No connection.");
});