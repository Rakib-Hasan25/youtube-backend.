import { DB_NAME } from "../constant.js"
import mongoose from "mongoose"

const connectDB = async()=>{
    try{
        const connectionInstance =await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        // console.log(connectionInstance)
        console.log(`\nMongoDB connected !! DB HOST: ${connectionInstance.connection.host}`)
    }
    catch(e){
        console.log("mongodb connection error :",e)
        process.exit(1)
    }

}

export default connectDB;