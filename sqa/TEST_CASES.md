# Ghor Bari SQA Test Cases

Execution date: 2026-07-19  
Environment: Node.js 24.8.0, Windows, repository test environment

| ID | Area | Test | Type | Result | Evidence / Jira |
|---|---|---|---|---|---|
| UT-01 | Chat | Preserve text within preview limit | Unit | Pass | `client/test/chatHelpers.test.js` |
| UT-02 | Chat | Truncate long preview text | Unit | Pass | `client/test/chatHelpers.test.js` |
| UT-03 | Chat | Generate initials from user name | Unit | Pass | `client/test/chatHelpers.test.js` |
| UT-04 | Chat | Show timestamp after configured interval | Unit | Pass | `client/test/chatHelpers.test.js` |
| UT-05 | Chat | Show timestamp when sender changes | Unit | Pass | `client/test/chatHelpers.test.js` |
| UT-06 | Chat | Detect online user | Unit | Pass | `client/test/chatHelpers.test.js` |
| UT-07 | Authentication | Map Firebase error code | Unit | Pass | `client/test/firebaseAuthErrorMessage.test.js` |
| UT-08 | Authentication | Map nested API authentication error | Unit | Pass | `client/test/firebaseAuthErrorMessage.test.js` |
| UT-09 | Authentication | Use safe fallback message | Unit | Pass | `client/test/firebaseAuthErrorMessage.test.js` |
| UT-10 | Application | Normalize legacy accepted status | Unit | Pass | `client/test/statusDisplay.test.js` |
| UT-11 | Application | Display completed sale as bought | Unit | Pass | `client/test/statusDisplay.test.js` |
| UT-12 | Application | Display completed rental correctly | Unit | Pass | `client/test/statusDisplay.test.js` |
| UT-13 | Application | Handle inconsistent deal state | Unit | Pass | `client/test/statusDisplay.test.js` |
| UT-14 | AI description | Accept valid flat payload | Unit | Pass | `backend/test/propertyDescriptionPromptService.test.js` |
| UT-15 | AI description | Accept valid building payload | Unit | Pass | Same suite |
| UT-16 | Validation | Reject missing property text fields | Unit | Pass | Same suite |
| UT-17 | Validation | Reject invalid price and area | Unit | Pass | Same suite |
| UT-18 | Validation | Reject invalid room/bathroom counts | Unit | Pass | Same suite |
| UT-19 | Validation | Reject invalid building dimensions | Unit | Pass | Same suite |
| UT-20 | Authorization | Allow matching property owner | Unit | Pass | `backend/test/verifyOwner.test.js` |
| UT-21 | Authorization | Reject mismatched property owner | Unit | Pass | Same suite |
| UT-22 | Chat DB | Normalize participant-pair key | Unit | Pass | `backend/test/chatModel.test.js` |
| UT-23 | Chat DB | Reject malformed Mongo identifiers | Unit | Pass | Same suite |
| UT-24 | Chat DB | Create conversation metadata | Unit | Pass | Same suite |
| UT-25 | Chat DB | Create message defaults | Unit | Pass | Same suite |
| UT-26 | Chat DB | Mark only other-user messages read | Unit | Pass | Same suite |
| UT-27 | Registration | Assign safe public-registration role | Unit | Pass | `backend/test/registrationPolicyService.test.js`, GHOR-1 Done |
| UT-28 | Registration | Ignore malicious caller-supplied admin role | Unit | Pass | Same suite |
| UT-29 | Property | Prevent cross-owner property retrieval | Security review | Fail | GHOR-2 |
| EU-01 | Registration | Show error when Firebase registration fails | End-user/static analysis | Pass | GHOR-3 Done |
| EU-02 | Property | Reject incomplete property input with field errors | End-user/code review | Fail | GHOR-4 |
| EU-03 | Profile | Render API-error state without hook crash | End-user/static analysis | Pass | GHOR-6 Done |
| EU-04 | Chat | Keep separate conversations per property | End-user/data review | Fail | GHOR-7 |
| EU-05 | Property | Prevent seeker from creating listing | End-user/security review | Fail | GHOR-8 |
| EU-06 | Moderation | Hold new listing for admin approval | End-user/workflow review | Fail | GHOR-10 |
| EU-07 | Privacy | Hide phone number without authorized deal | End-user/privacy review | Fail | GHOR-9 |
| EU-08 | Login | Require email | Form validation review | Pass | React Hook Form rule present |
| EU-09 | Login | Require password | Form validation review | Pass | React Hook Form rule present |
| EU-10 | Registration | Reject mismatched confirmation password | Form validation review | Pass | React Hook Form rule present |
| EU-11 | Registration | Validate 11-digit phone number | Form validation review | Pass | Pattern rule present |
| EU-12 | Registration | Require upper/lowercase password | Form validation review | Pass | Validation rules present |
| EU-13 | NID | Reject NID other than 10/16 digits | Unit/code review | Pass | Client and backend checks present |
| EU-14 | Property | Reject malformed property ID | API review | Pass | Returns HTTP 400 |
| EU-15 | Property | Prevent deletion during active deal | API review | Pass | Status guard present |
| EU-16 | Property | Prevent deletion with active applications | API review | Pass | Application-count guard present |
| EU-17 | Notifications | Prevent reading another user's notification | Security review | Pass | Query includes authenticated email |
| EU-18 | Admin | Prevent self-checking a different user's admin status | Security review | Pass | Email/token comparison present |

## Commands

```powershell
cd client
npm.cmd run test:coverage

cd ../backend
npm.cmd run test:coverage
```

“Code review” results are backed by exact executable paths and Jira reproduction instructions. Browser/device cases requiring a working MongoDB/Firebase test environment must be repeated during the live demonstration.
