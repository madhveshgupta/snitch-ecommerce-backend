import { Router } from "express"
import { authenticate, authenticateSeller } from "../middlewares/auth.middleware.js"
import { checkoutValidator } from "../validators/order.validator.js"
import {
    checkoutCOD,
    getMyOrders,
    getAllOrdersForSeller
} from "../controller/order.controller.js"

const router = Router()

/**
 * @method POST
 * @route /api/orders/checkout
 * @access protected (Customer)
 * @description Convert cart to Cash on Delivery (COD) order with server-side price recalculation & atomic stock deduction
 */
router.post("/checkout", authenticate, checkoutValidator, checkoutCOD)

/**
 * @method GET
 * @route /api/orders/my-orders
 * @access protected (Customer)
 * @description Get order history for the logged-in customer
 */
router.get("/my-orders", authenticate, getMyOrders)

/**
 * @method GET
 * @route /api/orders/seller
 * @access protected (Seller)
 * @description Get all orders across the platform
 */
router.get("/seller", authenticate, authenticateSeller, getAllOrdersForSeller)

export default router
