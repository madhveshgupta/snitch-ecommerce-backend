import mongoose from "mongoose"

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "products",
                required: true
            },
            size: {
                type: String,
                enum: ["XS", "S", "M", "L", "XL", "XXL"],
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            priceAtPurchase: {
                type: Number,
                required: true
            }
        }
    ],
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    shippingAddress: {
        type: String,
        required: true,
        trim: true
    },
    paymentMethod: {
        type: String,
        enum: ["COD"],
        default: "COD"
    },
    status: {
        type: String,
        enum: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"],
        default: "Confirmed"
    }
}, { timestamps: true })

const orderModel = mongoose.model("orders", orderSchema)

export default orderModel
