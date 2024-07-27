import express from 'express';
import cors from 'cors';
import userRouter from "./routes/users.route.js"
import videoRouter from "./routes/video.route.js"
import cookieParser from"cookie-parser"
const app = express()

app.use(cors({
    origin : "*",
    credentials:true
}
))
app.use(cookieParser())
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended:true, limit:"16kb" }))
app.use(express.static("public"));



app.use("/api/v1/users",userRouter)
app.use("/api/v1/video",videoRouter)


export default app