import userModel from "../models/user.model.js"
import bcrypt from "bcryptjs"
import {
    createAccessToken,
    createRefreshToken,
    readRefreshToken
} from "../utils/auth.utils.js"

/**
 * @description Register a user and save the data from req.body
 */
export async function register(req, res) {
    const { email, name, password, role } = req.body

    const isUserAlreadyExists = await userModel.findOne({ email })

    if (isUserAlreadyExists) {
        return res.status(400).json({
            message: "User already exists with this email address",
            errors: [
                {
                    path: "email",
                    msg: "User already exists with this email address"
                }
            ]
        })
    }

    const user = await userModel.create({
        email,
        name,
        passwordHash: await bcrypt.hash(password, 12),
        role: role === "seller" ? "seller" : "user"
    })

    const accessToken = createAccessToken({
        userId: user._id,
        role: user.role
    })
    const refreshToken = createRefreshToken({
        userId: user._id,
        role: user.role
    })

    await userModel.findByIdAndUpdate(user._id, {
        refreshToken
    })

    res.cookie("accessToken", accessToken, {
        httpOnly: true
    })
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true
    })

    return res.status(201).json({
        message: "User Registered Successfully",
        data: {
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            },
            accessToken
        }
    })
}

/**
 * @description Login a user and create new set of accessToken and refreshToken
 */
export async function login(req, res) {
    const { email, password } = req.body

    const user = await userModel.findOne({ email })

    if (!user) {
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

    if (!isPasswordValid) {
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    const accessToken = createAccessToken({
        userId: user._id,
        role: user.role
    })
    const refreshToken = createRefreshToken({
        userId: user._id,
        role: user.role
    })

    await userModel.findOneAndUpdate(
        { email },
        { refreshToken }
    )

    res.cookie("accessToken", accessToken, {
        httpOnly: true
    })
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true
    })

    return res.status(200).json({
        message: "User logged in successfully",
        data: {
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            },
            accessToken
        }
    })
}

/**
 * @description Rotate refresh token and issue a new access token
 */
export async function refresh(req, res) {
    const refreshToken = req.cookies.refreshToken

    if (!refreshToken) {
        return res.status(401).json({
            message: "Refresh token is required."
        })
    }

    try {
        const decoded = readRefreshToken(refreshToken)
        const { userId, role } = decoded

        const user = await userModel.findById(userId)

        if (!user || refreshToken !== user.refreshToken) {
            if (user) {
                await userModel.findByIdAndUpdate(user._id, {
                    refreshToken: null
                })
            }
            return res.status(401).json({
                message: "Refresh token mismatch"
            })
        }

        const accessToken = createAccessToken({
            userId,
            role
        })
        const newRefreshToken = createRefreshToken({
            userId,
            role
        })

        await userModel.findByIdAndUpdate(user._id, {
            refreshToken: newRefreshToken
        })

        res.cookie("accessToken", accessToken, {
            httpOnly: true
        })
        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true
        })

        return res.status(200).json({
            message: "Tokens rotated successfully.",
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                },
                accessToken
            }
        })
    } catch (err) {
        return res.status(401).json({
            message: "Invalid refresh token"
        })
    }
}

/**
 * @description Logout user and clear auth cookies
 */
export async function logout(req, res) {
    await userModel.findByIdAndUpdate(req.user.userId, {
        refreshToken: null
    })

    res.clearCookie("accessToken")
    res.clearCookie("refreshToken")

    return res.status(200).json({
        message: "User logged out successfully"
    })
}

/**
 * @description Get current authenticated user profile
 */
export async function getMe(req, res) {
    const { userId } = req.user

    const user = await userModel.findById(userId)

    return res.status(200).json({
        message: "User data fetched successfully",
        data: {
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        }
    })
}
