const mongoose = require("mongoose");
const mongoURL = "mongodb+srv://abc:abcPranav123@cluster0.to716.mongodb.net/myFirstDatabase?retryWrites=true&w=majority" || "mongodb://localhost:27017/registration"
mongoose.connect("mongodb://localhost:27017/registration",{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
    
}).then(()=>{
    console.log("Connection successful.");
}).catch((err)=>{
    console.log("No connection.");
});

