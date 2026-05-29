import express from "express"
import pool from "../db.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const router = express.Router()

router.post("/signup", async (req, res) => {
    try {
        const { email, password, shopName } = req.body

        const hashedPassword = await bcrypt.hash(password, 10)

        const userRes = await pool.query(
            "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING * ",
            [email, hashedPassword]
        )

        const user = userRes.rows[0]

        const shopRes = await pool.query(
            "INSERT INTO shops (name, user_id) VALUES ($1, $2) RETURNING * ",
            [shopName, user.id]
        )

        res.json({
            user,
            shop: shopRes.rows[0]
        })
    }catch (error) {
        console.log(error)

        res.status(500).json({
            error: "Signup failed"
        })
    }
})

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body

        const result = await pool.query(
            "SELECT * FROM users WHERE email=$1",
            [email]
        )

        if(result.rows.length === 0) {
            return res.status(500).json({
                error: "User not found"
            })
        }

        const user = result.rows[0]
        
        const validPassword = await bcrypt.compare(
            password,
            user.password
        )

        if(!validPassword) {
            return res.status(500).json({
                error: "Invalid password"
            })
        }

        const shopResult = await pool.query(
            "SELECT * FROM shops WHERE user_id=$1",
            [user.id]
        )

        const shop = shopResult.rows[0]

        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: "7d"}
        )

        res.json({
            token,
            user,
            shop,
        })

    }catch (error) {
        console.log(error)
        res.status(500).json({
            error: "Login failed"
        })
    }
})

export default router