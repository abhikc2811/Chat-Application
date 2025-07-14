import { generateOTP, generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import { sendEmail } from "../lib/email.js";
import OTP from "../models/otp.model.js";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  console.log(req.body);
  
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });

    if (user) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      // generate jwt token here
      generateToken(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    await OTP.deleteMany({ email });

    await OTP.create({ email, otp, expiresAt });

    await sendEmail(email, otp);
    res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    console.log("Error in requestPasswordReset:", error.message);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

export const verifyResetOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const record = await OTP.findOne({ email, otp });

    if (!record || record.expiresAt < new Date() || record.verified) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    record.verified = true;
    await record.save();

    res.status(200).json({ message: "OTP Verified" });
  } catch (error) {
    console.log("Error in VerifyResetOtp:", error.message);
    res.status(200).json({ message: "Failed to verify OTP"});
  }
};

export const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password too short" });
    }

    const otpRecord = await OTP.findOne({ email, verified: true });

    if (!otpRecord || otpRecord.expiresAt < new Date()) {
      return res.status(403).json({ message: "OTP not verified or expired" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    await OTP.deleteMany({ email });
    
    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error in resetPassword:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      expires: new Date(0),
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user?._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }
    console.log("Uploading to cloudinary:",profilePic.slice(0,100));
    console.log("User ID from auth middleware:", userId);
    // console.log("cloudinary upload response:",uploadResponse)

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );
    console.log("Updated user from DB:", updatedUser);

    res.status(200).json(updatedUser);
  } catch (error) {
    
    console.log("error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    console.log("entered in auth check")
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
