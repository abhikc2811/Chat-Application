import jwt from "jsonwebtoken"

export const generateToken =(userID,res)=>{
     const token=jwt.sign({userID},process.env.JWT_SECRET,{
        expiresIn:"7d"
     })
     res.cookie("jwt",token,{
        maxAge: 7 *24*60*60*1000, //MS
        httpOnly:true,
        sameSite:"None", 
        secure:true
     })
     return token;
}

export const generateOTP = () => {
   return Math.floor(100000 + Math.random() * 900000).toString();
 };
