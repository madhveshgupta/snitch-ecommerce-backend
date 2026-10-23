import app from "./app/app.js"
import { connectToDB } from "./config/db.js"
import config from "./config/config.js"

await connectToDB()

app.listen(config.PORT, () => {
    console.log(`Server is Running on port ${config.PORT}`)
})
