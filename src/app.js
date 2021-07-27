require('dotenv').config();
const express = require("express");
const path = require("path");
const fs = require('fs');
const app = new express();
const hbs = require("hbs");
var requests = require('requests');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 3000;
require("./db/conn");
const Register = require("./models/registers");

const static_path = path.join(__dirname,"../public");
const template_path = path.join(__dirname,"../templates/views");
const partials_path = path.join(__dirname,"../templates/partials");
const homeFilepath = path.join(__dirname,"../templates/views/main1.hbs");




app.use(express.static(static_path));
hbs.registerPartials(partials_path);
app.set("view engine", "hbs");
app.set("views",template_path);


app.use(express.json());
app.use(express.urlencoded({extended:false}));

const homefile = fs.readFileSync(homeFilepath,'utf-8');


let mail = "";
let n = 0;
let ib =0; let ih = 0; let ip = 0; let is = 0; 
let ub =0; let uh = 0; let up = 0; let usp = 0;
let news1 = 0; 
let state = "in";
let type = "business";


const replaceVal = (tempval,orgVal)=>{
    
    let num = 1;
    let vals = orgVal.articles.length;
    news1 = vals;

    if(state == "in"){
        if(type == "business"){
            n = ib;
        }
        if(type == "sport"){
            n = is;
        }
        if(type == "health"){
            n = ih;
        }
        if(type == "politics"){
            n = ip;
        }
    }
    if(state == "us"){
        if(type == "business"){
            n = ub;
        }
        if(type == "sport"){
            n = usp;
        }
        if(type == "health"){
            n = uh;
        }
        if(type == "politics"){
            n = up;
        }
    }
    let value;
    if(((num-1+n) <= vals - 1) && (num-1+n >= 0 ) ){
    value = tempval.replace(`{%title${num}%}`,orgVal.articles[num-1+n].title);
    value = value.replace("{%mail%}",mail);
    value = value.replace(`{%description${num}%}`,orgVal.articles[num-1+n].description);
    value = value.replace(`{%img${num}%}`,orgVal.articles[num-1+n].urlToImage);
    value = value.replace(`{%photo${num}%}`,orgVal.articles[num-1+n].urlToImage);
    value = value.replace(`{%dataurl${num}%}`,orgVal.articles[num-1+n].url);
    value = value.replace(`{%text${num}%}`,"PHOTOS");
    value = value.replace(`%PubAt${num}%`,"Published At-> " + orgVal.articles[num-1+n].publishedAt.slice(11,19));
    num++;
    }
    
    for(let i = 0;i < 8;i++){
        if(((num-1+n) <= vals - 1) && (num-1+n >= 0 ) ){
        value = value.replace(`{%title${num}%}`,orgVal.articles[num-1+n].title);
        value = value.replace(`{%description${num}%}`,orgVal.articles[num-1+n].description);
        value = value.replace(`{%img${num}%}`,orgVal.articles[num-1+n].urlToImage);
        value = value.replace(`{%photo${num}%}`,orgVal.articles[num-1+n].urlToImage);
        value = value.replace(`{%dataurl${num}%}`,orgVal.articles[num-1+n].url);
        value = value.replace(`{%text${num}%}`,"PHOTOS");
        value = value.replace(`%PubAt${num}%`,"Published At-> " + orgVal.articles[num-1+n].publishedAt.slice(11,19));
        
        num++;}
        else{
            value = value.replace(`{%title${num}%}`,"Advertisement");
            value = value.replace(`{%description${num}%}`,"Contact: 9529893578");
            value = value.replace(`{%img${num}%}`,"https://st.depositphotos.com/2625053/4832/v/950/depositphotos_48320523-stock-illustration-your-ad-here-stamp.jpg");
            value = value.replace(`{%photo${num}%}`,"https://st.depositphotos.com/2625053/4832/v/950/depositphotos_48320523-stock-illustration-your-ad-here-stamp.jpg");
            value = value.replace(`{%dataurl${num}%}`," ");
            value = value.replace(`{%text${num}%}`,"AD");
            value = value.replace(`%PubAt${num}%`," ");
            num++;
        }
    }
    
     
    
    return value;
    }



app.get("/",(req,res)=>{
    res.render("index");
})

app.get("/register",(req,res)=>{
    res.render("register");
})

app.get("/about",(req,res)=>{
    res.render("about");
})

app.post("/register",async (req,res)=>{
    try{

        const registerUser = new Register({
            fullname: req.body.fullname,
            contact_no:req.body.contact_no,
            email: req.body.email,
            confirm_email: req.body.confirm_email,
            password:req.body.passkey,
            confirm_password: req.body.confirm_passkey
            
        })

        const token = await registerUser.generateAuthToken();
        console.log(token);

        const registered = await registerUser.save();
        res.status(201).render("successfully_registerd");
        
    }catch(err){
        res.status(400).send(err);
        console.log("There is error");
    }
    
})

app.get("/login",(req,res)=>{
    res.render("login");
})




app.post("/login/main", async(req,res)=>{
    
    
    try{

        const email = req.body.username;
        const passsword = req.body.password;

        const user1 =  await Register.find({email: req.body.username});
        mail = user1[0].email;

        const isMatch = bcrypt.compare(passsword,user1[0].password);

        const token = await user1[0].generateAuthToken();
        console.log("The token is : " + token);

    if(isMatch){
        console.log("login successful!");
        requests(`https://newsapi.org/v2/top-headlines?country=${state}&category=${type}&apiKey=2009321247d646449fa8b447fef46a2f`)
        .on('data',(chunk)=>{
        const objData  = JSON.parse(chunk);
        const arrayData = [objData];
        const realTimeData = arrayData.map((val)=>replaceVal(homefile,val)).join(" ");
        res.send(realTimeData);
    })
        
    }
    else{
        res.send("Invalid Login Details");
    }
    }catch(err){
        res.status(400).send(err);
    }
    
})

app.get("/main",(req,res)=>{
    requests(`https://newsapi.org/v2/top-headlines?country=${state}&category=${type}&apiKey=2009321247d646449fa8b447fef46a2f`)
    .on('data',(chunk)=>{
    const objData  = JSON.parse(chunk);
    const arrayData = [objData];
    const realTimeData = arrayData.map((val)=>replaceVal(homefile,val)).join(" ");
    res.send(realTimeData);
    
})
})


app.get("/usa",(req,res)=>{
    state = "us";
    requests(`https://newsapi.org/v2/top-headlines?country=${state}&category=${type}&apiKey=2009321247d646449fa8b447fef46a2f`)
    .on('data',(chunk)=>{
    const objData  = JSON.parse(chunk);
    const arrayData = [objData];
    const realTimeData = arrayData.map((val)=>replaceVal(homefile,val)).join(" ");
    res.send(realTimeData);
    
})
})

app.get("/india",(req,res)=>{
    state = "in";
    requests(`https://newsapi.org/v2/top-headlines?country=${state}&category=${type}&apiKey=2009321247d646449fa8b447fef46a2f`)
    .on('data',(chunk)=>{
    const objData  = JSON.parse(chunk);
    const arrayData = [objData];
    const realTimeData = arrayData.map((val)=>replaceVal(homefile,val)).join(" ");
    res.send(realTimeData);
    
})
})

app.get("/politics",(req,res)=>{
    type = "politics";
    requests(`https://newsapi.org/v2/top-headlines?country=${state}&category=${type}&apiKey=2009321247d646449fa8b447fef46a2f`)
    .on('data',(chunk)=>{
    const objData  = JSON.parse(chunk);
    const arrayData = [objData];
    const realTimeData = arrayData.map((val)=>replaceVal(homefile,val)).join(" ");
    res.send(realTimeData);
    
})
})


app.get("/sport",(req,res)=>{
    type = "sport";
    requests(`https://newsapi.org/v2/top-headlines?country=${state}&category=${type}&apiKey=2009321247d646449fa8b447fef46a2f`)
    .on('data',(chunk)=>{
    const objData  = JSON.parse(chunk);
    const arrayData = [objData];
    const realTimeData = arrayData.map((val)=>replaceVal(homefile,val)).join(" ");
    res.send(realTimeData);
    
})
})

app.get("/health",(req,res)=>{
    type = "health";
    requests(`https://newsapi.org/v2/top-headlines?country=${state}&category=${type}&apiKey=2009321247d646449fa8b447fef46a2f`)
    .on('data',(chunk)=>{
    const objData  = JSON.parse(chunk);
    const arrayData = [objData];
    const realTimeData = arrayData.map((val)=>replaceVal(homefile,val)).join(" ");
    res.send(realTimeData);
    
})
})

app.get("/business",(req,res)=>{
    type = "politics";
    requests(`https://newsapi.org/v2/top-headlines?country=${state}&category=${type}&apiKey=2009321247d646449fa8b447fef46a2f`)
    .on('data',(chunk)=>{
    const objData  = JSON.parse(chunk);
    const arrayData = [objData];
    const realTimeData = arrayData.map((val)=>replaceVal(homefile,val)).join(" ");
    res.send(realTimeData);
    
})
})

app.get("/increase",(req,res)=>{
    if(state == "in"){
        if(type == "business"){
            if(ib + 9 < news1){
             ib = ib + 9;}
        }
        if(type == "sport"){
            if(is + 9 < news1){
                is = is + 9;}
        }
        if(type == "health"){
            if(ih + 9 < news1){
                ih = ih + 9;}
        }
        if(type == "politics"){
            if(ip + 9 < news1){
                ip = ip + 9;}
        }
    }
    if(state == "us"){
        if(type == "business"){
            if(ub + 9 < news1){
            ub = ub + 9;}
        }
        if(type == "sport"){
            if(usp + 9 < news1){
                usp = usp + 9;}
        }
        if(type == "health"){
            if(uh + 9 < news1){
                uh = uh + 9;}
        }
        if(type == "politics"){
            if(up + 9 < news1){
                up = up + 9;}
        }
    }
    requests(`https://newsapi.org/v2/top-headlines?country=${state}&category=${type}&apiKey=2009321247d646449fa8b447fef46a2f`)
    .on('data',(chunk)=>{
    const objData  = JSON.parse(chunk);
    const arrayData = [objData];
    const realTimeData = arrayData.map((val)=>replaceVal(homefile,val)).join(" ");
    res.send(realTimeData);
})

})

app.get("/decrease",(req,res)=>{
    if(state == "in"){
        if(type == "business"){
            if(ib - 9 >= 0){
                ib = ib - 9;
            }
             
        }
        if(type == "sport"){
            if(is - 9 >= 0){
                is = is - 9;
            }
        }
        if(type == "health"){
            if(ih - 9 >= 0){
                ih = ih - 9;
            }
        }
        if(type == "politics"){
            if(ip - 9 >= 0){
                ip = ip - 9;
            }
        }
    }
    if(state == "us"){
        if(type == "business"){
            if(ub - 9 >= 0){
                ub = ub - 9;
            }
        }
        if(type == "sport"){
            if(usp - 9 >= 0){
                usp = usp - 9;
            }
        }
        if(type == "health"){
            if(uh - 9 >= 0){
                uh = uh - 9;
            }
        }
        if(type == "politics"){
            if(up - 9 >= 0){
                up = up - 9;
            }
        }
    }
    requests(`https://newsapi.org/v2/top-headlines?country=${state}&category=${type}&apiKey=2009321247d646449fa8b447fef46a2f`)
    .on('data',(chunk)=>{
    const objData  = JSON.parse(chunk);
    const arrayData = [objData];
    const realTimeData = arrayData.map((val)=>replaceVal(homefile,val)).join(" ");
    res.send(realTimeData);
})

})

// app.get("/main/news/:category",(req,res)=>{

//         const _category = req.params.category;

//         requests(`https://newsapi.org/v2/top-headlines?country=${state}&category=${_category}&apiKey=2009321247d646449fa8b447fef46a2f`)
//         .on('data',(chunk)=>{
//         const objData  = JSON.parse(chunk);
//         const arrayData = [objData];
//         const realTimeData = arrayData.map((val)=>replaceVal(homefile,val)).join(" ");
//         res.send(realTimeData);
        
//     })
    
    
// })

app.get("/account",(req,res)=>{
    res.render("account");
})

app.listen(port,()=>{
    console.log(`Server is running at ${port}`);
})