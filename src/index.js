import dotenv from "dotenv";
import connectDB from "./db/index.js";
import  app  from "./app.js";
dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`listening on port ${process.env.PORT}`);
    });
  })
  .catch(
    (error)=>{
        console.log("mongoDB connection failed !!!", error)
    }
    // console.error("Error:", e)
  );







//!2nd way
// import dotenv from "dotenv";
// import express from 'express';
// import mongoose from "mongoose";
// dotenv.config({
//     path: './.env'
// })
// const app = express()

// // IIFE (Immediately Invoked Function Expressions )

// ;(
//     async()=>{
//         try{
//             await mongoose.connect(`${process.env.MONGODB_URI}/youtube`)
//             console.log("successfully connected to database ")
//             app.on("error", (error)=>{
//                 console.log("ERRR : " ,error);
//                 throw error;

//             })
//             app.listen(process.env.PORT,()=>{
//                 console.log(`listening on port ${process.env.PORT}`)
//             })
//         }
//         catch(e){
//             console.error("Error:", e)
//             throw e

//         }

//     }
// )
// ();
