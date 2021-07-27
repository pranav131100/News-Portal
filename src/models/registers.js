const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const employeeSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,
    },
    contact_no:{
        type:Number,
        required: true,
        unique:true,
    },
    email:{
        type:String,
        unique:true,
        required:true,
    },
    password:{
        type:String,
        required:true
    },
    confirm_email:{
        type:String,
        unique:true,
        required:true,
    },
    confirm_password:{
        type:String,
        required:true,
        
    },
    tokens:[{
        token:{
            type:String,
            required:true,
        }
    }]
})

//generating tokens
employeeSchema.methods.generateAuthToken = async function(){
try{
    const token = jwt.sign({_id:this._id},process.env.SECRET_KEY);
    this.tokens = this.tokens.concat({token:token});
    await this.save();
    return token;
}catch(err){
    res.send(err); 
}
}

//converting password into hash
employeeSchema.pre("save",async function(next){

    if(this.isModified("password")){
        this.password= await bcrypt.hash(this.password,10);
        this.confirm_password  = await bcrypt.hash(this.confirm_password,10);
    }
    next();
})

const Register = new mongoose.model("Registeration",employeeSchema);

module.exports = Register;