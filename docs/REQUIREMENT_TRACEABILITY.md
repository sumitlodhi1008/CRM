# REQUIREMENT TRACEABILITY MATRIX (RTM) — AcxiomCRM

## 1. Traceability Matrix
This matrix maps every functional and non-functional requirement from the original project specification to its architectural component, development phase, implementation task, and test case.

| Req ID | Requirement Description | Target Module | Dev Phase | Implementation Task | Verification Test Case | Status |
|---|---|---|:---:|---|---|:---:|
| **R-01** | Application Shell, Responsive Layout & Navigation | AcxiomCrm.Client | Phase 3 | Task 3.1, 3.2 | TC-UI-01, TC-UI-02 | **Verified (100%)** |
| **R-02** | Role-based navigation filtering (Admin, Manager, SalesExec) | AcxiomCrm.Client | Phase 3 | Task 3.2 | TC-AUTHZ-01, TC-AUTHZ-02 | **Verified (100%)** |
| **R-03** | Global search and filter patterns | AcxiomCrm.Client | Phase 3 | Task 3.3 | TC-UI-03 | **Verified (100%)** |
| **R-04** | Authentication: Login & Logout (Username/Email + Password) | Server Auth | Phase 2 | Task 2.1, 2.2 | TC-AUTH-01, TC-AUTH-02 | **Verified (100%)** |
| **R-05** | Cryptographic password hashing (bcrypt salt rounds 10) | Server Models | Phase 2 | Task 2.1 | TC-SEC-01 | **Verified (100%)** |
| **R-06** | Password policy enforcement (min 8 chars, complexity) | Server Auth | Phase 2 | Task 2.1 | TC-AUTH-03 | **Verified (100%)** |
| **R-07** | Account lockout after 5 failed attempts (15 min lockout) | Server Auth | Phase 2 | Task 2.1 | TC-AUTH-04 | **Verified (100%)** |
| **R-08** | Audit logging of authentication events (success/failure) | Server Audit | Phase 2, 7 | Task 2.4, 7.1 | TC-AUDIT-01 | **Verified (100%)** |
| **R-09** | CSRF prevention & Secure Token transmission | Server Security | Phase 2 | Task 2.3 | TC-SEC-02 | **Verified (100%)** |
| **R-10** | Role-based Dashboard KPIs (Total Customers, Leads, Deals) | Client/Server | Phase 8 | Task 8.2 | TC-DASH-01, TC-DASH-02 | **Verified (100%)** |
| **R-11** | Chart.js visual analytics (Lead Status, Pipeline, Sales) | Client Dash | Phase 8 | Task 8.2 | TC-DASH-03 | **Verified (100%)** |
| **R-12** | Dashboard Date filters (Today, Week, Month, Custom) | Client Dash | Phase 8 | Task 8.2 | TC-DASH-04 | **Verified (100%)** |
| **R-13** | Customer Master CRUD & Search (Code, Name, Email, Phone) | Client/Server | Phase 4 | Task 4.1 | TC-CUST-01, TC-CUST-02 | **Verified (100%)** |
| **R-14** | Customer Email and Phone uniqueness enforcement | Server Models | Phase 4 | Task 4.2 | TC-VAL-01, TC-VAL-02 | **Verified (100%)** |
| **R-15** | Customer duplicate creation prevention | Server Ctrl | Phase 4 | Task 4.2 | TC-VAL-03 | **Verified (100%)** |
| **R-16** | Customer history and related activity tracking (360 View) | Client Detail | Phase 4 | Task 4.1 | TC-CUST-03 | **Verified (100%)** |
| **R-17** | Lead Management CRUD & Source capture | Client/Server | Phase 4 | Task 4.3 | TC-LEAD-01 | **Verified (100%)** |
| **R-18** | Lead status workflow enforcement | Server Ctrl | Phase 4 | Task 4.3 | TC-LEAD-02 | **Verified (100%)** |
| **R-19** | Atomic conversion of Qualified Lead to Customer & Opportunity| Server Service | Phase 4 | Task 4.4 | TC-LEAD-03 | **Verified (100%)** |
| **R-20** | Opportunity Management & Stage tracking | Client/Server | Phase 5 | Task 5.1 | TC-OPP-01 | **Verified (100%)** |
| **R-21** | Opportunity Amount > 0 validation | Server/Client | Phase 5 | Task 5.2 | TC-VAL-04 | **Verified (100%)** |
| **R-22** | Opportunity Probability between 0 and 100 validation | Server/Client | Phase 5 | Task 5.2 | TC-VAL-05 | **Verified (100%)** |
| **R-23** | Opportunity Expected Close Date not in past validation | Server/Client | Phase 5 | Task 5.2 | TC-VAL-06 | **Verified (100%)** |
| **R-24** | Derived Weighted Pipeline formula: `Amount * Prob / 100` | Server/Client | Phase 5 | Task 5.3 | TC-OPP-02 | **Verified (100%)** |
| **R-25** | Follow-Up scheduling & management | Client/Server | Phase 6 | Task 6.1 | TC-FOL-01 | **Verified (100%)** |
| **R-26** | Follow-Up date not earlier than today validation | Server/Client | Phase 6 | Task 6.1 | TC-VAL-07 | **Verified (100%)** |
| **R-27** | Display upcoming and overdue follow-up alerts | Client View | Phase 6 | Task 6.2 | TC-FOL-02 | **Verified (100%)** |
| **R-28** | Activity Management (Call, Meeting, Email, Task) | Client/Server | Phase 6 | Task 6.3 | TC-ACT-01 | **Verified (100%)** |
| **R-29** | User & Role Management (Admin only) | Client/Server | Phase 2, 3 | Task 2.1, 3.2 | TC-USER-01, TC-USER-02 | **Verified (100%)** |
| **R-30** | Account status and lockout status administration | Client/Server | Phase 2 | Task 2.1 | TC-USER-03 | **Verified (100%)** |
| **R-31** | Immutable Audit Log capturing user, action, old/new snapshot | Server Audit | Phase 7 | Task 7.1, 7.2 | TC-AUDIT-02 | **Verified (100%)** |
| **R-32** | REST Web API endpoints for Customers, Leads, Opportunities | Server APIs | Phase 8 | Task 8.1 | TC-API-01, TC-API-02 | **Verified (100%)** |
| **R-33** | API DTO decoupling and HTTP status code accuracy | Server APIs | Phase 8 | Task 8.1 | TC-API-03 | **Verified (100%)** |
| **R-34** | 8 Analytical Reports with filtering and export | Client/Server | Phase 8 | Task 8.3 | TC-REP-01 through 08 | **Verified (100%)** |
| **R-35** | 14-Point Final Acceptance Test Suite | Whole Solution | Phase 8 | Task 8.4 | TC-ACC-01 through 14 | **Verified (100%)** |
