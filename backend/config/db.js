import mongoose from "mongoose";

export const connectDB = async () =>{
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log("DB Connected")
    } catch(e){
        console.log("DB Error ", err)
    }
}