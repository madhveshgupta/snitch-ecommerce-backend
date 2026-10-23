import { Router } from "express"
import { registerValidator, loginValidator } from "../validators/auth.validator.js"
import { register, login, refresh, logout, getMe } from "../controller/auth.controller.js"
import { authenticate } from "../middlewares/auth.middleware.js"

const router = Router()

/**
 * @POST /api/auth/register
 */
router.post("/register", registerValidator, register)

/**
 * @POST /api/auth/login
 */
router.post("/login", loginValidator, login)

/**
 * @POST /api/auth/refresh
 */
router.post("/refresh", refresh)

/**
 * @POST /api/auth/logout
 */
router.post("/logout", authenticate, logout)

/**
 * @GET /api/auth/me
 */
router.get("/me", authenticate, getMe)

export default router
