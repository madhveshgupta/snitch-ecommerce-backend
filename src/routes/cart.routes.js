import { Router } from "express"
import { addToCartValidator } from "../validators/cart.validator.js"
import { authenticate } from "../middlewares/auth.middleware.js"
import { addToCart, getCart } from "../controller/cart.controller.js"

const router = Router()

/**
 * @method POST
 * @route /api/cart
 * @access protected
 * @description Add a product to the user's cart
 */
router.post("/", authenticate, addToCartValidator, addToCart)

/**
 * @method GET
 * @route /api/cart
 * @access protected
 * @description Get the user's populated cart
 */
router.get("/", authenticate, getCart)

export default router
