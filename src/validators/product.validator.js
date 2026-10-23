import { body, param, validationResult } from "express-validator"

export const createProductValidator = [
    body("title")
        .exists().withMessage("Title is required").bail()
        .isString().withMessage("Title must be a string").bail()
        .trim()
        .isLength({ min: 2, max: 100 }).withMessage("Title length must be between 2 to 100 characters"),
    body("description")
        .exists().withMessage("Description is required").bail()
        .isString().withMessage("Description must be String").bail()
        .trim()
        .isLength({ min: 20, max: 500 }).withMessage("Description length must be between 20 to 500 characters"),
    body("price.amount")
        .exists().withMessage("Price amount is required").bail()
        .isFloat({ min: 1 }).withMessage("Price amount must be a number greater than 0"),
    body("price.currency")
        .exists().withMessage("Currency is required").bail()
        .isString().withMessage("Currency must be a string value")
        .isIn(["INR", "USD"]).withMessage("Currency must be either INR or USD"),
    body("sizes")
        .exists().withMessage("Sizes are required").bail()
        .isArray({ min: 1 }).withMessage("Sizes must be a non-empty array of objects"),
    body("sizes.*.size")
        .exists().withMessage("Size must be present in every entry of sizes array").bail()
        .isString().withMessage("Size must be a string value").bail()
        .trim()
        .isIn(["XS", "S", "M", "L", "XL", "XXL"]).withMessage("Size must be one of XS, S, M, L, XL, XXL"),
    body("sizes.*.stock")
        .exists().withMessage("Stock must be present in every entry of the sizes array").bail()
        .isInt({ min: 0 }).withMessage("Stock must be a non-negative integer value"),
    (req, res, next) => {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Invalid Request",
                errors: errors.array()
            })
        }

        next()
    }
]

export const unlistProductValidator = [
    param("id")
        .exists().withMessage("Product id is required in req params").bail()
        .isMongoId().withMessage("Product id must be a valid Mongo ObjectId"),
    (req, res, next) => {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Invalid Data",
                errors: errors.array()
            })
        }

        next()
    }
]

export const listProductValidator = [
    param("id")
        .exists().withMessage("Product id is required in req params").bail()
        .isMongoId().withMessage("Product id must be a valid Mongo ObjectId"),
    (req, res, next) => {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Invalid Data",
                errors: errors.array()
            })
        }

        next()
    }
]
