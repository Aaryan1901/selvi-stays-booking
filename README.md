# Selvi Stay Bookings

Project Name

Selvi Residency - Official Booking Website

Project Overview

Build a modern, premium, responsive hotel booking website for Selvi Residency, located in Muthialpet, Puducherry, India.

The website should look similar to premium hotel websites like Booking.com, Airbnb, and Treebo, while keeping the booking process extremely simple.

The website should support direct bookings without third-party commissions.

Hotel Information

Hotel Name:
Selvi Residency

Location:
Muthialpet, Puducherry

Number of Rooms:
6 Rooms

Business Type:
Budget Family Residency

Theme

Use

 White

 Dark Blue

 Golden

 Light Grey

Luxury but minimal.

Use smooth animations.

Rounded cards.

Glassmorphism where appropriate.

Beautiful hover effects.

Mobile-first responsive design.

Pages

Home

Large Hero Image

Hotel Name

Book Now button

Availability Search

Scrolling gallery

Customer Reviews

Nearby Attractions

Amenities

Google Maps

Footer

Rooms

Show all 6 rooms.

Each room should have

 Multiple Images

 Room Name

 Price per Night

 Max Occupancy

 Amenities

 Availability Status

 Book Now Button

Example

Room 101

₹1800/night

AC

WiFi

TV

Attached Bathroom

Hot Water

Booking Page

User enters

Check-in

Check-out

Adults

Children

Name

Phone Number

Email

Special Request

The system should

Calculate

Number of Nights

Total Amount

GST

Final Amount

Show Booking Summary

Payment

After booking

Redirect to payment.

Support

UPI

Cards

Net Banking

Wallets

UPI QR

Generate Booking ID.

After successful payment

Show

Booking Confirmed

Booking ID

Payment ID

Download Invoice

Email Confirmation

SMS Confirmation

Booking Management

Guest can

Search booking using

Phone Number

Booking ID

Cancel Booking

View Invoice

Gallery

Professional gallery with

Images

Room Photos

Lobby

Exterior

Nearby Places

About

History

Mission

Facilities

Owner Message

Contact

Phone

WhatsApp

Google Maps

Contact Form

Email

Admin Dashboard

Secure Login

Dashboard should include

Total Bookings

Today's Bookings

Revenue

Upcoming Check-ins

Upcoming Check-outs

Cancelled Bookings

Occupancy %

Monthly Revenue Graph

Manage Rooms

Enable

Add Room

Edit Room

Delete Room

Enable/Disable Booking

Update Pricing

Weekend Pricing

Holiday Pricing

Seasonal Pricing

Upload Images

Manage Bookings

View

Confirm

Cancel

Refund

Export Excel

Export PDF

Search Booking

Customer Management

Guest History

Repeat Customers

Revenue per Customer

Coupon System

Create Coupons

Percentage Discount

Flat Discount

Expiry Date

Usage Limit

Reviews

Approve

Reject

Delete

Reply

Analytics

Revenue

Occupancy

Most Booked Room

Cancellation Rate

Daily Revenue

Monthly Revenue

Payment Gateway

Integrate a secure payment gateway such as Razorpay, Cashfree, or PhonePe Payment Gateway.

Requirements:

 Accept UPI, credit/debit cards, net banking, and wallets.

 Automatically generate payment receipts.

 Record payment IDs and booking IDs.

 Support refunds from the admin panel.

 Use secure webhook verification for payment confirmation.

 Follow PCI-compliant practices.

Do not hardcode or expose payment credentials or UPI IDs in the frontend. Configure merchant account details securely through backend environment variables or the admin settings panel.

Notifications

After successful booking

Send

Email

SMS

WhatsApp

Include

Booking ID

Room

Amount

Check-in

Check-out

Features

Real-time Room Availability

Calendar View

Room Inventory

Dynamic Pricing

Booking Confirmation

Payment Status

Invoice Generator

QR Code on Invoice

GST Support

Multi-language Ready

SEO Optimized

Fast Loading

PWA Ready

Dark Mode

Tech Stack

Frontend

 React

 Next.js

 Tailwind CSS

 Framer Motion

Backend

 Node.js

 Express.js

Database

 PostgreSQL (preferred) or MySQL

Authentication

 JWT

 Secure Admin Login

Storage

 Cloudinary (for images)

Maps

 Google Maps API

Email

 SMTP / Resend

SMS

 Twilio or similar provider

Deployment

 Vercel (Frontend)

 Railway / Render / DigitalOcean (Backend)

User Experience

Booking should take less than 2 minutes.

Beautiful loading animations.

Elegant transitions.

Modern cards.

Premium typography.

Sticky navigation.

Floating WhatsApp button.

Call Now button.

One-click booking.

Homepage Sections

 Hero Banner

 Search Availability

 Featured Rooms

 Why Choose Selvi Residency

 Amenities

 Guest Reviews

 Nearby Attractions

 Google Map

 Contact

 Footer

Amenities

 Free WiFi

 Air Conditioning

 Television

 Attached Bathroom

 Hot Water

 Daily Housekeeping

 Parking

 24×7 Support

 Family Friendly

 CCTV Security

Extra Features

 Booking calendar

 Booking confirmation emails

 Download invoice as PDF

 Admin analytics dashboard

 GST invoice generation

 Room availability calendar

 SEO-friendly URLs

 Image optimization

 Responsive design for mobile, tablet, and desktop

 Accessible design (WCAG-friendly)

 Fast page loads and modern animations

Important Security & Payment Notes

 Do not embed a personal UPI ID or merchant credentials directly into the application code.

 Payment routing should be handled through a verified merchant account configured securely on the server.

 Validate all payments using gateway webhooks before confirming bookings.

 Protect admin routes with authentication and role-based access control.

 Encrypt sensitive data and follow security best practices.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e68e8537-718b-44f1-b9ee-a68afac1cc88).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
