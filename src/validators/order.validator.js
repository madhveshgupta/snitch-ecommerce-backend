import { body, validationResult } from "express-validator"

export const checkoutValidator = [
    body("shippingAddress")
        .exists().withMessage("Shipping address is required").bail()
        .isString().withMessage("Shipping address must be a string").bail()
        .trim()
        .isLength({ min: 5, max: 300 }).withMessage("Shipping address must be between 5 and 300 characters"),
    (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Validation failed",
                errors: errors.array()
            })
        }
        next()
    }
]
