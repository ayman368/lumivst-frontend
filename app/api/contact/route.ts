import { NextRequest, NextResponse } from 'next/server';

interface ContactFormData {
    name: string;
    email: string;
    phone?: string;
    message: string;
}

export async function POST(request: NextRequest) {
    try {
        // Parse request body
        const body: ContactFormData = await request.json();

        // Validation
        if (!body.name || !body.email || !body.message) {
            return NextResponse.json(
                { error: 'Name, email, and message are required fields.' },
                { status: 400 }
            );
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(body.email)) {
            return NextResponse.json(
                { error: 'Please provide a valid email address.' },
                { status: 400 }
            );
        }

        // Log the contact form data (in production, you'd save to database)
        console.log('📧 New Contact Form Submission:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Name:', body.name);
        console.log('Email:', body.email);
        console.log('Phone:', body.phone || 'Not provided');
        console.log('Message:', body.message);
        console.log('Timestamp:', new Date().toISOString());
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Here you can add database logic
        // Example with PostgreSQL (if you have a database connection):
        /*
        const { Pool } = require('pg');
        const pool = new Pool({
          connectionString: process.env.DATABASE_URL,
        });
    
        await pool.query(
          'INSERT INTO contact_messages (name, email, phone, message, created_at) VALUES ($1, $2, $3, $4, NOW())',
          [body.name, body.email, body.phone || null, body.message]
        );
        */

        // You can also send an email notification here
        // using services like SendGrid, Nodemailer, etc.

        // Return success response
        return NextResponse.json(
            {
                success: true,
                message: 'Thank you for contacting us! We will get back to you soon.',
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('❌ Contact form error:', error);
        return NextResponse.json(
            { error: 'An error occurred while processing your request. Please try again later.' },
            { status: 500 }
        );
    }
}

// Handle other HTTP methods
export async function GET() {
    return NextResponse.json(
        { error: 'Method not allowed. Use POST to submit contact form.' },
        { status: 405 }
    );
}
