<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Mandatory Security & Operational Rules for Agents

> [!CAUTION]
> These rules are strict, non-negotiable, and MUST be adhered to at all times by any AI agent or engineer interacting with this repository.

---

## 1. Critical Environment & Secrets Rules

- **NEVER READ OR MODIFY ENVIRONMENT FILES**:
  - Never read, inspect, modify, or create `.env`, `.env.production`, `.env.local`, or `.env.development`.
  - Only `.env.example` may be inspected for documentation and reference schema.
- **ZERO SECRET EXPOSURE**:
  - Never expose, print, log, or output secrets, tokens, credentials, or keys in chat or write them into code.
  - Never hardcode or echo AWS secret keys, Cognito secret keys, Stripe secret keys, JWT secrets, or database connection strings.
  - Never modify or use AWS secret keys for any reason.
  - If hardcoded keys or credentials are discovered, never echo them back in conversation; treat them as sensitive, redact them, and advise moving them to environment variables.
- **DATABASE DUMP & ARTIFACT EXCLUSION**:
  - Never commit, dump, or track unencrypted SQL database dumps (`*.sql`, `*.dump`, `*.db`, `*.sqlite`, `*.sqlite3`).
  - Keep `.gitignore` strictly enforced (only versioned migrations under the migration directory are permitted).
  - Delete temporary diagnostic files immediately after use.

---

## 2. Mandatory Planning & Clear Explanation Protocol (What, Why, Where, How)

- **NO UNANNOUNCED ACTIONS**:
  - NEVER execute commands, make code modifications, or run scripts without first formulating and presenting a clear plan to the user.
- **EXPLICIT STRUCTURE**: Before taking any action or writing code, you MUST explicitly explain:
  1. **WHAT** you are changing or doing.
  2. **WHY** you are doing it (the root cause, justification, and expected outcome).
  3. **WHERE** you are doing it (described by architectural component, module, or feature).
  4. **HOW** you are going to do it (the technical implementation details, step-by-step methodology, and code logic).
- Provide full transparency and clarity before making changes.

---

## 3. Strict Communication Conciseness & Redaction Standards

- **NO VERSION CONTROL OR COMMIT MENTIONS**:
  - NEVER mention version control commits, commit commands, commit messages, or suggest committing changes in chat.
- **NO RAW FILE PATHS OR FILE NAMES IN CHAT**:
  - DO NOT mention raw file paths or raw file names in conversational explanations to the user; describe changes by their architectural component, module, or feature instead.
- **SECRET REDACTION**:
  - Automatically redact any API key, password, secret token, or credential encountered in diffs or code inspection.

---

## 4. Professional & Secure Engineering Standards (Zero Ad-Hoc Container Execution)

- **ZERO CONTAINER INTRUSION**:
  - NEVER execute ad-hoc container commands (such as interactive shell escapes, container execution utilities, or direct database container injection) to inspect, diagnose, or mutate running services or databases.
- **REPRODUCIBLE CODE & SCRIPTS**:
  - All schema updates, seeds, and data consistency logic must reside in version-controlled migration and seed scripts.
- **SELF-HEALING ARCHITECTURE**:
  - Data consistency repairs and integrity checks must be built into service lifecycle hooks and reproducible service logic.
- **AUDITABLE OBSERVABILITY**:
  - Diagnostics must rely on structured application logging, standardized health endpoints (`/healthz` or `/api/health`), and automated test suites.

---

## 5. Authentication, Authorization & Identity Rules

- **AUTHENTICATED REQUEST ENFORCEMENT**:
  - When creating or modifying any API endpoint (especially in identity, auth, user, settings, or admin modules), always ensure the request comes from a verified, authenticated user via middleware authentication tokens or session validation.
- **STRICT ROLE HIERARCHY & ZERO PRIVILEGE ESCALATION**:
  - Enforce strict role hierarchy and validation at the API boundary.
  - Public registration endpoints must strictly block self-assigning privileged roles (`ADMIN`, `SUPER_ADMIN`, `MANAGER`).
  - Administrative endpoints must strictly enforce verified administrative permissions or roles.
  - Never infer administrative or elevated privileges from the absence of contextual data (e.g., missing tenant or organization identifier). Authorization must always be explicitly derived from verified roles or permission payloads.
- **FAIL-CLOSED CRON & INTERNAL WORKERS**:
  - All cron jobs, internal workers, and background processors must fail closed.
  - Token and secret comparisons must strictly use timing-safe equality checks (`crypto.timingSafeEqual`) to prevent side-channel timing attacks. Never use simple string equality for sensitive comparisons.
- **AUTHENTICATION BACKDOOR ELIMINATION**:
  - Never permit test or mock social logins in production environments.
  - Never permit hardcoded OTP, PIN, or 2FA verification codes (e.g., `'123456'`).
  - Third-party OAuth (e.g., Google OAuth) must strictly verify that the identity provider has validated the primary identifier (e.g., `email_verified: true`) before authenticating or linking an account.
- **CSPRNG FOR SECURITY TOKENS & OTPS**:
  - All OTPs, verification codes, and security tokens must be generated using cryptographically secure pseudorandom number generators (`crypto.randomInt` or `crypto.randomBytes`). Never use `Math.random()`.
- **ANONYMOUS IDENTITY PROTECTION**:
  - User identity reveals for anonymous listings must require verified interaction thresholds (e.g., confirmed booking, showing request, submitted application, or required messaging milestone).

---

## 6. Sensitive Data Masking & Response Sanitization

- **STRIP CREDENTIALS IN API RESPONSES**:
  - All user and profile queries must explicitly exclude `password`, `twoFactorSecret`, `emailVerificationCode`, `phoneVerificationCode`, and `resetPasswordToken`.
- **MASK THIRD-PARTY SECRETS**:
  - Configuration, payment, and integration settings must mask sensitive credentials (e.g., displaying `••••••••`).
  - Update endpoints must detect masked placeholders and avoid overwriting existing live secrets.
- **ZERO HARDCODED DEVELOPER DATA**:
  - Absolute ban on hardcoding personal developer email addresses, test credentials, or arbitrary fallbacks in application code, services, or audit trails. Missing configurations must throw typed, descriptive exceptions.

---

## 7. Network, CORS & Real-Time Infrastructure

- **STRICT CORS & ORIGIN ALLOWLISTING**:
  - NEVER permit wildcard origins (`origin: '*'`) in production or server bootstrapping.
  - Origins must be strictly matched against verified environment variables and apex domains.
  - Requests without origin headers (internal health checks, server-to-server calls) are safely permitted.
- **SOCKET & REAL-TIME SECURITY**:
  - Real-time communication handshakes must validate authentication tokens prior to establishing connections.
  - Sockets must only be permitted to join rooms matching their authenticated user identity or verified participation. Room hijacking must be actively blocked.

---

## 8. Billing Correctness, Financial Precision & Idempotency

- **TRANSACTIONAL ATOMICITY**:
  - Every financial transaction, credit/balance consumption, and subscription transition must execute inside an atomic database transaction.
- **IDEMPOTENCY ENFORCEMENT**:
  - Every payment deduction, usage ledger increment, and webhook event handler must enforce an idempotency key to prevent race conditions and double charges on network retries.
- **FINANCIAL & MONETARY PRECISION**:
  - NEVER use floating-point types for storing monetary values, prices, invoices, balances, or transaction amounts.
  - All currency and monetary fields must strictly use high-precision decimals (`Decimal`) in schemas or exact integer cents to physically eliminate rounding errors.

---

## 9. Error Handling & Webhook Hardening

- **STRICT ERROR HANDLING (NO SILENT FAILURES)**:
  - All internal HTTP clients, API calls, and external integrations must verify response status codes.
  - Never swallow network timeouts or 5xx errors by silently returning `null` or `false`. Throw typed, descriptive exceptions so callers can trigger rollbacks.
- **FAIL-CLOSED WEBHOOKS**:
  - Webhook receivers must fail closed if required signing secrets or configuration keys are missing.
  - Validate webhook signatures using timing-safe comparisons or verify events directly against provider APIs.

---

## 10. UI & Component Standards

- **ICONOGRAPHY & ASSET RULES**:
  - Never use generic AI gimmick icon SVGs (sparkles, AI stars, bot gimmicks) or raw emoji SVGs across the UI.
  - Use clean, standard corporate React icons from approved icon libraries or authentic image assets.
- **GLOBAL DROPDOWN DESIGN**:
  - Never use unstyled native HTML `<select>` elements. Use the project's styled custom select dropdown component for consistent styling and accessibility.
- **GLOBAL DELETE CONFIRMATION**:
  - Never use native browser `confirm()` dialogs. Use the project's standard delete confirmation modal with proper loading and warning states.
- **PORTAL ACTION MENUS**:
  - Data directory and overview tables must render three-dot action menus via React portals anchored to the viewport to prevent container clipping or scrollbar issues.
- **AUTHENTIC ACTION HANDLERS**:
  - Never stub out document, receipt, or PDF downloads with fake toast alerts without actually producing or opening the document.
- **PRODUCTION-GRADE TERMINOLOGY**:
  - Never use placeholder or developer terms such as "Test" in user-facing buttons, headers, or badges. Copy must be enterprise-ready.

---

## 11. Testing & Adversarial Security Auditing

- **ZERO FAKE / TAUTOLOGICAL TESTING**:
  - Never write tests with synthetic in-memory dummy classes or fake self-validating mocks to simulate controllers, security guards, or services.
  - Test suites must validate actual production controllers, services, guards, and real database constraints.
- **MANDATORY ADVERSARIAL AUDITING**:
  - Validate endpoints against negative conditions: unverified signatures, expired tokens, missing roles, unauthenticated contexts, and concurrent requests.
- **REPOSITORY-WIDE AUDITS**:
  - When fixing any privilege escalation, anti-pattern, or vulnerability, search and remediate the issue across the entire repository.

---

## 12. Runtime, Containers & Tooling Standards

- **MANDATORY BUN RUNTIME**:
  - All package management, scripts, builds, and runtime executions must strictly utilize `bun` (e.g., `bun run`, `bun test`, `bun add`, `bun x`).
  - Never run `npm`, `npx`, `yarn`, or `pnpm`.
- **HEALTH & OBSERVABILITY**:
  - Expose standardized health checking verifying liveness and dependency readiness.
  - Incoming requests must propagate request correlation headers across application logs.
