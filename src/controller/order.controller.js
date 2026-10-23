import cartModel from "../models/cart.model.js"
import productModel from "../models/product.model.js"
import orderModel from "../models/order.model.js"

/**
 * @description Convert user's cart into a Cash on Delivery (COD) order
 * Performs server-side price recalculation, price snapshotting, and atomic stock deduction ($inc)
 */
export async function checkoutCOD(req, res) {
    const { shippingAddress } = req.body

    const cart = await cartModel
        .findOne({ user: req.user.userId })
        .populate("products.product")

    if (!cart || cart.products.length === 0) {
        return res.status(400).json({
            message: "Cart is empty"
        })
    }

    let totalAmount = 0
    const orderItems = []

    // Step 1: Validate live stock and recalculate total price on server
    for (const item of cart.products) {
        if (!item.product) {
            return res.status(404).json({
                message: "One or more products in cart no longer exist"
            })
        }

        const selectedSize = item.product.sizes.find(s => s.size === item.size)

        if (!selectedSize || selectedSize.stock < item.quantity) {
            return res.status(400).json({
                message: `Insufficient stock for ${item.product.title} (Size: ${item.size})`
            })
        }

        const unitPrice = item.product.price.amount
        totalAmount += unitPrice * item.quantity

        orderItems.push({
            product: item.product._id,
            size: item.size,
            quantity: item.quantity,
            priceAtPurchase: unitPrice
        })
    }

    // Step 2: Atomically deduct stock for each purchased item size
    for (const item of cart.products) {
        await productModel.updateOne(
            {
                _id: item.product._id,
                "sizes.size": item.size
            },
            {
                $inc: {
                    "sizes.$.stock": -item.quantity
                }
            }
        )
    }

    // Step 3: Create COD Order document
    const order = await orderModel.create({
        user: req.user.userId,
        items: orderItems,
        totalAmount,
        shippingAddress,
        paymentMethod: "COD",
        status: "Confirmed"
    })

    // Step 4: Empty the user's cart
    cart.products = []
    await cart.save()

    return res.status(201).json({
        message: "Order placed successfully via Cash on Delivery",
        data: {
            order
        }
    })
}

/**
 * @description Fetch order history for the logged-in customer
 */
export async function getMyOrders(req, res) {
    const orders = await orderModel
        .find({ user: req.user.userId })
        .populate("items.product")
        .sort({ createdAt: -1 })

    return res.status(200).json({
        message: "Orders fetched successfully",
        data: {
            orders
        }
    })
}

/**
 * @description Fetch all customer orders for the seller
 */
export async function getAllOrdersForSeller(req, res) {
    const orders = await orderModel
        .find({})
        .populate("items.product")
        .populate("user", "name email")
        .sort({ createdAt: -1 })

    return res.status(200).json({
        message: "All orders fetched successfully",
        data: {
            orders
        }
    })
}
