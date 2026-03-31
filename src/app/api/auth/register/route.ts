import connectDb from "@/lib/db";
import User from "@/models/user.model";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest) {
    try {
        await connectDb()
        const {name, email, password} = await req.json()

        // Validate inputs
        if (!name || !email || !password) {
            return NextResponse.json(
                {message: "Name, email, and password are required"},
                {status: 400}
            )
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                {message: "Invalid email format"},
                {status: 400}
            )
        }

        // Check if email already exists
        const existUser = await User.findOne({email})
        if(existUser){
            return NextResponse.json(
                {message: "User already exists with this email"},
                {status: 400}
            )
        }

        // Validate password length
        if(password.length < 6){
            return NextResponse.json(
                {message: "Password must be at least 6 characters"},
                {status: 400}
            )
        }

        // Hash password with bcrypt (10 salt rounds)
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create user with hashed password
        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role: "user"
        })

        // Return user data without password
        const userResponse = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }

        return NextResponse.json(
            {message: "Registration successful", user: userResponse},
            {status: 201}
        )

    } catch (error) {
        console.error("Register error:", error)
        return NextResponse.json(
            {message: `Registration failed: ${error instanceof Error ? error.message : "Unknown error"}`},
            {status: 500}
        )
    }
}