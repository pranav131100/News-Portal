const mongoose = require("mongoose");
const mongoURL = process.env.MONGODB_URL || "mongodb://localhost:27017/registration"
mongoose.connect("mongodb+srv://pranav00:%401311@gmail.com@cluster0.g8ppu.mongodb.net/terminal",{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
    
}).then(()=>{
    console.log("Connection successful.");
}).catch((err)=>{
    console.log("No connection.");
});