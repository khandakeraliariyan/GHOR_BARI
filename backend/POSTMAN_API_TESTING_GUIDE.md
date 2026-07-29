# GhorBari Backend — Complete Postman API Testing Guide

> Source of truth: the Express routes and controllers under `backend/src/`.
> Last audited: 2026-07-29.
>
> Scope: all 83 registered HTTP routes (82 application routes plus the root
> server check). Socket.IO events are listed separately because they cannot be
> exercised as ordinary REST requests.

## 1. Important routing note

Most routes are mounted directly at the server root. Do **not** add `/api` unless
it appears in the endpoint shown in this guide.

```text
Local base URL: http://localhost:5000
```

Examples:

```text
Correct:   POST http://localhost:5000/register-user
Incorrect: POST http://localhost:5000/api/users/register-user

Correct:   POST http://localhost:5000/api/ai/send-message
Correct:   GET  http://localhost:5000/api/payments/listing-drafts
```

## 2. Prerequisites

Before testing:

1. Run MongoDB and configure `MONGO_URI`.
2. Configure Firebase Admin credentials used by `src/config/firebase.js`.
3. Start the backend from `backend/` with `npm run dev`.
4. Create three Firebase Authentication users:
   - QA User A (acts as property owner first);
   - QA User B (acts as applicant/seeker first);
   - QA administrator.
5. Register the same emails through `POST /register-user` with role `user`.
6. Change only the administrator's MongoDB `role` to `admin`.
7. Obtain a current Firebase **ID token** for each account using section 3. A
   Firebase API key is not an ID token, and a refresh token is not an ID token.
8. For AI tests, configure the required Groq/AI environment variables.
9. For email-job tests, configure `INTERNAL_CRON_SECRET`.
10. For real payment tests, configure SSLCommerz and the frontend return URL.

Firebase ID tokens expire. Refresh the corresponding Postman variable whenever
a protected request starts returning `403 {"message":"Invalid token"}`.

### Normal-user role model

GhorBari does not enforce separate permanent owner and seeker roles for normal
users. The frontend registers every non-admin account with:

```json
{"role":"user"}
```

“Owner” and “seeker” describe a user's relationship to a particular property or
application:

- a user is the owner of properties created with their Firebase token;
- a different user is the seeker/applicant when they apply;
- the same account can own one property and apply to somebody else's property;
- only `role:"admin"` grants special role-based access.

Legacy values `property_owner` and `property_seeker` are accepted by the backend
registration controller, but the current UI does not use them and the protected
owner/seeker actions do not depend on them.

### Authentication and user-data architecture

| System | Responsibility | Use by private APIs |
|---|---|---|
| Firebase Authentication | Signup, password/Google login, UID, token issuance and token verification | `Authorization: Bearer <Firebase ID token>` |
| MongoDB `users` | Profile, phone, image, application role, NID state, ratings and analytics | Profile matched by the verified token's email |

The backend does not store or validate passwords. On protected requests,
`verifyToken` uses Firebase Admin to verify the ID token and attaches its UID,
email, display name, picture, and email-verification flag to `req.user`.
MongoDB then supplies application data and authorization context, such as
`role:"admin"` and property/application ownership.

Consequently:

- a MongoDB profile alone cannot authenticate;
- a Firebase account can authenticate, but profile-dependent APIs may have no
  application data until `/register-user` creates the MongoDB profile;
- the Firebase and MongoDB emails must match;
- deleting an admin user endpoint removes only MongoDB data, not Firebase Auth;
- passwords cannot be read or changed through this backend.

## 3. Postman environment

Create an environment named `GhorBari Local` with these variables:

| Variable | Initial example | Purpose |
|---|---|---|
| `baseUrl` | `http://localhost:5000` | Backend URL, without trailing slash |
| `firebaseApiKey` | Firebase Web API key | Used only with Firebase Auth REST |
| `qaPassword` | `GhorBariQA123!` | Password for disposable QA accounts; mark secret |
| `ownerEmail` | `owner.qa@example.com` | User A; initially acts as owner |
| `seekerEmail` | `seeker.qa@example.com` | User B; initially acts as applicant |
| `adminEmail` | `admin.qa@example.com` | Administrator account |
| `otherEmail` | `other.qa@example.com` | Optional fourth account |
| `ownerToken` | Firebase ID token | Owner authorization |
| `seekerToken` | Firebase ID token | Seeker authorization |
| `adminToken` | Firebase ID token | Admin authorization |
| `internalCronSecret` | local configured secret | Internal email-job endpoint |
| `ownerUserId` | set from DB/admin response | MongoDB user ID |
| `seekerUserId` | set from DB/admin response | MongoDB user ID |
| `propertyId` | set after property creation | Main test property |
| `propertyId2` | set after second property | Comparison tests |
| `applicationId` | set after application | Application workflow |
| `conversationId` | set after conversation | Chat workflow |
| `messageId` | set after sending a message | Message deletion |
| `comparisonId` | set after comparison creation | Comparison workflow |
| `shareLink` | set after sharing | Public comparison |
| `notificationId` | set from notifications | Notification test |
| `draftId` | set when a paid listing creates a draft | Payment tests |

The existing variable names `ownerEmail` and `seekerEmail` are scenario labels,
not permanent application roles.

### Creating and logging in QA accounts

`POST /register-user` is **not** an authentication signup endpoint. It creates
only the MongoDB application profile and intentionally accepts no password.
Firebase Authentication owns passwords and issues bearer tokens.

The route itself is public and does not verify that the supplied email belongs
to a real Firebase account. The normal frontend sequence creates/authenticates
Firebase first and then creates the matching MongoDB profile.

There are two valid setup options:

1. Register each QA account through the frontend `/register` page, then use the
   Firebase login request below to obtain its token; or
2. Use Firebase Auth REST in Postman to create/login the Firebase account, then
   call the backend `POST /register-user` once to create its profile.

For DB-only QA profiles that were already created, use Firebase **Sign up** with
the same email. After Firebase creates the credential, do not call backend
registration again—the existing database profile is already linked by email.

The Firebase Web API key is the value of frontend environment variable
`VITE_apiKey`. It identifies the Firebase project; it is not a bearer token.

#### Firebase: create an email/password credential

This is an external Firebase request, not a GhorBari backend route:

`POST https://identitytoolkit.googleapis.com/v1/accounts:signUp?key={{firebaseApiKey}}`

```json
{
  "email": "{{ownerEmail}}",
  "password": "{{qaPassword}}",
  "returnSecureToken": true
}
```

Expected `200`:

```json
{
  "idToken": "<Firebase ID token>",
  "email": "owner.qa@example.com",
  "refreshToken": "<refresh token>",
  "expiresIn": "3600",
  "localId": "<Firebase UID>"
}
```

Save the token:

```javascript
const json = pm.response.json();
pm.environment.set("ownerToken", json.idToken);
```

Repeat for User B and admin, changing the email and destination token variable.
If Firebase returns `EMAIL_EXISTS`, use the login request instead.

#### Firebase: login and obtain a fresh ID token

`POST https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={{firebaseApiKey}}`

```json
{
  "email": "{{ownerEmail}}",
  "password": "{{qaPassword}}",
  "returnSecureToken": true
}
```

Expected `200` contains `idToken`, `refreshToken`, `expiresIn`, and `localId`.
Use the same token-saving script above. Create equivalent saved requests for:

```javascript
pm.environment.set("seekerToken", pm.response.json().idToken);
```

and:

```javascript
pm.environment.set("adminToken", pm.response.json().idToken);
```

#### Firebase: refresh without entering the password

Optionally store the login response's refresh token in an environment variable
such as `ownerRefreshToken`, then call:

`POST https://securetoken.googleapis.com/v1/token?key={{firebaseApiKey}}`

Body type: `x-www-form-urlencoded`

```text
grant_type=refresh_token
refresh_token={{ownerRefreshToken}}
```

The refresh response uses snake case:

```javascript
const json = pm.response.json();
pm.environment.set("ownerToken", json.id_token);
pm.environment.set("ownerRefreshToken", json.refresh_token);
```

#### Apply authorization in Postman

At the collection or protected-folder level:

1. Open **Authorization**.
2. Select **Bearer Token**.
3. Enter `{{ownerToken}}`, `{{seekerToken}}`, or `{{adminToken}}`.
4. Let individual requests inherit authorization.

The header sent to GhorBari must be:

```http
Authorization: Bearer {{ownerToken}}
```

A `401 {"message":"Unauthorized"}` means the header is absent. A
`403 {"message":"Invalid token"}` means Firebase rejected the supplied token.

For protected requests use:

```http
Authorization: Bearer {{ownerToken}}
Content-Type: application/json
```

Replace `ownerToken` with `seekerToken` or `adminToken` according to the table.

### Generic Postman tests

Add this at collection level:

```javascript
pm.test("Response time is below 5 seconds", () => {
  pm.expect(pm.response.responseTime).to.be.below(5000);
});

pm.test("No unexpected server error", () => {
  pm.expect(pm.response.code).to.not.equal(500);
});
```

For a normal JSON success request add:

```javascript
pm.test("Success status", () => {
  pm.expect(pm.response.code).to.be.oneOf([200, 201]);
});

pm.test("JSON response", () => {
  pm.response.to.be.json;
});
```

IDs can be captured using a request-specific script such as:

```javascript
const json = pm.response.json();
pm.environment.set("propertyId", json.propertyId || json._id);
```

Field values containing IDs, timestamps, AI text, database counts, or URLs are
dynamic. Expected responses below show the contract/shape rather than literal
values.

## 4. Reusable dummy data

### User A (initial property owner)

```json
{
  "email": "owner.qa@example.com",
  "name": "QA User A",
  "phone": "01711111111",
  "profileImage": "https://example.com/owner.png",
  "role": "user"
}
```

### User B (initial applicant/seeker)

```json
{
  "email": "seeker.qa@example.com",
  "name": "QA User B",
  "phone": "01822222222",
  "profileImage": "https://example.com/seeker.png",
  "role": "user"
}
```

### Administrator

```json
{
  "email": "admin.qa@example.com",
  "name": "QA Administrator",
  "phone": "01933333333",
  "role": "user"
}
```

After creating this profile, promote it to `role:"admin"` directly through an
authorized seed/admin process or the test database. Do not depend on public
registration to grant admin privileges.

### Flat property

```json
{
  "title": "QA Test Flat in Dhanmondi",
  "listingType": "rent",
  "propertyType": "flat",
  "price": 30000,
  "areaSqFt": 1250,
  "roomCount": 3,
  "bathrooms": 2,
  "address": {
    "division_name": "Dhaka",
    "district_name": "Dhaka",
    "upazila_name": "Dhanmondi",
    "street": "Road 7A, House 12"
  },
  "location": {
    "lat": 23.7465,
    "lng": 90.3760
  },
  "overview": "QA-only listing for controlled API testing.",
  "images": [
    "https://images.example.com/qa-flat-1.jpg"
  ],
  "amenities": [
    "Lift",
    "Generator",
    "Parking"
  ]
}
```

### Building property

Use this to obtain `propertyId2`:

```json
{
  "title": "QA Test Building in Uttara",
  "listingType": "sale",
  "propertyType": "building",
  "price": 25000000,
  "areaSqFt": 5000,
  "floorCount": 5,
  "totalUnits": 10,
  "address": {
    "division_name": "Dhaka",
    "district_name": "Dhaka",
    "upazila_name": "Uttara",
    "street": "Sector 10, Road 4"
  },
  "location": {
    "lat": 23.8759,
    "lng": 90.3795
  },
  "overview": "QA-only building listing.",
  "images": [],
  "amenities": ["Parking", "Security"]
}
```

## 5. Recommended execution order

Use a disposable database or clearly identifiable QA records.

1. Server check and public statistics.
2. Create/login Firebase credentials and save all three bearer tokens.
3. Register User A, User B, and administrator database profiles as `user`.
4. Promote only the administrator profile to `admin` in the test database.
5. Profile, NID, and user lookup tests.
6. Create two properties as User A.
7. If a property is created as `pending`, approve it as admin.
8. Read/list/visibility tests.
9. Create an application as User B.
10. Test application messaging and User A's counter-offer.
11. Either revise the offer or accept User A's counter.
12. Create a chat from the accepted application and test messages.
13. Complete the deal.
14. Test ratings.
15. Test wishlist and comparisons with another active property.
16. Test AI.
17. Test listing drafts/payments only in the SSLCommerz sandbox.
18. Run destructive delete tests last.

Do not run mutually exclusive branches on the same record. For example,
withdrawing an application prevents accepting it later. Create a separate
application/property for each destructive or alternate-state test.

## 6. Common expected errors

| Condition | Expected |
|---|---|
| Missing `Authorization` | `401 {"message":"Unauthorized"}` |
| Invalid/expired Firebase token | `403 {"message":"Invalid token"}` |
| Authenticated non-admin on `/admin/*` | `403`, admins-only message |
| Authenticated wrong property owner | `403` |
| Invalid MongoDB ObjectId | usually `400` |
| Valid but nonexistent ObjectId | usually `404` |
| Invalid/missing body data | `400` |
| Unhandled database/service failure | `500` |

Authorization note: protected controllers identify the caller from the verified
Firebase token. Merely changing an email in a JSON body must not impersonate
another user.

---

## 7. Server and public APIs (3)

### 7.1 Server check

`GET {{baseUrl}}/` — public

Expected `200`, text response confirming the GhorBari server is running.

### 7.2 Featured properties

`GET {{baseUrl}}/featured-properties?limit=8` — public

Expected `200` and an array of active enriched properties. `limit` defaults to
8. Empty database result: `[]`.

### 7.3 Public statistics

`GET {{baseUrl}}/public/stats` — public

Expected `200`:

```json
{
  "activeListings": 0,
  "successfulDeals": 0,
  "verifiedUsers": 0,
  "totalProperties": 0
}
```

Counts depend on database contents.

---

## 8. User and notification APIs (13)

### 8.1 Register user

`POST {{baseUrl}}/register-user` — public

Body: use one of the user payloads in section 4.

Expected `201`:

```json
{
  "message": "User created successfully",
  "user": "<inserted MongoDB ID>"
}
```

Negative cases: missing `email`/`name` → `400`; duplicate email → `400`.

**Security finding:** the current public controller accepts `role:"admin"` from
the request body. A client can therefore create an administrator database
profile if the email is not already registered. Expected secure behavior is to
ignore client-supplied privileged roles and always create `role:"user"`;
include this in the security test report.

### 8.2 Check whether a user exists

`GET {{baseUrl}}/check-user-exist?email={{ownerEmail}}` — public

Expected `200`: `{"exists":true}`. Missing email → `400`.

### 8.3 Get a user role

`GET {{baseUrl}}/get-user-role?email={{ownerEmail}}` — public

Expected `200`: `{"role":"user"}`. Unknown/missing email returns
`{"role":null}`.

### 8.4 Batch-fetch users

`GET {{baseUrl}}/users-by-emails?emails={{ownerEmail}},{{seekerEmail}}`
— owner/seeker token

Expected `200`: array of matching public user records. Missing `emails` → `400`.

### 8.5 Update own profile

`PATCH {{baseUrl}}/update-profile` — owner token

```json
{
  "name": "QA User A Updated",
  "phone": "01711111112",
  "profileImage": "https://example.com/owner-updated.png"
}
```

Expected `200`:

```json
{"success":true,"modifiedCount":1}
```

### 8.6 Submit NID

`POST {{baseUrl}}/submit-nid` — owner token

```json
{
  "nidNumber": "1234567890",
  "nidImages": [
    "https://images.example.com/nid-front.jpg",
    "https://images.example.com/nid-back.jpg"
  ]
}
```

Expected `200`:

```json
{"success":true,"message":"NID submitted for review"}
```

NID must contain exactly 10 or 16 digits, and the MongoDB profile must already
have a nonblank phone number. The submission controller does not check NID
uniqueness. Use only designated dummy registry data in shared environments.

### 8.7 Get own profile

`GET {{baseUrl}}/user-profile` — any user token

Expected `200`: the authenticated user's database profile.

### 8.8 Get notifications

`GET {{baseUrl}}/notifications` — any user token

Expected `200`:

```json
{
  "notifications": [],
  "unreadCount": 0
}
```

Capture an ID when present:

```javascript
const json = pm.response.json();
if (json.notifications?.length) {
  pm.environment.set("notificationId", json.notifications[0].id);
}
```

### 8.9 Mark all notifications read

`PATCH {{baseUrl}}/notifications/read-all` — any user token

Expected `200`:

```json
{"success":true,"modifiedCount":0}
```

### 8.10 Mark one notification read

`PATCH {{baseUrl}}/notifications/{{notificationId}}/read` — matching user token

Expected `200`: `{"success":true}`. Invalid ID → `400`; missing/not-owned
notification → `404`.

### 8.11 Check admin status

`GET {{baseUrl}}/users/admin/{{adminEmail}}` — admin token

Expected `200`: `{"admin":true}`. The token email must match the path email;
otherwise expect `403`.

### 8.12 Public-profile message status

`GET {{baseUrl}}/public-profile/{{ownerEmail}}/message-status` — seeker token

Expected `200` with booleans/status indicating whether the caller may message
the target and whether they have an eligible application/conversation. Exact
values depend on the relationship state. Testing one's own email returns a
non-messageable result.

### 8.13 Public profile

`GET {{baseUrl}}/public-profile/{{ownerEmail}}` — any user token

Expected `200`: projected MongoDB profile data containing `name`, `email`,
`profileImage`, `role`, `rating`, `createdAt`, `nidVerified`, and `phone`.
Unknown email → `404`. The current response exposes the phone number to any
authenticated user.

---

## 9. Property APIs (9 protected; featured properties was counted separately)

### 9.1 Create property

`POST {{baseUrl}}/post-property` — owner token

Body: flat or building payload from section 4.

Free listing expected `201`:

```json
{
  "success": true,
  "mode": "free_listing",
  "id": "<MongoDB ObjectId>",
  "entitlement": {}
}
```

When payment is required, expected `200` instead:

```json
{
  "success": true,
  "mode": "payment_required",
  "requiresPayment": true,
  "amount": 99,
  "currency": "BDT",
  "draftId": "<MongoDB ObjectId>",
  "redirectUrl": "<SSLCommerz gateway URL>",
  "entitlement": {}
}
```

Capture both outcomes:

```javascript
const json = pm.response.json();
if (json.id || json.propertyId || json.property?._id) {
  pm.environment.set("propertyId", json.id || json.propertyId || json.property._id);
}
if (json.draftId) pm.environment.set("draftId", json.draftId);
```

Owner name/email/UID come from the token and must not be trusted from the body.
There is currently no request-validation middleware on this endpoint. The
controller defaults an omitted `status` to `active`, but also accepts a
client-supplied `status` unchanged. Include empty/malformed payloads and a
forged status in the negative/security run; accepting an arbitrary lifecycle
status is a backend defect.

### 9.2 Listing entitlement

`GET {{baseUrl}}/listing-entitlement` — owner token

Expected `200` with `success:true` and free/paid listing entitlement fields.

### 9.3 Get own properties

`GET {{baseUrl}}/my-properties?email={{ownerEmail}}` — owner token

Expected `200`: array of the owner's properties, enriched with application
counts. Query email must match token email; mismatch → `403`.

### 9.4 Get property by ID

`GET {{baseUrl}}/property/{{propertyId}}` — any valid token

Expected `200`: property object. Invalid ID → `400`; missing property → `404`.

### 9.5 Get active properties

`GET {{baseUrl}}/active-properties` — any valid token

Expected `200`: array containing only `status:"active"` properties.

### 9.6 Update owned property

`PUT {{baseUrl}}/property/{{propertyId}}` — owner token

Example:

```json
{
  "price": 32000,
  "areaSqFt": 1250,
  "overview": "Updated during Postman QA.",
  "location": {"lat": 23.7465, "lng": 90.376},
  "images": [],
  "amenities": ["Lift", "Parking"],
  "roomCount": 3,
  "bathrooms": 2
}
```

Expected `200`:

```json
{"success":true,"message":"Property updated successfully"}
```

The property cannot be edited during or after a completed deal. The controller
updates price, area, images, overview, amenities, location, and type-specific
room/floor fields. It ignores submitted `title`, `address`, `listingType`, and
`propertyType`.

### 9.7 Toggle visibility

`PATCH {{baseUrl}}/property/{{propertyId}}/visibility` — owner token, no body

Expected `200`:

```json
{
  "success": true,
  "message": "Property hidden successfully",
  "status": "hidden"
}
```

Run again to restore `active`. Only allowed from supported active/hidden/deal
states.

### 9.8 Reopen rented listing

`PATCH {{baseUrl}}/property/{{propertyId}}/reopen` — owner token, no body

Expected `200` only when the property is currently `rented`:

```json
{
  "success": true,
  "message": "Listing reopened successfully. Your property is now active and visible on the marketplace.",
  "status": "active"
}
```

Sold properties cannot be reopened.

### 9.9 Delete owned property

`DELETE {{baseUrl}}/property/{{propertyId}}` — owner token

Expected `200`:

```json
{"success":true,"message":"Property deleted successfully"}
```

Run last. Properties with active applications or active/completed deal states
cannot be deleted.

---

## 10. Application and deal APIs (9)

### 10.1 Create application

`POST {{baseUrl}}/application` — seeker token

```json
{
  "propertyId": "{{propertyId}}",
  "proposedPrice": 27000,
  "message": "I would like to rent this property from next month."
}
```

Expected `201`:

```json
{
  "success": true,
  "id": "<application ID>",
  "message": "Application submitted successfully"
}
```

Capture:

```javascript
const json = pm.response.json();
pm.environment.set("applicationId", json.id || json.insertedId || json.applicationId || json._id);
```

The property must be active; the seeker cannot own it; offer must be positive
and cannot exceed listing price; duplicate active applications are rejected.

### 10.2 Get seeker's applications

`GET {{baseUrl}}/my-applications?email={{seekerEmail}}` — seeker token

Expected `200`: array of applications enriched with property information.

Security note: the route verifies a Firebase token but does not verify that the
`email` query belongs to that token. Any authenticated account can currently
request another user's applications by changing this query value.

### 10.3 Get applications for owned property

`GET {{baseUrl}}/property/{{propertyId}}/applications` — owner token

Expected `200`: array of applications. Non-owner → `403`.

### 10.4 Owner updates application status

`PATCH {{baseUrl}}/application/{{applicationId}}` — owner token

Reject:

```json
{"status":"rejected","message":"QA rejection reason"}
```

Counter:

```json
{
  "status": "counter",
  "proposedPrice": 29000,
  "message": "The lowest acceptable rent is BDT 29,000."
}
```

Accept a pending offer:

```json
{"status":"deal-in-progress","message":"Offer accepted"}
```

Expected `200`:

```json
{
  "success": true,
  "message": "Application counter successfully"
}
```

Allowed statuses are `deal-in-progress`, `rejected`, and `counter`. Counter
price must lie within the controller's current offer/list-price bounds.

### 10.5 Withdraw application

`PATCH {{baseUrl}}/application/{{applicationId}}/withdraw` — seeker token

Expected `200`:

```json
{"success":true,"message":"Application withdrawn successfully"}
```

Only pending/counter applications can be withdrawn.

### 10.6 Revise after owner counter

`PATCH {{baseUrl}}/application/{{applicationId}}/revise` — seeker token

```json
{
  "proposedPrice": 28000,
  "message": "My revised offer is BDT 28,000."
}
```

Expected `200`:

```json
{"success":true,"message":"Offer revised successfully"}
```

Only a countered application can be revised, and the revised amount must lie
between the prior seeker offer and owner counter.

### 10.7 Accept owner counter

`PATCH {{baseUrl}}/application/{{applicationId}}/accept-counter` — seeker token

No body. Expected `200`:

```json
{
  "success": true,
  "message": "Counter offer accepted successfully! Deal is now in progress."
}
```

### 10.8 Application message

`POST {{baseUrl}}/application/{{applicationId}}/message` — owner or seeker token

```json
{"text":"Can we schedule a visit on Friday?"}
```

Expected `200`:

```json
{"success":true,"message":"Message sent successfully","messageData":{}}
```

Only application participants may send messages.

### 10.9 Complete or cancel deal

`PATCH {{baseUrl}}/property/{{propertyId}}/deal` — owner or accepted seeker token

```json
{"dealStatus":"completed"}
```

or:

```json
{"dealStatus":"cancelled"}
```

Expected `200`:

```json
{
  "success": true,
  "message": "Deal completed successfully",
  "propertyId": "<property ObjectId>",
  "applicationId": "<application ObjectId>"
}
```

Completion changes a sale property to `sold` and a rental property to `rented`.
Cancellation restores the property's previous state. Only parties to the active
proposal may call this endpoint.

---

## 11. Chat APIs (8)

### 11.1 Create/get ordinary conversation

`POST {{baseUrl}}/create-conversation` — seeker token

```json
{
  "otherUserEmail": "{{ownerEmail}}",
  "propertyId": "{{propertyId}}"
}
```

Expected `200`:

```json
{"message":"Conversation created or retrieved","conversation":{}}
```

Direct conversation creation is subject to the application's messaging rules.
Self-conversation is rejected.

### 11.2 Create conversation from accepted application

`POST {{baseUrl}}/create-conversation-from-application` — owner or seeker token

```json
{"applicationId":"{{applicationId}}"}
```

Expected `200`:

```json
{"message":"Conversation created or retrieved","conversation":{}}
```

Requires a deal-in-progress application and caller participation.

Capture:

```javascript
const json = pm.response.json();
pm.environment.set("conversationId", json.conversation?._id || json.conversationId);
```

### 11.3 List conversations

`GET {{baseUrl}}/conversations` — any user token

Expected `200`:

```json
{"conversations":[]}
```

### 11.4 Get conversation messages

`GET {{baseUrl}}/conversations/{{conversationId}}/messages?skip=0&limit=50`
— participant token

Expected `200`:

```json
{"message":"Messages retrieved","messages":[],"total":0}
```

### 11.5 Send message

`POST {{baseUrl}}/send-message` — participant token

```json
{
  "conversationId": "{{conversationId}}",
  "content": "Hello from the Postman QA run.",
  "attachments": []
}
```

Expected `201`:

```json
{"message":"Message sent","data":{}}
```

Either nonblank content or at least one attachment is required.

Capture:

```javascript
const json = pm.response.json();
pm.environment.set("messageId", json.data?._id || json.message?._id || json._id);
```

### 11.6 Unread count

`GET {{baseUrl}}/unread-count` — any user token

Expected `200`: `{"unreadCount":0}` or the current dynamic count.

### 11.7 Delete own message

`DELETE {{baseUrl}}/message/{{messageId}}` — message sender token

Expected `200`: `{"message":"Message deleted"}`. Another participant → `403`.

**Known implementation issue:** messages are stored with MongoDB ObjectId `_id`
values, but this controller first searches using the raw string path value.
Consequently a normal Postman ObjectId string currently returns
`404 {"message":"Message not found"}` before deletion. Report this as a defect;
the intended response is the `200` contract above.

### 11.8 Delete conversation

`DELETE {{baseUrl}}/conversation/{{conversationId}}` — participant token

Expected `200`: `{"message":"Conversation deleted"}`. Run last.

---

## 12. Comparison APIs (10)

### 12.1 Create comparison

`POST {{baseUrl}}/create-comparison` — seeker token

```json
{
  "propertyIds": ["{{propertyId}}", "{{propertyId2}}"],
  "title": "QA Dhaka Property Comparison",
  "isPublic": false
}
```

Expected `201`:

```json
{"message":"Comparison created successfully","comparison":{}}
```

One to ten existing properties are allowed.

Capture:

```javascript
const json = pm.response.json();
pm.environment.set("comparisonId", json.comparison?._id || json.comparisonId);
```

### 12.2 Get owned comparison

`GET {{baseUrl}}/comparison/{{comparisonId}}` — creator token

Expected `200`: `{"comparison":{}}`. Non-owner private access → `403`.

### 12.3 Get public comparison by share link

`GET {{baseUrl}}/comparison/share/{{shareLink}}` — public

Expected `200`: `{"comparison":{}}`. Private/expired/unknown → `404`.

**Known implementation issue found during this audit:** this public route has no
authentication middleware, but its controller reads `req.db`, which is only
attached by the token middleware. In the current code it is therefore expected
to return `500 {"message":"Server error"}` even for a valid share link. Record
that as a backend defect; the intended response is the `200` contract above.

The comparison enrichment model also projects a top-level property
`ownerEmail`, while current property documents store `owner.email`. Owner
details may therefore appear as `Unknown` even after the database injection
issue is corrected.

### 12.4 List own comparisons

`GET {{baseUrl}}/user-comparisons` — creator token

Expected `200`: `{"comparisons":[]}`.

### 12.5 Update comparison

`PUT {{baseUrl}}/comparison/{{comparisonId}}` — creator token

```json
{
  "title": "Updated QA Comparison",
  "isPublic": false,
  "propertyIds": ["{{propertyId}}", "{{propertyId2}}"]
}
```

Expected `200`: `{"message":"Comparison updated","comparison":{}}`.

### 12.6 Add property

`POST {{baseUrl}}/comparison/{{comparisonId}}/add-property` — creator token

```json
{"propertyId":"{{propertyId2}}"}
```

Expected `200`: `{"message":"Property added to comparison","comparison":{}}`.
Duplicate or more than ten → `400`.

### 12.7 Remove property

`DELETE {{baseUrl}}/comparison/{{comparisonId}}/property/{{propertyId2}}`
— creator token

Expected `200`: `{"message":"Property removed from comparison","comparison":{}}`.

### 12.8 Share comparison

`POST {{baseUrl}}/comparison/{{comparisonId}}/share` — creator token

Expected `200`:

```json
{
  "message": "Comparison is now public",
  "comparison": {},
  "shareLink": "/comparison/share/<dynamic share token>"
}
```

Capture:

```javascript
const json = pm.response.json();
pm.environment.set("shareLink", json.shareLink.split("/").pop());
```

### 12.9 Make comparison private

`POST {{baseUrl}}/comparison/{{comparisonId}}/private` — creator token

Expected `200`: `{"message":"Comparison is now private","comparison":{}}`.

### 12.10 Delete comparison

`DELETE {{baseUrl}}/comparison/{{comparisonId}}` — creator token

Expected `200`: `{"message":"Comparison deleted"}`. Run last.

---

## 13. Wishlist APIs (4)

All requests use the seeker token.

### 13.1 List wishlist

`GET {{baseUrl}}/user-wishlist`

Expected `200`: array of wishlist items enriched with property data.

### 13.2 Add

`POST {{baseUrl}}/wishlist/add`

```json
{
  "propertyId": "{{propertyId}}",
  "note": "Visit this property on Friday."
}
```

Expected `200`: `{"message":"Added to wishlist"}`.

### 13.3 Update note

`PATCH {{baseUrl}}/wishlist/{{propertyId}}`

```json
{"note":"Updated QA wishlist note."}
```

Expected `200`: `{"message":"Note updated"}`.

### 13.4 Remove

`DELETE {{baseUrl}}/wishlist/{{propertyId}}`

Expected `200`: `{"message":"Removed from wishlist"}`.

---

## 14. Rating APIs (3)

The current controller permits ratings when the application is either
`completed` **or `cancelled`**. Use owner/seeker tokens according to which party
is rating the other. Permitting cancelled deals is current behavior and should
be confirmed as a product requirement.

### 14.1 Can-rate status

`GET {{baseUrl}}/ratings/can-rate/{{applicationId}}` — deal participant

Expected `200`:

```json
{
  "success": true,
  "canRate": true,
  "alreadyRated": false,
  "counterpartyEmail": "owner.qa@example.com",
  "applicationStatus": "completed",
  "existingRating": null
}
```

Values depend on deal state and caller.

### 14.2 Submit rating

`POST {{baseUrl}}/ratings` — deal participant

```json
{
  "applicationId": "{{applicationId}}",
  "score": 5,
  "review": "Responsive and professional during the QA transaction."
}
```

Expected `200`:

```json
{"message":"Rating submitted successfully","rating":{}}
```

Score must be 1–5. Caller must be a deal participant and cannot rate themselves.
The rating model performs an upsert, so repeating the same directional rating
updates it rather than necessarily returning a duplicate error.

### 14.3 Received ratings

`GET {{baseUrl}}/ratings/received/{{ownerEmail}}?skip=0&limit=10`
— any valid token

Expected `200`:

```json
{
  "success": true,
  "total": 0,
  "skip": 0,
  "limit": 10,
  "aggregate": {
    "average": 0,
    "count": 0
  },
  "ratings": []
}
```

Maximum `limit` is 50.

---

## 15. AI APIs (3)

All AI requests require a valid token and configured AI services. AI wording is
nondeterministic; assert schema and constraints, not exact prose.

### 15.1 AI chat

`POST {{baseUrl}}/api/ai/send-message` — seeker token

```json
{
  "message": "Find an active flat in Dhaka under BDT 35000.",
  "conversationHistory": []
}
```

Expected `200` with a textual answer and, when applicable, a
`matchedProperties` array. Blank message → `400`. Provider rate limiting may
return `429`; unavailable provider may return `503`.

### 15.2 Generate property description

`POST {{baseUrl}}/api/ai/generate-property-description` — owner token

```json
{
  "title": "Modern QA Flat",
  "listingType": "rent",
  "propertyType": "flat",
  "price": 30000,
  "areaSqFt": 1250,
  "roomCount": 3,
  "bathrooms": 2,
  "divisionName": "Dhaka",
  "districtName": "Dhaka",
  "upazilaName": "Dhanmondi",
  "address": "Road 7A, House 12",
  "amenities": ["Lift", "Parking"]
}
```

Expected `200`: `{"description":"<90–140 word paragraph>"}`. Required location,
price, area, and type-specific fields are validated.

Suggested Postman checks:

```javascript
const json = pm.response.json();
pm.expect(json.description).to.be.a("string").and.not.empty;
pm.expect(json.description.trim().split(/\s+/).length).to.be.within(80, 150);
```

### 15.3 Estimate property price

`POST {{baseUrl}}/api/ai/estimate-property-price` — owner token

```json
{
  "listingType": "rent",
  "propertyType": "flat",
  "areaSqFt": 1250,
  "roomCount": 3,
  "bathrooms": 2,
  "amenities": ["Lift", "Parking"],
  "divisionName": "Dhaka",
  "districtName": "Dhaka",
  "upazilaName": "Dhanmondi",
  "address": "Road 7A, House 12"
}
```

Expected `200` with appraisal/estimate data. Invalid appraisal input → `400`.

---

## 16. Admin APIs (13)

Every route below requires `Authorization: Bearer {{adminToken}}`.

### 16.1 Pending NID verifications

`GET {{baseUrl}}/admin/pending-verifications`

Expected `200`: array of users with pending verification.

### 16.2 Manually approve/reject NID

`PATCH {{baseUrl}}/admin/verify-user/{{ownerUserId}}`

```json
{"action":"approve"}
```

or `{"action":"reject"}`. Expected `200`: MongoDB update result. Only pending
requests can be processed.

### 16.3 Verify using dummy NID registry

`PATCH {{baseUrl}}/admin/verify-user-nid/{{ownerUserId}}`

No body. Expected `200`:

```json
{
  "success": true,
  "message": "<verification result>",
  "nidVerified": true
}
```

This depends on the configured dummy NID registry and its records.

### 16.4 Pending properties

`GET {{baseUrl}}/admin/pending-properties`

Expected `200`: array of `status:"pending"` properties.

### 16.5 Update property status

`PATCH {{baseUrl}}/admin/property-status/{{propertyId}}`

```json
{"status":"active"}
```

Allowed administrator statuses: `active`, `rejected`, or `removed`. Expected
`200`: MongoDB update result.

### 16.6 Permanently delete property

`DELETE {{baseUrl}}/admin/delete-property/{{propertyId}}`

Expected `200`: MongoDB delete result. Active deal/application constraints can
return `400`. Destructive—run last.

### 16.7 Basic dashboard stats

`GET {{baseUrl}}/admin/stats`

Expected `200` with user/property totals and active/rented/sold counts.

### 16.8 Dashboard insights

`GET {{baseUrl}}/admin/dashboard-insights?period=daily`

`period` may be `daily`, `weekly`, or `monthly`; invalid values default to
`daily`. Expected `200` with the selected period, summary counts, trend/series,
and recent activity data.

### 16.9 Revenue insights

`GET {{baseUrl}}/admin/revenue-insights?period=monthly`

Expected `200` with payment revenue summary, trend data, and recent payment
records. Values depend on validated/paid payments.

### 16.10 Get any property as admin

`GET {{baseUrl}}/admin/property/{{propertyId}}`

Expected `200`: property regardless of status. Invalid ID → `400`; absent → `404`.

### 16.11 All users

`GET {{baseUrl}}/admin/all-users`

Expected `200`: user array enriched with each user's property count. Use IDs
from this response to populate `ownerUserId` and `seekerUserId`.

### 16.12 All properties

`GET {{baseUrl}}/admin/all-properties`

Expected `200`: enriched array of properties in all statuses.

### 16.13 Delete user

`DELETE {{baseUrl}}/admin/delete-user/{{seekerUserId}}`

Expected `200`: MongoDB delete result. This deletes the database user record,
not necessarily the Firebase Authentication account. Destructive—run last.

---

## 17. Payment APIs (7)

Use SSLCommerz sandbox credentials. Never simulate a successful payment in a
production database. Gateway success and IPN handlers validate transactions;
invented success payloads should fail validation.

### 17.1 Get one listing draft

`GET {{baseUrl}}/api/payments/listing-drafts/{{draftId}}/status`
— owner token

Expected `200`:

```json
{
  "success": true,
  "draftId": "<ID>",
  "draftStatus": "payment_pending",
  "propertyId": null,
  "paymentStatus": "pending",
  "amount": 0,
  "canRetryPayment": true
}
```

Only the draft owner can access it. Invalid ID → `400`; absent → `404`.

### 17.2 List owner's drafts

`GET {{baseUrl}}/api/payments/listing-drafts` — owner token

Expected `200`: `{"success":true,"drafts":[]}`.

### 17.3 Retry failed/pending listing payment

`POST {{baseUrl}}/api/payments/listing-drafts/{{draftId}}/retry`
— owner token

No body. Expected `200`:

```json
{
  "success": true,
  "requiresPayment": true,
  "redirectUrl": "<SSLCommerz URL>",
  "draftId": "<ID>"
}
```

The profile needs a phone number. Missing draft/payment and gateway failures
produce `400`, `404`, or `502` as appropriate.

### 17.4 SSLCommerz success callback

`POST {{baseUrl}}/api/payments/sslcommerz/success`

Gateway form/query payload; endpoint also accepts other HTTP methods because it
is registered with `router.all`. A genuinely validated transaction redirects
(`302`) to the frontend success URL. Validation failure redirects to the
frontend failed URL.

### 17.5 SSLCommerz failure callback

`POST {{baseUrl}}/api/payments/sslcommerz/fail?draftId={{draftId}}`

Example sandbox-shaped form body:

```text
tran_id=QA_TRANSACTION_ID
status=FAILED
```

Expected redirect (`302`) to the frontend failed URL and corresponding draft or
payment state update when identifiers match.

### 17.6 SSLCommerz cancellation callback

`POST {{baseUrl}}/api/payments/sslcommerz/cancel?draftId={{draftId}}`

Expected redirect (`302`) to the frontend cancelled URL.

### 17.7 SSLCommerz IPN

`POST {{baseUrl}}/api/payments/sslcommerz/ipn`

Send the actual sandbox IPN form payload. Expected `200` text `IPN processed`
after gateway validation; invalid/fabricated payload → `400` text `IPN failed`.

In Postman, disable “Automatically follow redirects” when verifying callback
status and `Location` headers.

---

## 18. Internal API (1)

### Process pending email jobs

`POST {{baseUrl}}/internal/process-email-jobs`

Header:

```http
x-internal-cron-secret: {{internalCronSecret}}
```

Expected `200`:

```json
{
  "success": true,
  "processed": 0,
  "sent": 0,
  "failed": 0
}
```

The additional counters depend on the processor result. Missing/wrong secret →
`403 {"message":"Forbidden"}`. This endpoint can send real email; use test
addresses/provider configuration.

---

## 19. Socket.IO events (non-REST)

The backend also exposes Socket.IO on the same server. These are outside the 83
HTTP routes:

| Direction | Event | Payload |
|---|---|---|
| client → server | `chat:join` | conversation ID |
| server → client | `chat:joined` | `{conversationId}` |
| client → server | `chat:leave` | conversation ID |
| client → server | `message:send` | conversation/message data |
| server → client | `message:received` | message data |
| server → client | `message:error` | `{error}` |
| client → server | `typing:start` | conversation ID |
| client → server | `typing:stop` | conversation ID |
| server → client | `typing:active` | typing state |
| client → server | `message:markRead` | conversation ID |
| server → client | `message:read` | `{conversationId}` |
| client → server | `users:getOnline` | none |
| server → client | `users:online` | online-user list |

Use a Postman Socket.IO request (not a WebSocket-only REST request), connect to
`{{baseUrl}}`, and send this authentication object:

```json
{
  "token": "{{seekerToken}}",
  "userEmail": "{{seekerEmail}}"
}
```

Current security caveat: the Socket.IO middleware checks that both values exist
but does not verify the Firebase token or confirm that `userEmail` belongs to
it. Treat successful email impersonation as a confirmed backend vulnerability.

## 20. Minimum negative/security suite

Run these deliberately:

1. Every protected route without a token → `401`.
2. A protected route with `Bearer invalid` → `403`.
3. Every admin route with seeker token → `403`.
4. Owner-only property mutation with seeker token → `403`.
5. Private comparison access from another user → `403`.
6. Conversation/message access from a nonparticipant → `403`.
7. Application action by a nonparticipant → `403`.
8. Internal route without/wrong secret → `403`.
9. Invalid ObjectId (`not-an-id`) where accepted → `400`, never `500`.
10. Valid nonexistent ObjectId (`000000000000000000000000`) → `404`.
11. Empty required body fields → `400`.
12. Duplicate registration/application → controlled `400`; repeated ratings
    currently update via upsert.
13. Offer above listing price and invalid counter ranges → `400`.
14. Rating while application is not `completed` or `cancelled` → `400`.
15. Fabricated SSLCommerz success/IPN → must not publish a property.
16. Public registration with `role:"admin"` → currently succeeds and must be
    reported as a privilege-escalation vulnerability.
17. Public registration for an email with no Firebase account → currently
    creates an orphan MongoDB profile; report as a data-integrity weakness.
18. Property creation with an empty body or forged lifecycle `status` → verify
    whether malformed/arbitrary-state records are created and report them.

Any authorization bypass, unexpected `500`, stack trace, secret, Firebase
credential, or internal database detail in a response is a defect.

## 21. Test-run reporting template

Record each run in this format:

```text
Environment:
Backend commit:
Tester:
Date/time:
MongoDB dataset:

Total requests:
Passed:
Failed:
Blocked:

Failure:
- Request name:
- Method/URL:
- Account/role:
- Prerequisite state:
- Request body (secrets removed):
- Expected status/body:
- Actual status/body:
- Reproduction steps:
- Postman console/network evidence:
```

## 22. Coverage checklist

- [ ] 3 server/public routes
- [ ] 13 user/notification routes
- [ ] 9 remaining protected property routes
- [ ] 9 application/deal routes
- [ ] 8 chat routes
- [ ] 10 comparison routes
- [ ] 4 wishlist routes
- [ ] 3 rating routes
- [ ] 3 AI routes
- [ ] 13 admin routes
- [ ] 7 payment routes
- [ ] 1 internal route
- [ ] Authentication/authorization negative suite
- [ ] Socket.IO events, if real-time testing is in scope

HTTP total: **83**.
