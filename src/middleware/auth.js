const jwt = require('jsonwebtoken');
const Register =  require("../models/registers");

const auth = async(req,res,next)=>{
    try{
        const token = req.cookies.jwt;
        const verifyUser = await jwt.verify(token,process.env.SECRET_KEY);
     
        console.log(verifyUser);
        
        const user =  await Register.find({_id: verifyUser._id});
        console.log(user[0]);
       

        req.token = token;
        req.user = user[0];
        next();
    }
    catch(err){
        res.status(401).send(err);
    }
}

module.exports = auth;