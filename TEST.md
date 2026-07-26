# Ghor Bari — Software Quality Assurance Record

Last updated: 2026-07-26  
Jira project: [Ghorbari (GHOR)](https://iut-dhaka-team-m8gid8rw.atlassian.net/browse/GHOR)

## 1. Purpose

This document records the Software Quality Assurance work completed for Ghor Bari. It explains the testing approach, automated test implementation, coverage results, static and end-user review, Jira defect management, selected bug fixes, regression verification, and presentation workflow.

Ghor Bari is a Bangladesh property rental and sales platform built with:

- React 19 and Vite on the frontend
- Node.js and Express on the backend
- MongoDB for application data
- Firebase for authentication
- Socket.IO for real-time chat

## 2. SQA activities completed

The following quality activities were performed:

1. Inspected the frontend and backend architecture, routes, controllers, services, models, middleware, and important user flows.
2. Added deterministic automated unit-test commands to both applications.
3. Added frontend tests for chat helpers, authentication error mapping, and application/property status rules.
4. Added backend tests for property-description validation, authorization middleware, chat/database models, and public-registration security policy.
5. Generated module-scoped line, branch, and function coverage reports.
6. Ran ESLint static analysis on the frontend and backend.
7. Reviewed registration, login, property CRUD, moderation, authorization, chat, notification, NID, profile, and privacy flows.
8. Created separate Jira issues for verified defects with reproduction steps, expected and actual behavior, priority, severity, and code evidence.
9. Fixed three selected issues and demonstrated the Jira workflow from To Do to In Progress to Done.
10. Added a final SQA report, test-case matrix, and evaluation demonstration checklist under `sqa/`.

## 3. Automated test structure

### Frontend tests

Located in `client/test/`:

- `chatHelpers.test.js`
  - Text truncation
  - User initials
  - Timestamp grouping
  - Online-state helpers
  - Last-message previews
- `firebaseAuthErrorMessage.test.js`
  - Known Firebase error codes
  - Nested API error responses
  - Errors embedded in raw messages
  - Safe fallback messages
- `statusDisplay.test.js`
  - Legacy status normalization
  - Completed sale and rental labels
  - Inconsistent deal-state handling
  - Status colors and defaults

### Backend tests

Located in `backend/test/`:

- `propertyDescriptionPromptService.test.js`
  - Valid flat and building payloads
  - Required property fields
  - Price and area validation
  - Flat and building dimension validation
  - AI prompt constraints and supplied facts
- `verifyOwner.test.js`
  - Matching authenticated owner
  - Rejection of mismatched owner identity
- `chatModel.test.js`
  - Participant-key normalization
  - Invalid MongoDB identifiers
  - Conversation lookup and creation
  - Message defaults
  - Read-state updates
  - Unread-message counts
- `registrationPolicyService.test.js`
  - Safe default public-registration role
  - Prevention of caller-supplied admin role

## 4. Running the tests

Run the frontend suite and coverage:

```powershell
cd C:\Users\user\GHOR_BARI\client
npm.cmd run test
npm.cmd run test:coverage
```

Run the backend suite and coverage:

```powershell
cd C:\Users\user\GHOR_BARI\backend
npm.cmd run test
npm.cmd run test:coverage
```

The test commands are deliberately restricted to `test/*.test.js`. This prevents the old `backend/test-hf.js` network-connectivity script from being incorrectly executed as a unit test.

## 5. Latest verified results

After the selected bug fixes:

- Frontend: 11 tests passed, 0 failed
- Backend: 17 tests passed, 0 failed
- Total: 28 tests passed, 0 failed
- Targeted ESLint checks passed for the modified frontend files and the new backend registration-policy files

Earlier module-scoped coverage evidence before the final two backend regression assertions was:

| Target | Line coverage | Branch coverage | Function coverage |
|---|---:|---:|---:|
| Backend tested modules | 77.18% | 79.25% | 80.00% |
| Frontend tested utilities | 68.29% | 60.00% | 76.47% |

These figures apply only to modules loaded by the test suites. They are not whole-repository coverage and should not be presented as such.

## 6. Static analysis

The initial repository-wide ESLint audit found:

- Backend: 27 errors
- Frontend: 58 errors and 1 warning

Not every lint issue was reported as an end-user bug. Jira issues were created only when the finding had a defensible security, functional, privacy, validation, or workflow impact. The modified registration and Profile page files pass their targeted ESLint checks after the selected fixes.

## 7. Jira defect register

The Jira project currently offers Task rather than Bug as its available issue type. Verified defects were therefore created as Tasks with the `bug` and `sqa` labels.

| Jira | Summary | Priority | Final status |
|---|---|---|---|
| [GHOR-1](https://iut-dhaka-team-m8gid8rw.atlassian.net/browse/GHOR-1) | Public registration allowed self-assignment of admin role | Highest | Done |
| [GHOR-2](https://iut-dhaka-team-m8gid8rw.atlassian.net/browse/GHOR-2) | Property ownership identity handling required security review | Highest | To Do |
| [GHOR-3](https://iut-dhaka-team-m8gid8rw.atlassian.net/browse/GHOR-3) | Registration error handler used a missing import | High | Done |
| [GHOR-4](https://iut-dhaka-team-m8gid8rw.atlassian.net/browse/GHOR-4) | Property creation accepted invalid/incomplete data | High | To Do |
| [GHOR-5](https://iut-dhaka-team-m8gid8rw.atlassian.net/browse/GHOR-5) | Establish automated tests and coverage reporting | High | Done |
| [GHOR-6](https://iut-dhaka-team-m8gid8rw.atlassian.net/browse/GHOR-6) | Profile page called a React hook conditionally | High | Done |
| [GHOR-7](https://iut-dhaka-team-m8gid8rw.atlassian.net/browse/GHOR-7) | Chat conversations for different properties could be merged | High | To Do |
| [GHOR-8](https://iut-dhaka-team-m8gid8rw.atlassian.net/browse/GHOR-8) | Property creation lacked owner-role authorization | High | To Do |
| [GHOR-9](https://iut-dhaka-team-m8gid8rw.atlassian.net/browse/GHOR-9) | Public profile API exposed phone numbers too broadly | Medium | To Do |
| [GHOR-10](https://iut-dhaka-team-m8gid8rw.atlassian.net/browse/GHOR-10) | New property listings bypassed admin moderation | Highest | To Do |

Each verified defect contains:

- Description and user impact
- Reproduction steps
- Expected result
- Actual result
- Priority and severity
- Status
- Relevant source-code evidence

## 8. Selected fixes and Jira workflow demonstration

Three issues were selected to demonstrate the complete workflow.

### GHOR-1 — Registration privilege escalation

Workflow: **To Do → In Progress → Done**

Original problem:

- The public `/register-user` endpoint accepted a caller-provided `role`.
- `admin` was included among accepted roles.
- A malicious caller could therefore create a database record with an administrative role.

Fix:

- Removed `role` from public request processing in `userController.js`.
- Added `registrationPolicyService.js`, which supplies the server-owned non-privileged `user` role.
- Added two regression tests, including malicious `role: admin` input.

Verification:

- Backend suite passed 17/17 tests.
- New policy and regression test passed targeted ESLint.
- Evidence was attached to GHOR-1 before moving it to Done.

### GHOR-3 — Registration error handling

Workflow: **To Do → In Progress → Done**

Original problem:

- `RegisterPage.jsx` called `getFirebaseAuthErrorMessage` but did not import it.
- When registration failed, the catch handler could throw a `ReferenceError` instead of showing the intended toast.

Fix:

- Added the missing utility import.
- Removed an unused registration variable from the modified file.

Verification:

- Frontend suite passed 11/11 tests.
- Targeted ESLint reported zero errors for `RegisterPage.jsx`.
- Verification evidence was attached to GHOR-3 before moving it to Done.

### GHOR-6 — Conditional React hook

Workflow: **To Do → In Progress → Done**

Original problem:

- The Profile page returned early on an API error before executing a later `useEffect`.
- A state transition into the error view could change the number/order of hooks and crash React rendering.

Fix:

- Moved the initialization `useEffect` above all conditional returns.
- Removed an unused catch binding from the modified file.

Verification:

- Frontend suite passed 11/11 tests.
- Targeted ESLint reported zero errors for `ProfilePage.jsx`.
- The original `react-hooks/rules-of-hooks` finding disappeared.
- Verification evidence was attached to GHOR-6 before moving it to Done.

## 9. End-user and security review areas

The review covered:

- Empty login email and password validation
- Duplicate-email and failed registration behavior
- Password confirmation and strength rules
- Phone-number validation
- NID format and phone prerequisites
- Property creation, retrieval, editing, visibility, reopening, and deletion guards
- Property moderation and role authorization
- Application and deal status presentation
- Chat conversation separation and unread-message behavior
- Notification ownership checks
- Admin identity checks
- Public-profile privacy
- Mobile/responsive presentation considerations

The detailed matrix is available in `sqa/TEST_CASES.md`.

## 10. SQA deliverables

- `TEST.md` — complete project-level SQA record
- `sqa/TEST_CASES.md` — automated and manual/code-review test matrix
- `sqa/FINAL_REPORT.md` — final assessment and coverage summary
- `sqa/DEMONSTRATION_CHECKLIST.md` — evaluation presentation checklist
- `client/test/` — frontend unit tests
- `backend/test/` — backend unit tests

## 11. Presentation guidance

During evaluation:

1. Introduce the application and testing scope.
2. Run both test suites and show all tests passing.
3. Explain that coverage is module-scoped.
4. Open Jira and show each defect's reproduction details.
5. Demonstrate GHOR-1, GHOR-3, and GHOR-6 status histories.
6. Show the corresponding code changes and regression evidence.
7. Explain why unresolved bugs remain in To Do rather than being falsely closed.
8. Ensure each team member presents the Jira issues assigned to them.

## 12. Release assessment

The SQA evidence package is complete and repeatable. The selected fixed issues have regression evidence and completed Jira workflow histories. The application should still be considered **not approved for release** until the remaining Highest/Critical issues are fixed, retested, and moved to Done with evidence.

Team invitation and per-member issue distribution must be completed using the remaining members' Jira email addresses.
