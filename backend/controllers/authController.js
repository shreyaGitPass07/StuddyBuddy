import Student from "../models/Student.js";
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken"



export const registerUser = async (req , res) =>{
    try{
        const {name, email, password} = req.body;

        // validation 
        if (!name || !email || !password){
            return res.status(400).json({
                success : false,
                message : "All fields requried"
            });
        }

        //checking exissting user

        const exists = await Student.findOne({email});
        if (exists){
            res.status(400).json({
                success : false,
                message : "User Already Exists"
            })
        }
        // hash password

        const hashedPassword = await bcrypt.hash(password, 10);

        const student = await Student.create({
            name,
            email,
            password : hashedPassword
        })

        res.status(201).json({
            success : true,
            message : "User registered"
        })
    } catch(e){
        res.status(500).json({
            success : false,
            message : "Server Error"
        })
    }
}

export const loginUser = async (req,res) => {


    try{
        const {email, password} = req.body;

        // Validation
        if (!email || !password){
            return res.status(400).json({
                succes : false,
                message : "All fields required"
            })
        }

        const student = await Student.findOne({email});

        if (!student){
            return res.status(400).json({
                success : false,
                message : "User not found"
            })
        }

        const isMatch = await bcrypt.compare(password, student.password)

        if (!isMatch){
            return res.status(400).json({
                success : false ,
                message : "Invalid credentials"
            })
        }

        //JWT

        const token = jwt.sign(
            {id : student._id},
            process.env.JWT_SECRET,
            {expiresIn : "1d"}
        )


        res.json({
            success : true,
            message : "Login Successfull",
            token
        })
    } catch(e){
        res.status(500).json({
            success : false,
            message : "Server Error"
        })
    }

}


export const getMe = async (req, res) =>{
    try{
        const student = await Student.findById(req.userID).select("-password");

        res.json({
            success : true,
            user
        })
    }catch(e) {
        res.status(500).json({
            success : false,
            message : "Error Fetching issue"
        })
    }
}