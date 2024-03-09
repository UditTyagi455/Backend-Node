// require('dotenv').config({path: "./env"})

import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: "./env"
});

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000 ,() => {
        console.log(`App is listing at port : ${process.env.PORT}`);
    })
    app.on("error",(err) => {
        console.log(`Error in connecting the App :: ${err}`);
    })
})
.catch((err) => console.log(`Error in connect to database !!!`,err))











// import express from "express";
// const app = express();
// ;(async () =>{
//     try {
//        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//        app.on("error",(error) => {
//         console.log("Error ::",error);
//         throw error;
//        })

//        app.listen(process.env.PORT, () => {
//         console.log(`App is listening at ${process.evn.PORT}`);
//        });

//     } catch (error) {
//         console.log("error ::",error);
//     }
// })()