# SQA Evaluation Demonstration Checklist

## Jira

- Open the Ghorbari (`GHOR`) project.
- Filter with `labels = bug ORDER BY priority ASC`.
- Each member opens only issues assigned to them.
- Demonstrate description, steps, expected/actual result, severity, and priority.
- Move one selected issue from To Do to In Progress.
- Apply and verify the fix before moving it to Done.

## Automated Tests

- Run `npm.cmd run test:coverage` inside `client`.
- Show 14 passing frontend Jest/RTL tests.
- Run `npm.cmd run test:coverage` inside `backend`.
- Show 17 passing backend Jest tests.
- Explain that reported coverage is module-scoped.
- Open one test file and connect its assertions to a business rule.

## Recommended Individual Allocation

Replace placeholders after teammates are invited:

| Member | Suggested issue group |
|---|---|
| Nayef Wasit Siddiqui | Registration/authentication security |
| Member B | Property CRUD and validation |
| Member C | Chat, comparison, and wishlist |
| Member D | Profile, privacy, admin, and responsive UI |

## Live End-user Tests

- Registration success and duplicate-email failure
- Login success, bad password, empty fields, and password reset
- Property create/edit/hide/delete and invalid fields
- Search by location, price, area, listing type, and property type
- Submit, counter, accept, withdraw, complete, and cancel application
- Chat across two separate properties with the same user
- Wishlist note editing and removal
- Comparison creation, sharing, and privacy toggle
- Admin approval/rejection and NID verification
- Desktop, tablet, and mobile navigation/layout

Record screenshots or short video evidence during the evaluation environment run. Never mark an issue Done solely because code changed; repeat its reproduction steps first.
