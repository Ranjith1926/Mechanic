# Bike Mechanic Management Application

## 1. Project Overview

The Bike Mechanic Management Application is a role-based application for a bike service/repair workshop.

The application has only two roles:

1. **Mechanic** – manages customers, bikes, services, spare parts, invoices, notifications, follow-ups, and revenue/billing reports.
2. **Client** – views their bikes, service history, invoices, notifications, and follow-up information.

The system is designed as **one application with role-based screens**, not two completely separate applications.

### Primary Goal

The main purpose is to help the mechanic maintain the complete history of every bike and quickly answer:

- What work was done on this bike previously?
- Which spare parts were changed?
- Which parts were old and which were newly installed?
- What was the previous service?
- What is the current service?
- How much was billed today/monthly?
- Which clients need follow-up?
- Can the invoice be generated and shared with the client?

Online payment is **not required** in the initial version.

---

# 2. Recommended Architecture

## Application Model

Use one application with role-based access:

```text
                    BIKE MECHANIC APPLICATION
                              |
                    +---------+---------+
                    |                   |
                 CLIENT              MECHANIC
                    |                   |
                    +---------+---------+
                              |
                       ASP.NET Core API
                              |
                           EF Core
                              |
                         SQL Server
```

## Recommended Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js + React + TypeScript |
| Backend | ASP.NET Core Web API |
| ORM | Entity Framework Core |
| Database | SQL Server |
| Authentication | JWT |
| Authorization | Role-Based Authorization |
| Invoice | PDF generation |
| Notifications | Firebase Cloud Messaging |
| File Storage | Local initially; cloud storage later |
| Containerization | Docker, after MVP |
| Deployment | AWS/Azure |
| Cache | Redis only if required later |
| Payments | Not required |
| Microservices | Not required for MVP |

## Architecture Principle

Start with a **simple modular monolith**:

```text
Next.js
    |
ASP.NET Core Web API
    |
EF Core
    |
SQL Server
```

Do not introduce API Gateway, Kafka, Kubernetes, microservices, or Redis in the first version unless there is a real requirement.

---

# 3. Roles

## 3.1 Mechanic

The mechanic is the main operational user.

The mechanic can:

- Login
- Manage clients
- Manage bikes
- Search clients/bikes
- View complete bike history
- Create service records
- Record complaints
- Record inspection details
- Record work performed
- Add spare parts
- Track old and new spare parts
- Generate invoices
- Generate invoice PDF
- Share invoice with client
- Send service notifications
- Create follow-up reminders
- View daily revenue/billed amount
- View monthly revenue/billed amount
- View labour revenue
- View spare-parts revenue
- View service and invoice statistics

## 3.2 Client

The client is the bike owner.

The client can:

- Register/login
- View profile
- View their bikes
- View bike details
- View service history
- View service details
- View invoices
- View/download invoice PDF
- Receive notifications
- View follow-up reminders

The client does not manage service records or spare parts.

---

# 4. Core Business Workflow

```text
Client brings bike
       |
Search Client / Bike
       |
Open Bike History
       |
Create New Service
       |
Record Complaint
       |
Inspection
       |
Record Work Done
       |
Add Spare Parts
       |
Record Old -> New replacement
       |
Calculate Bill
       |
Generate Invoice
       |
Share Invoice with Client
       |
Send Service Completion Notification
       |
Create Follow-up
```

---

# 5. Mechanic Dashboard

The mechanic dashboard should provide a quick overview.

## Today's Summary

- Services today
- Invoices today
- Total billed/revenue today
- Labour revenue today
- Spare-parts revenue today

## Monthly Summary

- Services this month
- Invoices this month
- Total billed/revenue this month
- Labour revenue this month
- Spare-parts revenue this month

## Follow-ups

Show:

- Follow-ups due today
- Follow-ups due tomorrow
- Upcoming follow-ups

## Recent Services

Show:

- Customer
- Bike
- Service date
- Invoice number
- Total amount

Example:

```text
TODAY

Services          8
Invoices          8
Revenue      Rs. 12,450

LABOUR         Rs. 4,500
SPARES         Rs. 7,950
```

## Revenue Chart

Provide a simple chart with date filters:

- Today
- Yesterday
- This week
- This month
- Last month
- Custom date range

---

# 6. Revenue vs Earnings

The system should initially use the term **Revenue / Total Billed**, because online payment and business expense/profit tracking are not part of the MVP.

Example:

```text
September 2026

Total Billed       Rs. 1,84,500
Labour Revenue     Rs.   72,000
Spare Parts        Rs. 1,12,500
```

Do not calculate actual profit unless the system later records:

- Spare-part purchase cost
- Selling price
- Operating expenses
- Other business expenses

---

# 7. Customer Management

The mechanic can create and manage clients.

## Client Information

- Client ID
- Full name
- Phone number
- Email (optional)
- Address (optional)
- Notes
- Created date
- Active/inactive status

## Search

The mechanic should be able to search by:

- Customer name
- Phone number
- Bike registration number

---

# 8. Bike Management

A client can have one or multiple bikes.

## Bike Information

- Bike ID
- Client ID
- Registration number
- Brand
- Model
- Variant (optional)
- Manufacturing year (optional)
- Colour (optional)
- Current odometer
- Purchase date (optional)
- Notes
- Bike photo (optional)

## Bike History

Every bike should have a complete service timeline.

Example:

```text
Honda Activa 6G
Registration: TN-XX-1234

15-Jan-2026
Engine Oil       Replaced
Air Filter       Replaced
Brake            Adjusted

18-Apr-2026
Engine Oil       Replaced
Brake Pad        Inspected

21-Sep-2026
Engine Oil       Replaced
Brake Pad        Replaced
```

This history is the most important feature for the mechanic.

---

# 9. Service Management

Each service creates a service record linked to a specific bike.

## Service Information

- Service ID
- Bike ID
- Mechanic ID
- Service date
- Odometer reading
- Customer complaint
- Inspection notes
- Work performed
- Labour amount
- Service status
- Additional notes
- Created date
- Completed date

## Suggested Status

```text
NEW
  |
INSPECTION
  |
IN_PROGRESS
  |
WAITING_FOR_PARTS
  |
COMPLETED
  |
DELIVERED
```

For the MVP, the mechanic can use a simplified status flow:

```text
NEW -> IN_PROGRESS -> COMPLETED
```

More statuses can be added later.

---

# 10. Spare Parts Management

The system must help the mechanic remember what changed during each service.

## Spare Part Catalog

Basic spare information:

- Spare Part ID
- Part name
- Brand
- Part number (optional)
- Default selling price
- Description
- Active/inactive

## Spare Part Used in Service

For every part added to a service:

- Part ID
- Service ID
- Quantity
- Unit price
- Total price
- Action
- Old part description
- New part description
- Notes

## Spare Part Actions

```text
INSPECTED
REUSED
REPLACED
ADDED
REMOVED
```

The most important action is **REPLACED**.

Example:

```text
Brake Pad

Old Part:
Worn brake pad

New Part:
Honda OEM brake pad

Quantity:
1

Price:
Rs. 450

Action:
REPLACED
```

---

# 11. Old vs New Part Tracking

When a part is replaced, the application should preserve the replacement history.

Example:

```text
Air Filter History

15-Jan-2026
REPLACED

18-Apr-2026
INSPECTED / REUSED

21-Sep-2026
REPLACED
```

This allows the mechanic to quickly determine when a part was last replaced.

The system should not delete the previous part record when a new part is installed.

Instead:

```text
Old Part
    |
    +---- Removed / Replaced
    |
New Part
    |
    +---- Installed
```

---

# 12. Invoice Management

Online payment is not required.

The application only needs billing and invoice generation.

## Invoice Information

- Invoice ID
- Invoice number
- Service ID
- Client ID
- Bike ID
- Invoice date
- Labour amount
- Spare-parts amount
- Discount (optional)
- Tax (optional)
- Total amount
- Notes
- Invoice PDF path
- Created date

## Invoice Items

Each invoice can contain:

```text
Labour
    General Service     Rs. 300

Spare Parts
    Engine Oil          Rs. 600
    Brake Pad           Rs. 450

Total                  Rs. 1,350
```

## Invoice Actions

- Generate invoice
- Preview invoice
- Download PDF
- Print invoice
- Share invoice
- Resend invoice

---

# 13. Client Notification

After completing a service, the mechanic should be able to send a notification.

Example:

```text
Service Completed

Your Honda Activa 6G service has been completed.

Invoice Amount: Rs. 1,350

Invoice: View Invoice

Thank you for choosing our service.
```

The notification can contain:

- Client name
- Bike
- Service status
- Invoice amount
- Invoice link
- Follow-up date

---

# 14. Follow-up Management

Follow-up is an important feature for customer retention.

When completing a service, the mechanic can create a follow-up.

## Follow-up Information

- Follow-up ID
- Client ID
- Bike ID
- Service ID
- Follow-up date
- Follow-up type
- Notes
- Status
- Notification sent status

## Follow-up Types

```text
GENERAL_SERVICE
ENGINE_OIL
BRAKE_CHECK
TYRE_CHECK
CUSTOM
```

Example:

```text
Next Follow-up

Date:
21-Dec-2026

Type:
GENERAL_SERVICE

Notes:
Check brake condition
```

## Follow-up Dashboard

```text
FOLLOW-UPS TODAY

Kumar
Honda Activa
TN-XX-1234

Reason:
General Service

[Call Client]
[View History]
[View Invoice]
```

---

# 15. Client Dashboard

The client dashboard should be very simple.

```text
CLIENT DASHBOARD

My Bikes
    |
    +-- Honda Activa
    +-- Yamaha FZ

Recent Service
    |
    +-- 21-Sep-2026
        Rs. 1,350

Next Follow-up
    |
    +-- 21-Dec-2026

Latest Invoice
    |
    +-- INV-1024
```

---

# 16. Client Bike Screen

```text
Honda Activa 6G

Registration:
TN-XX-1234

Odometer:
30,250 KM

Last Service:
21-Sep-2026

Last Bill:
Rs. 1,350

Next Service:
21-Dec-2026

[View Service History]
[View Latest Invoice]
```

---

# 17. Client Service History

The client can see:

```text
21-Sep-2026

Work Done
- General service
- Brake adjustment
- Engine oil replacement

Spares
- Engine Oil
- Brake Pad

Invoice
Rs. 1,350

[View Invoice]
```

---

# 18. Recommended Application Navigation

## Mechanic

```text
Dashboard
Customers
Bikes
Services
Spare Parts
Invoices
Follow-ups
Notifications
Profile
```

## Client

```text
Dashboard
My Bikes
Service History
Invoices
Notifications
Profile
```

---

# 19. Database Design

## Users

```text
Users
-----
Id
Name
Phone
Email
PasswordHash
Role
IsActive
CreatedAt
UpdatedAt
```

Roles:

```text
CLIENT
MECHANIC
```

## Clients

```text
Clients
-------
Id
UserId
Name
Phone
Email
Address
Notes
CreatedAt
UpdatedAt
```

## Bikes

```text
Bikes
-----
Id
ClientId
RegistrationNumber
Brand
Model
Variant
ManufacturingYear
Colour
CurrentOdometer
PhotoUrl
Notes
CreatedAt
UpdatedAt
```

## Services

```text
Services
--------
Id
BikeId
MechanicId
ServiceDate
Odometer
Complaint
InspectionNotes
WorkPerformed
LabourAmount
Status
Notes
CreatedAt
CompletedAt
```

## SpareParts

```text
SpareParts
----------
Id
Name
Brand
PartNumber
DefaultPrice
Description
IsActive
CreatedAt
UpdatedAt
```

## ServiceParts

```text
ServiceParts
------------
Id
ServiceId
SparePartId
Quantity
UnitPrice
TotalPrice
Action
OldPartDescription
NewPartDescription
Notes
```

## Invoices

```text
Invoices
--------
Id
InvoiceNumber
ServiceId
ClientId
BikeId
InvoiceDate
LabourAmount
SparePartsAmount
Discount
Tax
TotalAmount
PdfUrl
CreatedAt
```

## InvoiceItems

```text
InvoiceItems
------------
Id
InvoiceId
Description
Category
Quantity
UnitPrice
Amount
```

Categories:

```text
LABOUR
SPARE_PART
OTHER
```

## FollowUps

```text
FollowUps
---------
Id
ClientId
BikeId
ServiceId
FollowUpDate
FollowUpType
Notes
Status
NotificationSent
CreatedAt
CompletedAt
```

## Notifications

```text
Notifications
-------------
Id
ClientId
Title
Message
Type
ReferenceId
IsRead
SentAt
CreatedAt
```

---

# 20. Entity Relationships

```text
User
 |
 +---- Client
 |       |
 |       +---- Bikes
 |              |
 |              +---- Services
 |                    |
 |                    +---- ServiceParts
 |                    |
 |                    +---- Invoice
 |                    |      |
 |                    |      +---- InvoiceItems
 |                    |
 |                    +---- FollowUps
 |
 +---- Mechanic
        |
        +---- Services
```

---

# 21. API Design

## Authentication

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
```

## Clients

```text
GET    /api/clients
GET    /api/clients/{id}
POST   /api/clients
PUT    /api/clients/{id}
DELETE /api/clients/{id}
GET    /api/clients/search
```

## Bikes

```text
GET    /api/bikes
GET    /api/bikes/{id}
POST   /api/bikes
PUT    /api/bikes/{id}
DELETE /api/bikes/{id}
GET    /api/bikes/{id}/history
```

## Services

```text
GET    /api/services
GET    /api/services/{id}
POST   /api/services
PUT    /api/services/{id}
POST   /api/services/{id}/complete
GET    /api/bikes/{bikeId}/services
```

## Spare Parts

```text
GET    /api/spare-parts
POST   /api/spare-parts
PUT    /api/spare-parts/{id}
GET    /api/spare-parts/{id}/history
```

## Invoices

```text
GET    /api/invoices
GET    /api/invoices/{id}
POST   /api/invoices
GET    /api/invoices/{id}/pdf
POST   /api/invoices/{id}/send
```

## Follow-ups

```text
GET    /api/follow-ups
POST   /api/follow-ups
PUT    /api/follow-ups/{id}
GET    /api/follow-ups/today
```

## Dashboard

```text
GET /api/dashboard/mechanic
GET /api/dashboard/revenue
GET /api/dashboard/services
GET /api/dashboard/follow-ups
```

---

# 22. Authorization

Use JWT authentication and role-based authorization.

Example:

```text
CLIENT
- View own bikes
- View own services
- View own invoices
- View own notifications

MECHANIC
- Manage clients
- Manage bikes
- Manage services
- Manage spare parts
- Create invoices
- Send notifications
- Manage follow-ups
- View revenue
```

The backend must enforce authorization. Hiding a screen in the frontend is not sufficient.

---

# 23. Revenue Calculation

Revenue should be calculated from invoices.

## Daily Revenue

```text
Today's Revenue
=
SUM(TotalAmount)
WHERE InvoiceDate = Today
```

## Monthly Revenue

```text
Monthly Revenue
=
SUM(TotalAmount)
WHERE InvoiceDate
BETWEEN MonthStart AND MonthEnd
```

## Labour Revenue

```text
SUM(LabourAmount)
```

## Spare Parts Revenue

```text
SUM(SparePartsAmount)
```

## Average Invoice

```text
Total Revenue / Number of Invoices
```

---

# 24. Revenue Dashboard Example

```text
September 2026

Total Billed       Rs. 1,84,500
Labour Revenue     Rs.   72,000
Spare Parts        Rs. 1,12,500

Services                 126
Invoices                 118
Average Invoice       Rs. 1,563
```

Filters:

```text
Today
Yesterday
This Week
This Month
Last Month
Custom Range
```

---

# 25. Notification Architecture

Initial architecture:

```text
ASP.NET Core API
       |
Notification Service
       |
Firebase Cloud Messaging
       |
Client Mobile/Web App
```

Notification types:

```text
SERVICE_COMPLETED
INVOICE_CREATED
FOLLOW_UP_REMINDER
GENERAL_NOTIFICATION
```

---

# 26. Invoice Sharing

The mechanic can:

```text
Complete Service
       |
Generate Invoice
       |
Generate PDF
       |
+------+----------------+
|      |                |
View   Download        Share
                       |
                  Client receives
```

WhatsApp integration can be added later.

For MVP, sharing the generated PDF/link through the device's normal share functionality is sufficient.

---

# 27. File Management

Possible files:

- Bike photos
- Service photos
- Invoice PDFs

Start with simple storage.

Later:

```text
ASP.NET Core
     |
Cloud Storage
     |
AWS S3 / Azure Blob Storage
```

Do not make cloud storage mandatory for the first development phase.

---

# 28. Security Requirements

- Passwords must be hashed.
- JWT tokens must be validated.
- Role authorization must be enforced at API level.
- Users can only access permitted data.
- Client users must not access other clients' bikes/invoices.
- Mechanic-only APIs must reject client users.
- Validate all request input.
- Validate uploaded files.
- Limit file sizes.
- Avoid exposing sensitive database information.
- Use HTTPS in production.
- Store secrets in environment variables/secret storage.
- Log important service and invoice operations.

---

# 29. Audit / History

Important business data should not be silently deleted.

For service history:

```text
Old Service
    |
    +-- Work performed
    +-- Parts used
    +-- Invoice
```

If a part was replaced, keep the old record.

If an invoice is corrected, use controlled update/void functionality rather than deleting historical billing data.

---

# 30. MVP Scope

## Phase 1 – Foundation

- Project setup
- Next.js frontend
- ASP.NET Core API
- SQL Server
- EF Core
- Authentication
- JWT
- Client/Mechanic roles

## Phase 2 – Client and Bike

- Client CRUD
- Bike CRUD
- Search
- Bike details
- Bike history

## Phase 3 – Service

- Create service
- Complaint
- Inspection
- Work performed
- Odometer
- Service status
- Service history

## Phase 4 – Spare Parts

- Spare catalog
- Add parts to service
- Reused/replaced actions
- Old/new tracking
- Part history

## Phase 5 – Invoice

- Invoice creation
- Invoice items
- Labour
- Spare parts
- Total calculation
- PDF generation
- Download/print/share

## Phase 6 – Notifications

- Service completion notification
- Invoice notification
- Follow-up notification

## Phase 7 – Follow-ups

- Create follow-up
- Today's follow-ups
- Upcoming follow-ups
- Reminder notifications

## Phase 8 – Dashboard

- Daily revenue
- Monthly revenue
- Labour revenue
- Spare-parts revenue
- Service count
- Invoice count
- Average invoice
- Revenue chart

## Phase 9 – Deployment

- Docker
- Production database
- Cloud storage
- AWS/Azure
- CI/CD
- Monitoring

---

# 31. Features Explicitly Not Required in MVP

Do not build these initially:

- Online payment
- Customer payment gateway
- Multiple staff roles
- Mechanic assignment
- Payroll
- Inventory accounting
- Full accounting system
- Microservices
- Kubernetes
- Kafka
- API Gateway
- Complex booking system
- Multi-branch management

These can be considered later if the business requires them.

---

# 32. Suggested Project Structure

```text
bike-mechanic/
|
├── frontend/
│   └── Next.js
│       ├── app/
│       │   ├── login/
│       │   ├── client/
│       │   └── mechanic/
│       ├── components/
│       ├── services/
│       ├── hooks/
│       ├── types/
│       └── utils/
|
├── backend/
│   └── BikeMechanic.Api/
│       ├── Controllers/
│       ├── Services/
│       ├── Repositories/
│       ├── Entities/
│       ├── DTOs/
│       ├── Data/
│       ├── Middleware/
│       ├── Authorization/
│       └── Configuration/
|
├── database/
│   ├── migrations/
│   └── seed/
|
├── docs/
│
├── docker-compose.yml
└── README.md
```

---

# 33. Recommended Development Order

Build in this order:

```text
1. Authentication
       ↓
2. Client
       ↓
3. Bike
       ↓
4. Bike History
       ↓
5. Service
       ↓
6. Spare Parts
       ↓
7. Invoice
       ↓
8. Notification
       ↓
9. Follow-up
       ↓
10. Revenue Dashboard
       ↓
11. Docker
       ↓
12. Cloud Deployment
```

This prevents the project from becoming unnecessarily complex.

---

# 34. Final Product Vision

```text
                         BIKE MECHANIC APP
                                |
                 +--------------+--------------+
                 |                             |
              CLIENT                        MECHANIC
                 |                             |
          +------+-------+             +-------+--------+
          |      |       |             |       |        |
        Bikes History Invoice       Service  Spares  Revenue
          |      |       |             |       |        |
          +------+-------+             +-------+--------+
                 |                             |
                 +-------------+---------------+
                               |
                         Notifications
                               |
                          Follow-ups
```

The central concept is:

```text
CLIENT
   |
BIKE
   |
SERVICE HISTORY
   |
SPARE PART HISTORY
   |
INVOICE
   |
FOLLOW-UP
```

This should remain the core of the application.

---

# 35. Definition of Done for MVP

The MVP is considered complete when:

- A mechanic can login.
- A client can login.
- Mechanic can create/search clients.
- Mechanic can create/search bikes.
- Mechanic can view complete bike service history.
- Mechanic can create a service.
- Mechanic can record work performed.
- Mechanic can record spare parts.
- Mechanic can record old/new replacement information.
- Mechanic can generate an invoice.
- Invoice contains labour and spare parts.
- Invoice can be generated as PDF.
- Invoice can be shared with the client.
- Client can view the invoice.
- Client can view service history.
- Mechanic can send service completion notification.
- Mechanic can create follow-up.
- Follow-up reminders can be shown/sent.
- Mechanic can view daily billed revenue.
- Mechanic can view monthly billed revenue.
- Mechanic can view labour vs spare-parts revenue.
- Client cannot access another client's information.
- Mechanic-only APIs are protected.
- Application can be deployed to a production environment.

---

# 36. Final Recommendation

Use a **single application with two roles: Client and Mechanic**.

Use a **modular monolith**:

```text
Next.js
    ↓
ASP.NET Core Web API
    ↓
EF Core
    ↓
SQL Server
```

Start simple and add infrastructure only when needed.

The most valuable business features are:

1. **Bike history**
2. **Old/new spare-part tracking**
3. **Service records**
4. **Invoice generation and sharing**
5. **Client notifications**
6. **Follow-up management**
7. **Daily/monthly revenue dashboard**

No payment gateway is required for the MVP.
