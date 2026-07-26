# Ghor Bari Software Quality Assurance Report

## 1. Scope

The assessment covers the React/Vite client and Node.js/Express/MongoDB backend, including authentication, registration, property listing and moderation, application status rules, chat, profile privacy, validation, and supporting utilities.

## 2. Methods

- Automated unit tests with the Node.js test runner
- Built-in code coverage reporting
- ESLint static analysis
- Route/controller authorization review
- Database-model behavior tests using controlled fake collections
- End-user workflow review using documented reproduction steps
- Separate Jira work items for each verified defect

## 3. Automated Results

| Target | Tests | Pass | Fail | Line coverage | Branch coverage | Function coverage |
|---|---:|---:|---:|---:|---:|---:|
| Backend tested modules | 17 | 17 | 0 | Re-run after fixes | Re-run after fixes | Re-run after fixes |
| Frontend tested utility modules | 11 | 11 | 0 | 68.29% | 60.00% | 76.47% |
| Total executions | 28 | 28 | 0 | Module-scoped | Module-scoped | Module-scoped |

Coverage percentages apply to modules loaded by the suites, not the entire repository. This distinction must be stated during evaluation.

## 4. Static Analysis

- Backend: 27 ESLint errors
- Frontend: 58 ESLint errors and 1 warning
- High-impact lint finding filed separately: conditional React hook on the Profile page
- Remaining lint items are technical-debt candidates, not automatically classified as end-user bugs

## 5. Principal Risks

1. Public registration can assign the admin role.
2. Property retrieval trusts a caller-controlled identity value.
3. New listings bypass intended moderation.
4. Property creation lacks sufficient validation and role authorization.
5. Registration failure handling calls an undefined helper.
6. Chat records do not separate different properties between the same participants.
7. Public profile responses expose phone numbers too broadly.

## 6. Jira Process

- Project: Ghorbari (`GHOR`)
- Workflow state used: To Do
- Labels: `bug`, `sqa`, plus feature/security labels
- Reporter/assignee currently connected: NAYEF WASIT SIDDIQUI
- Each verified defect includes description, reproduction steps, expected result, actual result, priority, severity, and code evidence

The Jira project currently exposes Task rather than Bug as its available issue type. Defects are therefore Tasks labeled `bug`. A Jira administrator may add the Bug issue type later without changing the evidence.

## 7. Exit Assessment

The SQA evidence pack, initial automated suites, coverage commands, defect register, and evaluation checklist are complete. Product release readiness is **Not Approved** while Critical/Highest defects remain in To Do. After fixes, each issue must be transitioned through In Progress to Done only after its reproduction test passes.

## 7.1 Demonstrated Fix Workflow (2026-07-20)

- GHOR-1: To Do → In Progress → Done; server-owned registration role plus two regression tests.
- GHOR-3: To Do → In Progress → Done; registration error helper import restored and targeted ESLint passed.
- GHOR-6: To Do → In Progress → Done; conditional hook ordering corrected and targeted ESLint passed.

## 8. External Dependencies

- Team invitation and per-member assignment require the remaining members' Jira email addresses.
- Full browser/device execution requires valid test Firebase, MongoDB, image-hosting, and email configurations.
- No destructive production or live-database tests were performed.
