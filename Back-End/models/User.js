import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// ── Sub-schema: individual video progress ──────────────────────────
const videoProgressSchema = new mongoose.Schema(
  {
    video: { type: mongoose.Schema.Types.ObjectId, ref: "Video" },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
    watchDuration: { type: Number, default: 0 },
    lastWatchedAt: { type: Date },
  },
  { _id: false },
);

// ── Sub-schema: enrolled course entry ──────────────────────────────
const enrolledCourseSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    enrolledAt: { type: Date, default: Date.now },
    videoProgress: { type: [videoProgressSchema], default: [] },
    lastWatchedVideo: { type: mongoose.Schema.Types.ObjectId, ref: "Video" },
    lastWatchedAt: { type: Date },
    certificateId: { type: String },
    certificateUrl: { type: String },
    completedAt: { type: Date },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "الاسم مطلوب"],
      trim: true,
      minlength: [3, "الاسم يجب أن يكون 3 أحرف على الأقل"],
    },
    email: {
      type: String,
      required: [true, "البريد الإلكتروني مطلوب"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "البريد الإلكتروني غير صحيح",
      ],
    },
    phone: {
      type: String,
      required: [true, "رقم الهاتف مطلوب (للحماية)"],
      unique: true,
      trim: true,
      match: [/^01[0125][0-9]{8}$/, "رقم الهاتف يجب أن يكون 11 رقم مصري صحيح"],
    },
    password: {
      type: String,
      required: [true, "كلمة المرور مطلوبة"],
      minlength: [8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"],
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ["student", "admin", "instructor"],
      default: "student",
    },
    instructorProfile: {
      bio: {
        type: String,
        default: "",
      },
      specialization: {
        type: String,
        default: "",
      },
      yearsOfExperience: {
        type: String,
        default: "",
      },
      linkedin: {
        type: String,
        default: "",
      },
      website: {
        type: String,
        default: "",
      },
    },
    enrolledCourses: {
      type: [enrolledCourseSchema],
      default: [],
    },
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    isBlocked: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
      default: null,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      default: undefined,
    },
    emailVerificationExpire: {
      type: Date,
      default: undefined,
    },
    resetPasswordToken: {
      type: String,
      default: undefined,
    },
    resetPasswordExpire: {
      type: Date,
      default: undefined,
    },
    // Account Lockout fields
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: undefined,
    },
    // Tracks when password was last changed — used to invalidate old tokens
    passwordChangedAt: {
      type: Date,
      default: undefined,
      select: false,
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  },
);

// Hash password before saving and record change timestamp
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  // Record password change time so old tokens get rejected
  this.passwordChangedAt = new Date(Date.now() - 1000); // 1s grace period
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash email verification token
userSchema.methods.getEmailVerificationToken = function () {
  // Generate random token
  const verificationToken = crypto.randomBytes(32).toString("hex");

  // Hash the token and save to DB
  this.emailVerificationToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  // Set expiry to 24 hours
  this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000;

  return verificationToken;
};

// Generate and hash password reset token
userSchema.methods.getResetPasswordToken = function () {
  // Generate random token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash the token and save to DB
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set expiry to 15 minutes
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;
};

// Virtual property to check if account is locked
userSchema.virtual("isLocked").get(function () {
  // Check if lockUntil exists and is in the future
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Increment login attempts and lock account if needed
userSchema.methods.incLoginAttempts = async function () {
  // If lock has expired, reset attempts
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return await this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  // Otherwise increment attempts
  const updates = { $inc: { loginAttempts: 1 } };

  // Lock account after 5 failed attempts for 30 minutes
  const maxAttempts = 5;
  const lockTime = 30 * 60 * 1000; // 30 minutes

  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + lockTime };
  }

  return await this.updateOne(updates);
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = async function () {
  return await this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 },
  });
};

const User = mongoose.model("User", userSchema);

export default User;
