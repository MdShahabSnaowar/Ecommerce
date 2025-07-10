const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { addCoins } = require("../controllers/supercoins.controllers");
const Otp = require("../models/Otp"); // import the model
const sendEmail = require("../utils/sendEmail");



router.post("/signup", async (req, res) => {
  try {
    const { name, mobile, password, email, referredByCode } = req.body;

    if (!mobile || !password || !name || !email) {
      return res.status(400).json({ message: "All fields are required" });
    }

    let existingUser = await User.findOne({ mobile });

    if (existingUser) {
      if (existingUser.isOtpVerified) {
        return res.status(409).json({ message: "Mobile already registered and verified" });
      } else {
        await Otp.deleteMany({ email });

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        await new Otp({
          email,
          otp: otpCode,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        }).save();

        await sendEmail(email, "Your OTP Code", `Your OTP is: ${otpCode}`);

        return res.status(200).json({
          message: "User already exists but not verified. OTP re-sent to email.",
        });
      }
    }

    // 📌 Find referrer if referral code is given
    let referrer = null;
    if (referredByCode) {
      referrer = await User.findOne({ referralCode: referredByCode });
      if (!referrer) {
        return res.status(400).json({ message: "Invalid referral code." });
      }
    }

    // 🆕 Create new user with referral link if any
    const user = new User({
      name,
      mobile,
      email,
      password,
      isOtpVerified: false,
      referredBy: referrer ? referrer._id : null,
    });

    await user.save();

    // 🎁 10 Welcome Coins for new user
    await addCoins(user._id, 10, "registration", "Welcome bonus");

    // 💸 10 Referral Coins for referrer
    if (referrer) {
      await addCoins(
        referrer._id,
        10,
        "referral",
        `Referral bonus for inviting ${user.email}`
      );
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    await new Otp({
      email,
      otp: otpCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    }).save();

    await sendEmail(email, "Your OTP Code", `Your OTP is: ${otpCode}`);

    res.status(201).json({
      message: "User registered successfully, and OTP sent to your email",
    });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ message: "Server error during signup", error: err.message });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    // console.log("Received OTP verification request:", req.body);

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const existingOtp = await Otp.findOne({ email, otp });

    if (!existingOtp) {
      return res.status(400).json({ message: "Invalid OTP or email" });
    }

    if (existingOtp.expiresAt < new Date()) {
      return res.status(410).json({ message: "OTP has expired" });
    }

    // ✅ Mark user as verified
    await User.updateOne({ email }, { isOtpVerified: true });

    // 🧹 Delete OTP after verification
    await Otp.deleteMany({ email });

    // ✅ Fetch user to generate token
    const updatedUser = await User.findOne({ email });
    if (!updatedUser) {
      return res
        .status(404)
        .json({ message: "User not found after OTP verification" });
    }
    // console.log("Updated User:", updatedUser);
    // ✅ Generate Access & Refresh Tokens
    const accessToken = jwt.sign(
      { user: { id: updatedUser._id, role: updatedUser.role } },
      process.env.JWT_SECRET,
      { expiresIn: "15m" } // ⏰ short-lived access token
    );

    const refreshToken = jwt.sign(
      { user: { id: updatedUser._id } },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" } // ⏳ longer-lived refresh token
    );

    return res.status(200).json({
      message: "OTP verified successfully",
      data: {
        email: updatedUser.email,
        isOtpVerified: updatedUser.isOtpVerified,
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    console.error("OTP Verification Error:", err);
    return res
      .status(500)
      .json({ message: "Server error during OTP verification" });
  }
});
// User Login
router.post("/login", async (req, res) => {
  try {
    const { mobile, password } = req.body;

    // 🔒 Basic validation
    if (!mobile || !password) {
      return res.status(400).json({
        message: "Mobile and password are required",
      });
    }

    // 🔍 Find user by mobile
    const user = await User.findOne({ mobile });

    // ❌ Invalid mobile or password
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        message: "Invalid mobile or password",
      });
    }

    // ✅ Prepare JWT payload
    const payload = {
      user: {
        id: user._id,
        role: user.role,
      },
    };

    // 🔐 Generate tokens
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: "7d",
    });

    // ✅ Success
    return res.status(200).json({
      message: "Login successful",
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          mobile: user.mobile,
          role: user.role,
        },
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({
      message: "Server error during login",
      error: err.message,
    });
  }
});

router.post("/refresh-token", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    // 🧾 Verify refresh token
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) {
        return res
          .status(403)
          .json({ message: "Invalid or expired refresh token" });
      }

      const userPayload = { id: decoded.user.id, role: decoded.user.role };

      // 🔐 Generate new access & refresh tokens
      const newAccessToken = jwt.sign(
        { user: userPayload },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );

      const newRefreshToken = jwt.sign(
        { user: userPayload },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
      );

      return res.status(200).json({
        message: "Tokens refreshed successfully",
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        // oldRefreshToken: refreshToken
      });
    });
  } catch (err) {
    console.error("Refresh Token Error:", err);
    res.status(500).json({ message: "Server error during token refresh" });
  }
});

module.exports = router;
