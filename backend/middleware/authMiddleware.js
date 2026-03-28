import jwt from "jsonwebtoken"

export const protect = (req, res, next) => {
    try{
        const header = req.headers.authorization;
        if (!header){
            return res.status(401).json({
                success : false,
                message : "No token provided"
            })
        }
         const token = header.split(" ")[1];

         const decoded = jwt.verify(token, process.env.JWT_SECRET);

         req.userId = decoded.id;

         next();
    }

    catch(err){
        res.status(401).json({
            success : false,
            message : "Invalide or expired token"
        })
    }
}