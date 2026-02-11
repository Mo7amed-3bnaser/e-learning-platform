import mongoose from "mongoose";
import bcrypt from "bcryptjs";

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
      minlength: [6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"],
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
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  },
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  // Only hash if password is modified
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
