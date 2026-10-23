import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: "user",
        enum: ["user", "seller"]
    },
    refreshToken: {
        type: String
    }
}, { timestamps: true })

const userModel = mongoose.model("users", userSchema)

export default userModel
