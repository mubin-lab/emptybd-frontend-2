# Digital Collectible Marketplace - Complete Development Specification

Develop a production-ready Digital Collectible Marketplace where users can securely buy, own, sell, and trade digital collectible cards in an open marketplace.

The system must include a Super Admin Management Panel, User Marketplace, Ownership Tracking, Wallet Management, Transaction History, Resale Controls, and Price Request Management.

---

# Core Objective

Build a secure collectible trading ecosystem where:

* Super Admin creates collectible cards.
* Users buy cards from the marketplace.
* Ownership transfers instantly after successful purchase.
* Users can relist owned cards for sale.
* Admin can control pricing permissions per card.
* Every balance movement is recorded.
* Every ownership change is traceable.
* No transaction can create inconsistent balances.

---

# User Roles

## 1. Super Admin

Full system access.

Permissions:

* Create cards
* Edit cards
* Delete cards
* Activate/Deactivate cards
* Manage pricing rules
* View all transactions
* View all ownership history
* View all user requests
* Approve/Reject price change requests
* View all marketplace listings
* View user balances
* Force remove listings if needed

---

## 2. User

Permissions:

* Browse marketplace
* View card details
* Purchase cards
* View owned cards
* Set resale price (when allowed)
* Relist cards
* Submit price change requests
* View wallet balance
* View transaction history

---

# Database Structure

## Users Collection

Store:

* id
* name
* email
* avatar
* role
* walletBalance
* totalAssetsOwned
* createdAt

---

## Assets Collection

Store:

* id
* title
* category
* value
* description
* image
* status

Categories:

* Low
* Medium
* High
* Big-Time

Status:

* Active
* Inactive

Pricing Access:

* onlyAdminAccess
* bothAccess

Additional Fields:

* currentOwner
* currentPrice
* originalPrice
* isListed
* sellerId
* sellerName
* sellerAvatar
* ownershipCount
* createdAt
* updatedAt

---

## Transactions Collection

Store:

* transactionId
* assetId
* buyerId
* sellerId
* amount
* transactionType
* status
* createdAt

Types:

* Initial Purchase
* Resale Purchase
* Admin Transfer

Status:

* Completed
* Pending
* Failed

---

## Ownership History Collection

Store:

* assetId
* previousOwner
* newOwner
* salePrice
* transferredAt

This acts as a permanent ledger.

---

## Price Change Requests Collection

Store:

* id
* assetId
* userId
* message
* currentPrice
* requestedPrice
* status
* adminResponse
* createdAt

Status:

* Pending
* Approved
* Rejected

---

# Admin Panel

Only users with role:

superAdmin

can access.

Unauthorized users must receive:

403 Forbidden

and must never see menu items.

---

# Admin Sidebar

Cards Management

* All Cards
* Create Card
* Active Cards
* Inactive Cards

Marketplace Management

* Listings
* Transactions
* Ownership History

Pricing Requests

* Pending Requests
* Approved Requests
* Rejected Requests

Users

* All Users
* User Balances

---

# Create Card Page

Fields:

Title

Category Dropdown

Options:

* Low
* Medium
* High
* Big-Time

Value

Description

Image Upload

Pricing Access Dropdown

Options:

* Only Admin Access
* Both Access

Status Toggle

* Active
* Inactive

Submit Button

---

# Asset Listing Page (Admin)

Table Columns:

* Image
* Title
* Category
* Value
* Current Price
* Owner
* Pricing Access
* Status
* Created Date
* Actions

Actions:

* View
* Edit
* Delete

Delete requires confirmation modal.

---

# Marketplace Navigation

Add a professional menu item:

Digital Exchange

This becomes the main marketplace page.

---

# Marketplace Listing UI

Card Layout:

Left Side:

* Card Image

Right Side:

* Title
* Category
* Current Price
* Asset Value
* Seller Name
* Seller Avatar
* Buy Now Button

Important:

For newly created cards:

Seller Name = Not Displayed

Because admin inventory has no seller.

Only show seller information after a user owns and relists the card.

---

# Asset Details Page

Display:

Large Image

Title

Category

Value

Current Price

Description

Current Owner

Seller Information

Ownership Count

Purchase Button

Ownership History Section

Transaction Trust Indicators

Examples:

* Verified Asset
* Ownership Tracked
* Secure Marketplace

---

# Purchase Flow

When user clicks:

Purchase

Never purchase instantly.

Navigate user to:

Purchase Confirmation Page

---

# Purchase Confirmation Page

Show:

Asset Information

Current Price

User Balance

Final Amount

---

# Price Control Logic

CASE 1:

Pricing Access = Both Access

Show editable resale price field.

User may enter a new resale price.

If left empty:

Default value = Purchase Price

Example:

Purchase Price = $100

User enters nothing

Resale Price becomes:

$100

---

CASE 2:

Pricing Access = Only Admin Access

Disable resale price field.

Show message:

"Only Admin can access this asset's price."

Show button:

Request Price Change

Opens modal.

User can submit:

* Desired price
* Message

Store request in Price Change Requests collection.

---

# Purchase Completion Logic

Must execute inside a database transaction.

Steps:

1. Verify buyer balance.

2. Lock asset.

3. Deduct amount from buyer.

4. Credit amount to seller.

5. Transfer ownership.

6. Create transaction record.

7. Create ownership history record.

8. Update marketplace listing.

9. Unlock asset.

10. Return success response.

All steps must succeed or rollback completely.

No partial updates allowed.

---

# Initial Purchase Logic

Admin-created cards initially belong to system inventory.

When purchased:

* Ownership transfers to buyer.
* Seller becomes buyer when relisted.
* Seller info becomes visible afterward.

---

# Resale Listing Logic

After successful purchase:

Asset becomes:

Owned Asset

User sees:

List For Sale

If resale price was set:

Use that value.

Otherwise:

Use purchase price.

Marketplace listing updates instantly.

Show:

Seller Name

Seller Avatar

Current Price

---

# Wallet System

Every user has:

walletBalance

Supported Actions:

* Credit
* Debit
* Transfer

Rules:

Never allow negative balance.

Always log transactions.

---

# Transaction History Page

User View:

* Asset
* Amount
* Type
* Date
* Status

Admin View:

Everything plus:

* Buyer
* Seller
* Ownership Transfer

---

# Price Request Management

Admin Panel Section:

Asset Pricing Requests

Columns:

* Asset
* User
* Current Price
* Requested Price
* Message
* Status
* Date

Actions:

* Approve
* Reject
* Reply

Admin decisions must be stored permanently.

---

# Security Requirements

Implement:

Role-Based Access Control (RBAC)

Server-side permission validation

Protected API routes

JWT Authentication

Ownership validation

Input validation

Rate limiting

Audit logs

Transaction locking

Atomic database transactions

Image upload validation

Secure file storage

---

# API Endpoints

Cards

GET /cards

GET /cards/:id

POST /cards

PATCH /cards/:id

DELETE /cards/:id

Transactions

POST /purchase

GET /transactions

Ownership

GET /ownership-history/:assetId

Price Requests

POST /price-request

GET /price-requests

PATCH /price-request/:id

Wallet

GET /wallet

POST /wallet/credit

POST /wallet/debit

---

# UI Requirements

Use:

* Next.js
* TypeScript
* Tailwind CSS
* ShadCN UI
* React Query
* Axios
* Zustand or Context API

Design Style:

* Modern
* Premium
* Professional
* Marketplace-focused

Responsive:

* Desktop
* Tablet
* Mobile

Loading States:

* Skeleton Loaders

Error States:

* Toast Notifications

Success States:

* Confirmation Modals

---

# Final Goal

Create a trustworthy digital asset marketplace where ownership, balance transfers, resale pricing, transaction history, and admin controls are fully synchronized, auditable, secure, and immediately reflected throughout the system.
