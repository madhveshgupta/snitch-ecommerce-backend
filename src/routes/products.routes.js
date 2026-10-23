import { Router } from "express"
import {
    createProductValidator,
    unlistProductValidator,
    listProductValidator
} from "../validators/product.validator.js"
import { authenticate, authenticateSeller } from "../middlewares/auth.middleware.js"
import {
    createProduct,
    listAllProducts,
    unlistProduct,
    listProduct,
    listAllProductsToSeller
} from "../controller/product.controller.js"
import multer from "multer"

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        files: 5,
        fileSize: 5 * 1024 * 1024 // 5MB
    }
})

const router = Router()

/**
 * @method POST
 * @route /api/products/
 * @description Creates a product and uploads images to ImageKit CDN
 * @access seller
 */
router.post(
    "/",
    authenticate,
    authenticateSeller,
    upload.array("images"),
    (req, res, next) => {
        if (typeof req.body?.price === "string") {
            req.body.price = JSON.parse(req.body.price)
        }
        if (typeof req.body?.sizes === "string") {
            req.body.sizes = JSON.parse(req.body.sizes)
        }
        next()
    },
    createProductValidator,
    createProduct
)

/**
 * @method GET
 * @route /api/products/
 * @description Read all published products from the DB
 * @access authenticated user
 */
router.get("/", authenticate, listAllProducts)

/**
 * @method GET
 * @route /api/products/seller
 * @description Read all products (published & unpublished) from the DB
 * @access seller
 */
router.get("/seller", authenticate, authenticateSeller, listAllProductsToSeller)

/**
 * @method PATCH
 * @route /api/products/unlist/:id
 * @description Unpublish a product by its ID
 * @access seller
 */
router.patch("/unlist/:id", authenticate, authenticateSeller, unlistProductValidator, unlistProduct)

/**
 * @method PATCH
 * @route /api/products/list/:id
 * @description Publish a product by its ID
 * @access seller
 */
router.patch("/list/:id", authenticate, authenticateSeller, listProductValidator, listProduct)

export default router
