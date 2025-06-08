import jwt from "jsonwebtoken"

export const generateToken =(userID,res)=>{
     const token=jwt.sign({userID},process.env.JWT_SECRET,{
        expiresIn:"7d"
     })
     res.cookie("jwt",token,{
        maxAge: 7 *24*60*60*1000, //MS
        httpOnly:true,//prevent XSS attacks cross-site Scripting attacks
        sameSite:"strict", //CSRF attacks cross-site request forgery attacts
        secure:process.env.NODE_ENV !=='development'
     })
     return token;
}

export const generateOTP = () => {
   return Math.floor(100000 + Math.random() * 900000).toString();
 };