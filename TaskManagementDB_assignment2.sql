-- ============================================================
-- PRN232 - Assignment 2: Task & Team Management Database (PostgreSQL)
-- Schema: assignment2
-- Tables: SystemAccount, Department, Project, Task, Tag, TaskTag
-- Ultra-rich Dataset (10x-15x expansion)
-- ============================================================

-- Create schema if not exists
CREATE SCHEMA IF NOT EXISTS assignment2;

-- Set search path
SET search_path TO assignment2;

-- Drop tables in dependency order
DROP TABLE IF EXISTS assignment2."TaskTag";
DROP TABLE IF EXISTS assignment2."Task";
DROP TABLE IF EXISTS assignment2."Project";
DROP TABLE IF EXISTS assignment2."Department";
DROP TABLE IF EXISTS assignment2."Tag";
DROP TABLE IF EXISTS assignment2."SystemAccount";

-- ============================================================
-- TABLE: SystemAccount
-- Role: 0 = Staff, 1 = Admin
-- ============================================================
CREATE TABLE assignment2."SystemAccount" (
    "AccountID"     SERIAL          PRIMARY KEY,
    "FullName"      VARCHAR(100)    NOT NULL,
    "Email"         VARCHAR(150)    NOT NULL UNIQUE,
    "PasswordHash"  VARCHAR(255)    NOT NULL,
    "Role"          SMALLINT        NOT NULL DEFAULT 0,
    "CreatedDate"   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE: Department
-- ============================================================
CREATE TABLE assignment2."Department" (
    "DepartmentID"          SERIAL          PRIMARY KEY,
    "DepartmentName"        VARCHAR(100)    NOT NULL,
    "DepartmentDescription" VARCHAR(300)    NOT NULL,
    "IsActive"              BOOLEAN         NOT NULL DEFAULT TRUE
);

-- ============================================================
-- TABLE: Project
-- Status: 0 = Not Started, 1 = In Progress, 2 = Completed, 3 = On Hold
-- ============================================================
CREATE TABLE assignment2."Project" (
    "ProjectID"     SERIAL          PRIMARY KEY,
    "ProjectName"   VARCHAR(200)    NOT NULL,
    "Description"   TEXT            NULL,
    "StartDate"     DATE            NOT NULL,
    "EndDate"       DATE            NULL,
    "Status"        SMALLINT        NOT NULL DEFAULT 0,
    "DepartmentID"  INT             NOT NULL,
    "IsActive"      BOOLEAN         NOT NULL DEFAULT TRUE,
    "CreatedDate"   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FK_Project_Department" FOREIGN KEY ("DepartmentID")
        REFERENCES assignment2."Department" ("DepartmentID")
);

-- ============================================================
-- TABLE: Tag
-- ============================================================
CREATE TABLE assignment2."Tag" (
    "TagID"     SERIAL          PRIMARY KEY,
    "TagName"   VARCHAR(50)     NOT NULL UNIQUE,
    "Color"     VARCHAR(7)      NULL    -- Hex color code e.g. #3B82F6
);

-- ============================================================
-- TABLE: Task
-- Status: 0 = To Do, 1 = In Progress, 2 = Done, 3 = Cancelled
-- Priority: 0 = Low, 1 = Medium, 2 = High, 3 = Critical
-- ============================================================
CREATE TABLE assignment2."Task" (
    "TaskID"        SERIAL          PRIMARY KEY,
    "Title"         VARCHAR(300)    NOT NULL,
    "Description"   TEXT            NULL,
    "Status"        SMALLINT        NOT NULL DEFAULT 0,
    "Priority"      SMALLINT        NOT NULL DEFAULT 1,
    "DueDate"       DATE            NULL,
    "ProjectID"     INT             NOT NULL,
    "CreatedByID"   INT             NULL,
    "IsActive"      BOOLEAN         NOT NULL DEFAULT TRUE,
    "CreatedDate"   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ModifiedDate"  TIMESTAMP       NULL,
    CONSTRAINT "FK_Task_Project" FOREIGN KEY ("ProjectID")
        REFERENCES assignment2."Project" ("ProjectID"),
    CONSTRAINT "FK_Task_CreatedBy" FOREIGN KEY ("CreatedByID")
        REFERENCES assignment2."SystemAccount" ("AccountID")
);

-- ============================================================
-- TABLE: TaskTag  (many-to-many: Task - Tag)
-- ============================================================
CREATE TABLE assignment2."TaskTag" (
    "TaskID"    INT     NOT NULL,
    "TagID"     INT     NOT NULL,
    CONSTRAINT "PK_TaskTag"         PRIMARY KEY ("TaskID", "TagID"),
    CONSTRAINT "FK_TaskTag_Task"    FOREIGN KEY ("TaskID") REFERENCES assignment2."Task" ("TaskID") ON DELETE CASCADE,
    CONSTRAINT "FK_TaskTag_Tag"     FOREIGN KEY ("TagID")  REFERENCES assignment2."Tag"  ("TagID") ON DELETE CASCADE
);

-- ============================================================
-- SEED: SystemAccount
-- Passwords:
-- Admin@123456 -> $2b$10$SLayiTrg4ARTbvwhqI.bNumEtfg8/qQ.hvP7GHG.iNIF500LsWn9S
-- Staff@123456 -> $2b$10$yHonwztMWpAC3hx.UmRBGez59wiuhFosqIiG6qYtYwq27eqKOvyE.
-- ============================================================
INSERT INTO assignment2."SystemAccount" ("AccountID", "FullName", "Email", "PasswordHash", "Role", "CreatedDate") VALUES
    (1, 'System Administrator', 'admin@tasktrack.com', '$2b$10$SLayiTrg4ARTbvwhqI.bNumEtfg8/qQ.hvP7GHG.iNIF500LsWn9S', 1, '2026-01-01 08:00:00'),
    (2, 'Sarah Jenkins (Lead Staff)', 'staff@tasktrack.com', '$2b$10$yHonwztMWpAC3hx.UmRBGez59wiuhFosqIiG6qYtYwq27eqKOvyE.', 0, '2026-01-05 09:00:00'),
    (3, 'Alex Rivera (DevOps Engineer)', 'alex.rivera@tasktrack.com', '$2b$10$yHonwztMWpAC3hx.UmRBGez59wiuhFosqIiG6qYtYwq27eqKOvyE.', 0, '2026-01-10 10:15:00'),
    (4, 'Elena Rostova (Frontend Architect)', 'elena.rostova@tasktrack.com', '$2b$10$yHonwztMWpAC3hx.UmRBGez59wiuhFosqIiG6qYtYwq27eqKOvyE.', 0, '2026-01-12 11:20:00'),
    (5, 'Marcus Vance (Security Analyst)', 'marcus.vance@tasktrack.com', '$2b$10$yHonwztMWpAC3hx.UmRBGez59wiuhFosqIiG6qYtYwq27eqKOvyE.', 0, '2026-01-15 14:00:00'),
    (6, 'Chloe Bennet (Product Manager)', 'chloe.bennet@tasktrack.com', '$2b$10$yHonwztMWpAC3hx.UmRBGez59wiuhFosqIiG6qYtYwq27eqKOvyE.', 0, '2026-01-18 15:30:00'),
    (7, 'David Kim (QA Automation)', 'david.kim@tasktrack.com', '$2b$10$yHonwztMWpAC3hx.UmRBGez59wiuhFosqIiG6qYtYwq27eqKOvyE.', 0, '2026-01-20 09:45:00'),
    (8, 'Temporary Contractor (Test Delete)', 'temp.contractor@tasktrack.com', '$2b$10$yHonwztMWpAC3hx.UmRBGez59wiuhFosqIiG6qYtYwq27eqKOvyE.', 0, '2026-02-01 10:00:00');

SELECT setval('assignment2."SystemAccount_AccountID_seq"', (SELECT MAX("AccountID") FROM assignment2."SystemAccount"));

-- ============================================================
-- SEED: Department (16 Departments)
-- ============================================================
INSERT INTO assignment2."Department" ("DepartmentID", "DepartmentName", "DepartmentDescription", "IsActive") VALUES
    (1,  'Software Engineering',    'Architects, develops, and maintains scalable backend services and distributed cloud systems.', TRUE),
    (2,  'Product Management',      'Defines product roadmaps, user stories, feature prioritization, and strategic market value.', TRUE),
    (3,  'DevOps & Cloud Ops',      'Automates CI/CD pipelines, orchestrates Kubernetes clusters, and guarantees 99.99% uptime.', TRUE),
    (4,  'Quality Assurance',       'Executes automated end-to-end testing, load simulations, regression tests, and security QA.', TRUE),
    (5,  'UI/UX Design Studio',     'Designs intuitive user interfaces, cohesive design systems, micro-interactions, and prototypes.', TRUE),
    (6,  'Cybersecurity & InfoSec', 'Enforces zero-trust architecture, conducts penetration testing, threat detection, and compliance.', TRUE),
    (7,  'AI & Data Intelligence',  'Builds generative AI pipelines, machine learning models, ETL analytics, and vector databases.', TRUE),
    (8,  'Mobile Application Lab',  'Develops high-performance native and cross-platform iOS & Android enterprise client apps.', TRUE),
    (9,  'Customer Success & Support','Provides Tier-1 to Tier-3 client onboarding, technical troubleshooting, and satisfaction.', TRUE),
    (10, 'IT Infrastructure',       'Manages corporate hardware, VPN gateways, Active Directory credentials, and office networks.', TRUE),
    (11, 'People & Culture (HR)',   'Oversees talent acquisition, technical recruitment, employee well-being, and training programs.', TRUE),
    (12, 'Finance & Accounting',    'Manages financial forecasting, payroll automation, vendor procurement, and tax reporting.', TRUE),
    (13, 'Growth & Marketing',      'Runs global digital campaigns, content marketing, brand awareness, and SEO optimization.', TRUE),
    (14, 'Enterprise Sales',        'Drives B2B partnerships, solution proposals, enterprise SLA contracting, and revenue growth.', TRUE),
    (15, 'Legal & Compliance',      'Guarantees GDPR/HIPAA compliance, intellectual property protection, and contractual governance.', TRUE),
    (16, 'Research & Innovations',  'Explores emerging decentralized protocols, WebAssembly edge computing, and experimental tech.', FALSE);

SELECT setval('assignment2."Department_DepartmentID_seq"', (SELECT MAX("DepartmentID") FROM assignment2."Department"));

-- ============================================================
-- SEED: Project (40 Projects)
-- ============================================================
INSERT INTO assignment2."Project" ("ProjectID", "ProjectName", "Description", "StartDate", "EndDate", "Status", "DepartmentID", "IsActive", "CreatedDate") VALUES
    (1,  'NextGen ERP Core Migration', 'Migrate legacy monolith ERP to microservices with event-driven architecture.', '2026-01-10', '2026-08-30', 1, 1, TRUE, '2026-01-05 10:00:00'),
    (2,  'High-Throughput Payment Gateway', 'Stripe & PayPal multi-region fallback engine with sub-50ms latency.', '2026-02-01', '2026-06-15', 1, 1, TRUE, '2026-01-25 11:30:00'),
    (3,  'Real-Time WebSocket Notification Bus', 'Distributed pub/sub messaging hub for push alerts and live collaboration.', '2026-01-15', '2026-04-30', 2, 1, TRUE, '2026-01-10 14:20:00'),
    (4,  'GraphQL Federation Layer', 'Unified GraphQL gateway consolidating 12 domain REST services.', '2026-03-01', '2026-07-20', 1, 1, TRUE, '2026-02-20 09:00:00'),
    (5,  'Q2 2026 Strategic Product Roadmap', 'Competitor benchmarking, customer user interview synthesis, and feature sizing.', '2026-01-05', '2026-03-31', 2, 2, TRUE, '2026-01-02 08:30:00'),
    (6,  'Customer Onboarding Funnel Revamp', 'Redesign 5-step registration funnel to increase conversion rate by 25%.', '2026-02-15', '2026-05-30', 1, 2, TRUE, '2026-02-10 13:40:00'),
    (7,  'Self-Service Analytics Dashboard', 'No-code drag-and-drop metrics builder for enterprise managers.', '2026-03-10', '2026-09-15', 0, 2, TRUE, '2026-03-01 16:00:00'),
    (8,  'Multi-Cloud Kubernetes Migration', 'Migrate workloads to AWS EKS and GCP GKE with automated failover.', '2026-01-01', '2026-06-30', 1, 3, TRUE, '2025-12-28 10:00:00'),
    (9,  'Terraform Infrastructure-as-Code V3', 'Standardize environment provisioning with modular Terraform templates.', '2026-02-01', '2026-04-15', 2, 3, TRUE, '2026-01-20 11:15:00'),
    (10, 'Automated Zero-Downtime Deployment', 'Canary release automation with ArgoCD and Istio service mesh.', '2026-03-01', '2026-08-01', 1, 3, TRUE, '2026-02-25 15:45:00'),
    (11, 'End-to-End Playwright Automation Suite', 'Comprehensive test harness covering all critical business user journeys.', '2026-01-20', '2026-05-15', 1, 4, TRUE, '2026-01-18 10:30:00'),
    (12, 'Continuous Performance & Chaos Testing', 'Simulate network latency, database failovers, and heavy traffic spikes.', '2026-02-10', '2026-06-30', 1, 4, TRUE, '2026-02-05 14:00:00'),
    (13, 'Design System "Aether" v2.0', 'Figma tokens, accessible WCAG 2.1 AAA color system, and React component kit.', '2026-01-15', '2026-05-01', 1, 5, TRUE, '2026-01-10 09:20:00'),
    (14, 'Mobile App UX Modernization', 'Streamlined navigation, fluid bottom sheets, and dark mode palette tuning.', '2026-02-01', '2026-04-30', 2, 5, TRUE, '2026-01-28 16:30:00'),
    (15, 'Zero-Trust Identity & MFA Rollout', 'Hardware FIDO2 keys and adaptive risk-based authentication integration.', '2026-01-10', '2026-04-20', 2, 6, TRUE, '2026-01-08 11:00:00'),
    (16, 'SOC2 Type II Audit Readiness', 'Audit log centralization, encryption-at-rest verification, and access reviews.', '2026-02-01', '2026-07-31', 1, 6, TRUE, '2026-01-22 13:10:00'),
    (17, 'AI Assistant Copilot for Project Tracking', 'LLM assistant providing smart task summarization and automated sprint risk estimation.', '2026-02-15', '2026-09-30', 1, 7, TRUE, '2026-02-10 09:40:00'),
    (18, 'Predictive Task Bottleneck Model', 'Train gradient boosting trees on historical sprint velocity to forecast blockers.', '2026-03-01', '2026-06-30', 0, 7, TRUE, '2026-02-22 15:00:00'),
    (19, 'Enterprise Vector Search Knowledge Base', 'Semantic embeddings and vector indexing for corporate documentation retrieval.', '2026-01-10', '2026-04-10', 2, 7, TRUE, '2026-01-05 10:50:00'),
    (20, 'React Native Mobile 3.0 Rewrite', 'Unify iOS and Android codebases with near-native performance and offline sync.', '2026-01-20', '2026-07-15', 1, 8, TRUE, '2026-01-15 14:10:00'),
    (21, 'Push Notification Delivery Engine', 'Apple APNS and Firebase Cloud Messaging localized campaign delivery.', '2026-02-15', '2026-04-25', 2, 8, TRUE, '2026-02-10 11:30:00'),
    (22, 'Omnichannel Help Desk Portal', 'Integrated ticket routing with Zendesk, Slack alerts, and automated triage.', '2026-01-15', '2026-05-20', 1, 9, TRUE, '2026-01-12 09:00:00'),
    (23, 'VIP Client Escalation Protocol', 'Dedicated SLA alerting matrix for tier-1 enterprise partners.', '2026-02-01', '2026-03-31', 2, 9, TRUE, '2026-01-26 13:45:00'),
    (24, 'Office VPN & SD-WAN Upgrade', 'Replace legacy OpenVPN with WireGuard zero-latency tunneling.', '2026-01-05', '2026-03-15', 2, 10, TRUE, '2026-01-03 10:20:00'),
    (25, 'Internal Asset Tracking Hardware IoT', 'RFID asset management for server racks and workstation inventory.', '2026-03-01', '2026-08-30', 0, 10, TRUE, '2026-02-20 16:30:00'),
    (26, 'Engineering Leveling & Compensation Framework', 'Define career ladders, skill competencies, and competitive market compensation bands.', '2026-01-15', '2026-04-15', 1, 11, TRUE, '2026-01-10 11:00:00'),
    (27, 'Summer Tech Internship 2026', 'Curriculum planning, campus outreach, and mentor pairing for 30 intern positions.', '2026-02-01', '2026-06-01', 1, 11, TRUE, '2026-01-25 15:10:00'),
    (28, 'Automated Billing & Revenue Recognition', 'ASC 606 revenue automation and multi-currency billing integration.', '2026-01-10', '2026-06-30', 1, 12, TRUE, '2026-01-08 10:00:00'),
    (29, 'Q1 2026 Financial Audit & Filing', 'Comprehensive balance sheet reconciliation and tax audit submission.', '2026-01-01', '2026-03-31', 2, 12, TRUE, '2025-12-29 09:15:00'),
    (30, 'Global Developer Summit 2026', 'Technical keynote, interactive workshops, and developer community hackathons.', '2026-02-01', '2026-05-25', 1, 13, TRUE, '2026-01-20 14:00:00'),
    (31, 'Organic SEO Strategy for Tech Blog', 'High-intent technical content production, backlink building, and Core Web Vitals audit.', '2026-01-20', '2026-07-31', 1, 13, TRUE, '2026-01-15 16:20:00'),
    (32, 'Enterprise Tier Contracting Package', 'Custom MSA contracts, uptime guarantees, and dedicated account manager add-ons.', '2026-01-10', '2026-04-30', 1, 14, TRUE, '2026-01-05 10:40:00'),
    (33, 'APAC Regional Expansion Partnership', 'Channel partner agreements and localized enterprise client discovery.', '2026-02-15', '2026-09-30', 0, 14, TRUE, '2026-02-10 11:50:00'),
    (34, 'GDPR & CCPA Privacy Compliance Framework', 'Automated data deletion request pipeline and user consent tracking system.', '2026-01-05', '2026-04-15', 2, 15, TRUE, '2026-01-02 09:30:00'),
    (35, 'Software Patent Portfolio Filing', 'Submit three patent disclosures regarding real-time distributed consensus.', '2026-02-01', '2026-08-31', 1, 15, TRUE, '2026-01-28 13:00:00'),
    (36, 'Quantum-Resistant Cryptography Prototype', 'Benchmarking lattice-based cryptography algorithms against legacy RSA.', '2026-01-10', '2026-10-31', 3, 16, FALSE, '2026-01-05 15:30:00'),
    (37, 'WebAssembly Edge Execution Engine', 'Execute untrusted user sandboxed plugins at the CDN edge using WASM.', '2026-02-01', '2026-09-15', 3, 16, FALSE, '2026-01-20 10:10:00'),
    (38, 'PostgreSQL Database Performance Tuning', 'Index defragmentation, query plan optimization, and connection pooling tuning.', '2026-01-15', '2026-03-30', 2, 1, TRUE, '2026-01-12 14:40:00'),
    (39, 'Multi-Factor Auth Hardware Token Integration', 'YubiKey WebAuthn integration across all corporate systems.', '2026-02-10', '2026-05-15', 1, 6, TRUE, '2026-02-05 11:20:00'),
    (40, 'Internal Employee Knowledge Portal', 'Centralized wiki for engineering guidelines, onboarding, and company policies.', '2026-01-20', '2026-04-30', 2, 11, TRUE, '2026-01-18 16:00:00');

SELECT setval('assignment2."Project_ProjectID_seq"', (SELECT MAX("ProjectID") FROM assignment2."Project"));

-- ============================================================
-- SEED: Tag (28 Tags with modern vibrant hex colors)
-- ============================================================
INSERT INTO assignment2."Tag" ("TagID", "TagName", "Color") VALUES
    (1,  'Backend',          '#2563EB'),
    (2,  'Frontend',         '#0284C7'),
    (3,  'DevOps',           '#0D9488'),
    (4,  'Cloud',            '#06B6D4'),
    (5,  'Database',         '#F59E0B'),
    (6,  'Security',         '#EF4444'),
    (7,  'BugFix',           '#DC2626'),
    (8,  'Feature',          '#10B981'),
    (9,  'Refactor',         '#8B5CF6'),
    (10, 'Documentation',    '#64748B'),
    (11, 'Testing',          '#EC4899'),
    (12, 'UI/UX',            '#F43F5E'),
    (13, 'AI/ML',            '#6366F1'),
    (14, 'Mobile',           '#14B8A6'),
    (15, 'Urgent',           '#B91C1C'),
    (16, 'High-Priority',    '#EA580C'),
    (17, 'Low-Priority',     '#94A3B8'),
    (18, 'Performance',      '#D97706'),
    (19, 'Architecture',     '#7C3AED'),
    (20, 'Compliance',       '#475569'),
    (21, 'Analytics',        '#3B82F6'),
    (22, 'Infrastructure',   '#059669'),
    (23, 'API',              '#4F46E5'),
    (24, 'Automation',       '#0891B2'),
    (25, 'Customer-Facing',  '#16A34A'),
    (26, 'Research',         '#A855F7'),
    (27, 'Audit',            '#78350F'),
    (28, 'Optimization',     '#84CC16');

SELECT setval('assignment2."Tag_TagID_seq"', (SELECT MAX("TagID") FROM assignment2."Tag"));

-- ============================================================
-- SEED: Task (120 Tasks)
-- Status: 0 = To Do, 1 = In Progress, 2 = Done, 3 = Cancelled
-- Priority: 0 = Low, 1 = Medium, 2 = High, 3 = Critical
-- ============================================================
INSERT INTO assignment2."Task" ("TaskID", "Title", "Description", "Status", "Priority", "DueDate", "ProjectID", "CreatedByID", "IsActive", "CreatedDate", "ModifiedDate") VALUES
    -- Project 1: NextGen ERP Core Migration
    (1,  'Audit legacy monolithic database schema', 'Document all 140 relational tables and identify foreign key constraints to decouple.', 2, 2, '2026-02-10', 1, 1, TRUE, '2026-01-10 10:00:00', '2026-02-09 17:30:00'),
    (2,  'Design domain-driven microservices boundary', 'Define bounded contexts for Inventory, Orders, Invoicing, and Customer Accounts.', 2, 3, '2026-02-25', 1, 2, TRUE, '2026-01-15 11:20:00', '2026-02-24 16:15:00'),
    (3,  'Implement Kafka event publishing for order status', 'Publish OrderPlaced and OrderFulfilled protobuf events to high-throughput Kafka topic.', 1, 2, '2026-04-15', 1, 2, TRUE, '2026-02-01 09:10:00', NULL),
    (4,  'Set up database read replicas for reporting', 'Deploy two read-only PostgreSQL replicas with pgpool connection load balancing.', 1, 1, '2026-04-30', 1, 3, TRUE, '2026-02-15 14:00:00', NULL),
    (5,  'Decommission old monolithic background batch jobs', 'Ensure all cron jobs are migrated to Kubernetes CronJobs with Sentry monitoring.', 0, 1, '2026-07-20', 1, 1, TRUE, '2026-03-01 10:30:00', NULL),

    -- Project 2: High-Throughput Payment Gateway
    (6,  'Integrate Stripe Checkout webhook signature validation', 'Verify incoming raw body webhook HMAC SHA256 signatures to prevent replay attacks.', 2, 3, '2026-02-28', 2, 1, TRUE, '2026-02-05 08:45:00', '2026-02-27 15:20:00'),
    (7,  'Implement idempotency keys for payment transactions', 'Store idempotency tokens in Redis with 24-hour TTL to prevent double charge charges.', 2, 3, '2026-03-15', 2, 2, TRUE, '2026-02-12 10:15:00', '2026-03-14 11:00:00'),
    (8,  'Add PayPal REST SDK fallback channel', 'Fallback routing logic if primary Stripe gateway responds with 5xx or timeouts over 2.5s.', 1, 2, '2026-05-10', 2, 2, TRUE, '2026-02-20 13:30:00', NULL),
    (9,  'PCI-DSS compliance tokenization audit', 'Verify that no unmasked raw credit card numbers or CVV codes enter server logs.', 1, 3, '2026-05-25', 2, 5, TRUE, '2026-02-28 16:00:00', NULL),

    -- Project 3: Real-Time WebSocket Notification Bus
    (10, 'Configure Redis Pub/Sub cluster for WebSockets', 'Deploy clustered Redis instance to sync message broadcasts across 6 API node pods.', 2, 2, '2026-02-20', 3, 3, TRUE, '2026-01-20 09:00:00', '2026-02-18 14:30:00'),
    (11, 'Implement heartbeat ping-pong socket protocol', 'Detect broken client connections and cleanup inactive channel subscriptions after 60s.', 2, 1, '2026-03-05', 3, 4, TRUE, '2026-02-01 11:30:00', '2026-03-04 10:20:00'),
    (12, 'Write load test script simulating 50,000 concurrent sockets', 'Use Artillery and k6 to verify WebSocket memory footprint under heavy traffic.', 1, 2, '2026-04-10', 3, 7, TRUE, '2026-02-18 15:45:00', NULL),

    -- Project 4: GraphQL Federation Layer
    (13, 'Deploy Apollo Router container on Kubernetes', 'Configure Apollo Router with federated supergraph schema and opentelemetry tracing.', 1, 2, '2026-04-20', 4, 3, TRUE, '2026-03-02 10:00:00', NULL),
    (14, 'Sub-graph schema definition for Inventory service', 'Expose Product, StockLevel, and Warehouse entities with @key directives.', 1, 1, '2026-05-01', 4, 2, TRUE, '2026-03-05 14:15:00', NULL),
    (15, 'Implement query depth limiting and cost analysis', 'Prevent malicious nested GraphQL queries from causing denial-of-service.', 0, 2, '2026-06-15', 4, 5, TRUE, '2026-03-10 16:30:00', NULL),

    -- Project 5: Q2 2026 Strategic Product Roadmap
    (16, 'Conduct customer feedback interviews with 20 enterprise clients', 'Gather qualitative data on pain points in project tracking and reporting features.', 2, 2, '2026-02-15', 5, 6, TRUE, '2026-01-10 09:00:00', '2026-02-14 17:00:00'),
    (17, 'Synthesize user pain points into Jira EPIC roadmap', 'Group feature requests into 4 thematic epics: Speed, Security, Automation, AI.', 2, 1, '2026-03-10', 5, 6, TRUE, '2026-02-16 11:00:00', '2026-03-09 15:00:00'),
    (18, 'Present executive summary slide deck to board', 'Deliver 30-minute roadmap presentation with projected ARR impact.', 2, 3, '2026-03-25', 5, 6, TRUE, '2026-03-01 13:30:00', '2026-03-24 16:45:00'),

    -- Project 6: Customer Onboarding Funnel Revamp
    (19, 'Design interactive prototype for onboarding wizard', 'Create 3-step modern glassmorphism walkthrough in Figma with micro-animations.', 2, 2, '2026-03-15', 6, 4, TRUE, '2026-02-15 10:00:00', '2026-03-12 14:00:00'),
    (20, 'Implement React wizard component with form state persistence', 'Save progress to local storage so users can resume onboarding without data loss.', 1, 1, '2026-04-20', 6, 4, TRUE, '2026-03-10 11:30:00', NULL),
    (21, 'Set up Mixpanel event tracking for step drop-offs', 'Track StepCompleted and StepSkipped events with user session metadata.', 1, 1, '2026-05-05', 6, 6, TRUE, '2026-03-15 15:00:00', NULL),

    -- Project 7: Self-Service Analytics Dashboard
    (22, 'Define data schema for custom chart widgets', 'Support bar, line, donut, and metric counter widgets with JSON configuration.', 0, 1, '2026-05-15', 7, 2, TRUE, '2026-03-12 09:30:00', NULL),
    (23, 'Evaluate open-source chart libraries (Chart.js vs Recharts)', 'Benchmark rendering performance for datasets with 10,000+ data points.', 0, 0, '2026-05-30', 7, 4, TRUE, '2026-03-18 14:20:00', NULL),

    -- Project 8: Multi-Cloud Kubernetes Migration
    (24, 'Provision AWS EKS cluster with Terraform', 'Spin up 5-node EKS cluster with Cilium CNI, managed node groups, and AWS EBS CSI.', 2, 3, '2026-02-10', 8, 3, TRUE, '2026-01-05 08:30:00', '2026-02-08 17:00:00'),
    (25, 'Provision GCP GKE secondary cluster for failover', 'Configure secondary region in asia-southeast1 with cross-cloud VPN interconnect.', 2, 2, '2026-03-01', 8, 3, TRUE, '2026-02-01 10:00:00', '2026-02-27 16:30:00'),
    (26, 'Configure external DNS and global Cloudflare load balancer', 'Route 80% traffic to primary EKS and 20% to GKE with automated health-check failover.', 1, 3, '2026-04-25', 8, 3, TRUE, '2026-02-25 11:15:00', NULL),
    (27, 'Establish automated Velero backup schedule', 'Snapshot PV volumes every 6 hours and store encrypted backups in S3 bucket.', 1, 2, '2026-05-10', 8, 3, TRUE, '2026-03-02 13:45:00', NULL),

    -- Project 9: Terraform Infrastructure-as-Code V3
    (28, 'Refactor network module to support dual-stack IPv6', 'Add IPv6 CIDR block allocation and route table rules across all VPC subnets.', 2, 1, '2026-02-28', 9, 3, TRUE, '2026-02-05 09:10:00', '2026-02-25 15:00:00'),
    (29, 'Implement tfsec and checkov static analysis in CI', 'Enforce policy checks before PR merge to prevent public S3 buckets and open security groups.', 2, 2, '2026-03-20', 9, 5, TRUE, '2026-02-15 14:30:00', '2026-03-19 11:40:00'),

    -- Project 10: Automated Zero-Downtime Deployment
    (30, 'Install and configure ArgoCD on staging cluster', 'Set up GitOps repository syncing with auto-prune and self-heal enabled.', 1, 2, '2026-04-10', 10, 3, TRUE, '2026-03-01 09:00:00', NULL),
    (31, 'Configure Argo Rollouts with Prometheus metrics analysis', 'Automatically rollback canary deployment if 5xx error rate exceeds 0.5% during 10m window.', 1, 3, '2026-05-15', 10, 3, TRUE, '2026-03-08 11:30:00', NULL),

    -- Project 11: End-to-End Playwright Automation Suite
    (32, 'Create automated smoke test for user login and token refresh', 'Verify JWT retrieval, cookie storage, and redirection behavior across Chrome, Safari, Firefox.', 2, 2, '2026-02-15', 11, 7, TRUE, '2026-01-25 10:00:00', '2026-02-12 16:20:00'),
    (33, 'Write test scenarios for Task CRUD operations', 'Assert task creation, modal validation, status dropdown update, and soft deletion.', 1, 2, '2026-04-05', 11, 7, TRUE, '2026-02-10 13:15:00', NULL),
    (34, 'Integrate Playwright suite into GitHub Actions workflow', 'Execute headless test suite on every pull request and upload HTML test reports.', 1, 1, '2026-04-25', 11, 7, TRUE, '2026-02-20 15:40:00', NULL),

    -- Project 12: Continuous Performance & Chaos Testing
    (35, 'Run k6 stress test on public Search API endpoint', 'Push traffic to 5,000 req/sec and measure p95 latency under high concurrency.', 2, 2, '2026-03-10', 12, 7, TRUE, '2026-02-15 09:30:00', '2026-03-08 14:10:00'),
    (36, 'Introduce ChaosMesh pod network latency experiments', 'Inject 200ms artificial delay to database connection and verify circuit breaker triggers.', 1, 2, '2026-05-01', 12, 3, TRUE, '2026-02-25 11:00:00', NULL),

    -- Project 13: Design System "Aether" v2.0
    (37, 'Establish dark-mode HSL color palette token standards', 'Define surface-0 through surface-4 tokens with subtle border contrasts.', 2, 2, '2026-02-20', 13, 4, TRUE, '2026-01-18 10:15:00', '2026-02-18 17:00:00'),
    (38, 'Build reusable Modal Dialog component with focus trap', 'Implement accessible dialog with escape key dismiss, backdrop blur, and smooth fade-in animation.', 2, 2, '2026-03-05', 13, 4, TRUE, '2026-02-05 13:30:00', '2026-03-03 16:10:00'),
    (39, 'Publish Aether design system npm package v2.1', 'Bundle typed components, CSS variables, and Storybook documentation.', 1, 1, '2026-04-15', 13, 4, TRUE, '2026-02-20 14:00:00', NULL),

    -- Project 14: Mobile App UX Modernization
    (40, 'Redesign bottom navigation bar with active micro-animations', 'Implement subtle spring physics when toggling between Home, Tasks, and Settings tabs.', 2, 1, '2026-03-10', 14, 4, TRUE, '2026-02-05 09:40:00', '2026-03-09 11:30:00'),
    (41, 'Implement swipe-to-action gestures on Task list items', 'Swipe right to complete task, swipe left to trigger priority quick-edit menu.', 2, 2, '2026-03-25', 14, 4, TRUE, '2026-02-18 11:20:00', '2026-03-24 15:50:00'),

    -- Project 15: Zero-Trust Identity & MFA Rollout
    (42, 'Deploy Authelia / Keycloak identity provider', 'Integrate OIDC / OAuth2 standard authorization server with Active Directory sync.', 2, 3, '2026-02-25', 15, 5, TRUE, '2026-01-15 10:00:00', '2026-02-22 14:20:00'),
    (43, 'Enforce WebAuthn hardware token enrollment for all Admin accounts', 'Disable SMS and email OTP for sensitive privileged accounts; require FIDO2 keys.', 2, 3, '2026-03-15', 15, 5, TRUE, '2026-02-01 13:00:00', '2026-03-14 16:30:00'),

    -- Project 16: SOC2 Type II Audit Readiness
    (44, 'Audit database access logs and retention policies', 'Ensure PostgreSQL pgaudit logs are stored in tamper-proof AWS S3 Glacier for 365 days.', 1, 3, '2026-04-30', 16, 5, TRUE, '2026-02-10 09:15:00', NULL),
    (45, 'Conduct annual third-party external penetration test', 'Engage certified security firm to execute black-box and white-box web app pen tests.', 1, 3, '2026-06-15', 16, 5, TRUE, '2026-02-20 15:00:00', NULL),
    (46, 'Remediate high-severity CVE findings from container scans', 'Upgrade base alpine images and patch OpenSSL runtime vulnerabilities.', 1, 2, '2026-05-10', 16, 3, TRUE, '2026-03-01 11:45:00', NULL),

    -- Project 17: AI Assistant Copilot for Project Tracking
    (47, 'Integrate OpenAI / Claude API client with retry and backoff', 'Implement resilient LLM connector with exponential backoff and token budget management.', 2, 2, '2026-03-10', 17, 2, TRUE, '2026-02-18 10:00:00', '2026-03-08 16:00:00'),
    (48, 'Prompt engineering for automated daily sprint summary', 'Construct few-shot prompt that converts git commit logs and task updates into concise standup notes.', 1, 2, '2026-04-20', 17, 2, TRUE, '2026-03-01 13:30:00', NULL),
    (49, 'Build streaming UI widget for Copilot chat responses', 'Display markdown stream chunks in real-time with code syntax highlighting.', 1, 1, '2026-05-15', 17, 4, TRUE, '2026-03-10 15:10:00', NULL),

    -- Project 18: Predictive Task Bottleneck Model
    (50, 'Extract training dataset of completed tasks and cycle times', 'Export 10,000 anonymized historic tasks with tag count, description length, and assignees.', 0, 1, '2026-05-01', 18, 2, TRUE, '2026-03-05 09:20:00', NULL),
    (51, 'Train XGBoost regressor predicting days overdue', 'Tune hyperparameters using Optuna and cross-validate on last 6 sprints.', 0, 2, '2026-06-01', 18, 2, TRUE, '2026-03-15 14:00:00', NULL),

    -- Project 19: Enterprise Vector Search Knowledge Base
    (52, 'Setup pgvector extension on Supabase database', 'Enable pgvector extension, create 1536-dimension embeddings column, and build HNSW index.', 2, 2, '2026-02-05', 19, 1, TRUE, '2026-01-12 10:30:00', '2026-02-03 16:40:00'),
    (53, 'Generate embeddings for 500 internal product documentation articles', 'Chunk markdown documents into 500-token sections and compute text-embedding-3-small vectors.', 2, 2, '2026-02-28', 19, 2, TRUE, '2026-01-20 14:00:00', '2026-02-26 15:15:00'),
    (54, 'Implement cosine similarity search endpoint with RAG context injection', 'Return top 5 most relevant documentation snippets given user inquiry.', 2, 2, '2026-03-20', 19, 1, TRUE, '2026-02-15 11:20:00', '2026-03-18 17:30:00'),

    -- Project 20: React Native Mobile 3.0 Rewrite
    (55, 'Initialize Expo SDK 52 workspace with New Architecture enabled', 'Setup TurboModules and Fabric renderer for 60fps gesture interactions.', 2, 2, '2026-02-15', 20, 4, TRUE, '2026-01-25 09:00:00', '2026-02-14 16:30:00'),
    (56, 'Implement offline WatermelonDB SQLite synchronization', 'Cache tasks and projects locally; queue write actions in local change log when offline.', 1, 3, '2026-05-15', 20, 4, TRUE, '2026-02-10 14:30:00', NULL),
    (57, 'Build custom Biometric Auth bridge for FaceID and TouchID', 'Prompt user for biometric unlock on app resume if token is still valid.', 1, 2, '2026-06-01', 20, 5, TRUE, '2026-02-25 10:15:00', NULL),

    -- Project 21: Push Notification Delivery Engine
    (58, 'Register Apple Developer APNS p8 auth key', 'Generate credentials and store encrypted secrets in cloud vault.', 2, 1, '2026-03-05', 21, 3, TRUE, '2026-02-18 10:45:00', '2026-03-04 14:10:00'),
    (59, 'Implement background silent push for task assignment updates', 'Wake up mobile app in background to pre-fetch freshly assigned task details.', 2, 2, '2026-03-25', 21, 4, TRUE, '2026-02-28 15:20:00', '2026-03-23 16:00:00'),

    -- Project 22: Omnichannel Help Desk Portal
    (60, 'Build Zendesk Webhook receiver endpoint', 'Ingest customer support tickets and automatically link corresponding high-priority bugs.', 2, 2, '2026-02-28', 22, 1, TRUE, '2026-01-20 09:15:00', '2026-02-26 11:50:00'),
    (61, 'Develop Slack Bot integration for critical ticket alerts', 'Post interactive Slack notification cards with Accept / Reassign action buttons.', 1, 1, '2026-04-15', 22, 2, TRUE, '2026-02-15 13:40:00', NULL),

    -- Project 23: VIP Client Escalation Protocol
    (62, 'Draft 15-minute SLA incident response runbook', 'Document escalation chain from Tier-1 support directly to on-call VP of Engineering.', 2, 2, '2026-02-20', 23, 6, TRUE, '2026-02-02 10:00:00', '2026-02-19 16:30:00'),
    (63, 'Integrate PagerDuty on-call scheduling for executive team', 'Configure live rotation schedule with SMS and phone call escalation paths.', 2, 2, '2026-03-10', 23, 3, TRUE, '2026-02-12 11:30:00', '2026-03-09 14:00:00'),

    -- Project 24: Office VPN & SD-WAN Upgrade
    (64, 'Deploy WireGuard gateway on dedicated Linux server', 'Configure kernel-level wireguard interface with elliptic-curve Curve25519 keys.', 2, 2, '2026-01-30', 24, 3, TRUE, '2026-01-08 09:00:00', '2026-01-28 17:00:00'),
    (65, 'Distribute WireGuard client configs to 150 company laptops', 'Automate setup via MDM profile with split-tunnel routing for corporate subnets.', 2, 1, '2026-02-28', 24, 3, TRUE, '2026-01-25 14:20:00', '2026-02-25 16:15:00'),

    -- Project 25: Internal Asset Tracking Hardware IoT
    (66, 'Procure 500 UHF RFID tags and 4 handheld readers', 'Select rugged tags resistant to server chassis heat and magnetic interference.', 0, 0, '2026-05-10', 25, 3, TRUE, '2026-03-02 10:00:00', NULL),
    (67, 'Build barcode/RFID scanning mobile screen in React Native', 'Enable quick scan to pull up equipment specs, warranty date, and assigned engineer.', 0, 1, '2026-06-30', 25, 4, TRUE, '2026-03-12 15:30:00', NULL),

    -- Project 26: Engineering Leveling & Compensation Framework
    (68, 'Define skill matrix from Junior (L1) to Principal Architect (L6)', 'Detail technical depth, system design autonomy, mentorship, and business impact criteria.', 2, 2, '2026-02-28', 26, 6, TRUE, '2026-01-20 11:00:00', '2026-02-26 15:45:00'),
    (69, 'Conduct compensation benchmarking against top Southeast Asia tech firms', 'Analyze Radford and Levels.fyi data for median 50th and 75th percentile salary bands.', 1, 2, '2026-04-10', 26, 6, TRUE, '2026-02-15 13:00:00', NULL),

    -- Project 27: Summer Tech Internship 2026
    (70, 'Publish internship job openings on university portals', 'Partner with top engineering universities and launch online coding challenge.', 2, 1, '2026-03-01', 27, 6, TRUE, '2026-02-05 10:30:00', '2026-02-28 16:00:00'),
    (71, 'Screen 250 applicant resumes and conduct initial technical interviews', 'Evaluate algorithmic fundamentals, passion projects, and teamwork mindset.', 1, 1, '2026-04-30', 27, 2, TRUE, '2026-03-01 14:00:00', NULL),

    -- Project 28: Automated Billing & Revenue Recognition
    (72, 'Integrate Stripe Invoicing API for enterprise annual contracts', 'Generate PDF invoices with localized VAT tax IDs and automated reminder emails.', 2, 2, '2026-02-28', 28, 1, TRUE, '2026-01-15 09:30:00', '2026-02-25 16:40:00'),
    (73, 'Implement ASC 606 revenue amortization schedule in database', 'Accurately amortize upfront multi-year software licenses over contract term.', 1, 3, '2026-05-15', 28, 2, TRUE, '2026-02-10 11:15:00', NULL),

    -- Project 29: Q1 2026 Financial Audit & Filing
    (74, 'Reconcile all bank statements with QuickBooks ledger', 'Verify corporate credit card expenses, vendor cloud bills, and payroll outflows.', 2, 2, '2026-02-25', 29, 6, TRUE, '2026-01-05 10:00:00', '2026-02-22 17:00:00'),
    (75, 'Submit verified corporate tax documents to authorities', 'Coordinate with external accounting firm for signed audit opinion letter.', 2, 3, '2026-03-20', 29, 6, TRUE, '2026-02-15 14:30:00', '2026-03-18 15:30:00'),

    -- Project 30: Global Developer Summit 2026
    (76, 'Build event registration microsite with Next.js', 'Include speaker bios, agenda schedule, ticket purchasing, and live stream player.', 2, 1, '2026-03-15', 30, 4, TRUE, '2026-02-05 10:00:00', '2026-03-12 16:15:00'),
    (77, 'Confirm 12 keynote speakers and finalize workshop tracks', 'Secure speakers on Cloud Native, Generative AI, Distributed Systems, and Web Security.', 1, 2, '2026-04-20', 30, 6, TRUE, '2026-02-20 13:00:00', NULL),

    -- Project 31: Organic SEO Strategy for Tech Blog
    (78, 'Audit website Core Web Vitals (LCP, FID, CLS)', 'Optimize image WebP compression and eliminate render-blocking CSS fonts.', 2, 1, '2026-02-20', 31, 4, TRUE, '2026-01-25 11:00:00', '2026-02-18 16:30:00'),
    (79, 'Publish 10 in-depth engineering deep-dive articles', 'Cover topics: Building Resilient Microservices in .NET, PostgreSQL Index Optimization, etc.', 1, 1, '2026-06-15', 31, 2, TRUE, '2026-02-10 14:00:00', NULL),

    -- Project 32: Enterprise Tier Contracting Package
    (80, 'Draft standard Master Services Agreement (MSA) template', 'Incorporate standard confidentiality, intellectual property indemnity, and 99.9% SLA.', 2, 2, '2026-02-28', 32, 6, TRUE, '2026-01-15 10:30:00', '2026-02-26 15:20:00'),
    (81, 'Design customized enterprise sales proposal PDF deck', 'Highlight dedicated enterprise VPC deployment, 24/7 phone SLA, and custom audit reports.', 1, 1, '2026-04-10', 32, 4, TRUE, '2026-02-20 15:00:00', NULL),

    -- Project 33: APAC Regional Expansion Partnership
    (82, 'Identify top 10 enterprise system integrator partners in Tokyo & Singapore', 'Map out channel distribution capabilities and schedule introductory partner calls.', 0, 1, '2026-05-30', 33, 6, TRUE, '2026-02-25 11:00:00', NULL),

    -- Project 34: GDPR & CCPA Privacy Compliance Framework
    (83, 'Implement automated Right-to-be-Forgotten data deletion API', 'Cascade user data purging across all primary and secondary database tables.', 2, 3, '2026-02-28', 34, 1, TRUE, '2026-01-10 09:30:00', '2026-02-25 16:10:00'),
    (84, 'Deploy OneTrust cookie banner on all public customer touchpoints', 'Block analytics and marketing scripts until explicit user opt-in consent is provided.', 2, 2, '2026-03-20', 34, 4, TRUE, '2026-02-05 14:00:00', '2026-03-18 17:00:00'),

    -- Project 35: Software Patent Portfolio Filing
    (85, 'Draft patent specification on Distributed Idempotent Locking', 'Work with patent attorney to articulate non-obviousness and technical novelty claims.', 1, 2, '2026-05-15', 35, 1, TRUE, '2026-02-10 10:00:00', NULL),
    (86, 'Prepare technical flowcharts and state diagrams for submission', 'Generate formal vector patent drawings depicting protocol message exchanges.', 1, 1, '2026-06-20', 35, 4, TRUE, '2026-02-25 15:30:00', NULL),

    -- Project 36: Quantum-Resistant Cryptography Prototype (Cancelled / On Hold)
    (87, 'Benchmark Kyber and Dilithium algorithm key generation latency', 'Evaluate CPU cycle consumption on ARM64 and x86_64 server architectures.', 3, 1, '2026-05-01', 36, 1, TRUE, '2026-01-15 14:00:00', '2026-02-10 11:00:00'),
    (88, 'Assess TLS 1.3 hybrid post-quantum cipher suites', 'Measure handshake latency impact over slow cellular 3G and 4G connections.', 3, 1, '2026-06-15', 36, 5, TRUE, '2026-01-20 16:30:00', '2026-02-12 10:20:00'),

    -- Project 37: WebAssembly Edge Execution Engine (On Hold)
    (89, 'Integrate Wasmer runtime into Go edge proxy', 'Execute untrusted sandboxed code with strict 50ms execution timeout and 64MB memory cap.', 3, 2, '2026-06-30', 37, 1, TRUE, '2026-02-01 10:00:00', '2026-02-28 14:00:00'),

    -- Project 38: PostgreSQL Database Performance Tuning
    (90, 'Analyze slow query logs and optimize N+1 queries', 'Add EF Core .Include() projections to eliminate redundant database round trips.', 2, 3, '2026-02-15', 38, 1, TRUE, '2026-01-18 09:00:00', '2026-02-12 16:45:00'),
    (91, 'Create compound index on Task (ProjectID, IsActive, Status)', 'Improve task list filtration speed from 145ms down to 4ms on 100k rows.', 2, 2, '2026-02-28', 38, 1, TRUE, '2026-01-25 11:30:00', '2026-02-26 14:20:00'),
    (92, 'Configure PgBouncer connection pooler in transaction mode', 'Prevent database server connection exhaustion under sudden traffic spikes.', 2, 2, '2026-03-15', 38, 3, TRUE, '2026-02-05 14:00:00', '2026-03-12 17:10:00'),

    -- Project 39: Multi-Factor Auth Hardware Token Integration
    (93, 'Implement FIDO2 WebAuthn credential attestation ceremony', 'Register security key public keys and counter values in database securely.', 2, 3, '2026-03-15', 39, 5, TRUE, '2026-02-15 10:00:00', '2026-03-14 16:00:00'),
    (94, 'Build fallback recovery codes generation mechanism', 'Generate 10 single-use 16-character alphanumeric backup codes hashed with BCrypt.', 1, 2, '2026-04-20', 39, 5, TRUE, '2026-02-28 13:40:00', NULL),

    -- Project 40: Internal Employee Knowledge Portal
    (95, 'Build markdown document rendering engine with syntax highlighting', 'Support Mermaid diagrams, callout alerts, and embedded code playgrounds.', 2, 1, '2026-02-28', 40, 4, TRUE, '2026-01-25 09:30:00', '2026-02-26 16:00:00'),
    (96, 'Implement Algolia instant search for company guidelines', 'Provide sub-10ms search results with typo tolerance and section highlighting.', 2, 1, '2026-03-25', 40, 2, TRUE, '2026-02-10 11:00:00', '2026-03-22 15:30:00'),

    -- Additional tasks to reach 120+ covering all domains
    (97,  'Setup Prometheus Alertmanager rules for API 5xx errors', 'Send high-urgency notifications to DevOps Slack when error rate exceeds 1%.', 2, 2, '2026-02-10', 8, 3, TRUE, '2026-01-10 09:00:00', '2026-02-08 15:00:00'),
    (98,  'Implement rate limiting on Auth login endpoint', 'Throttle IP addresses exceeding 5 failed login attempts per minute to mitigate brute-force.', 2, 3, '2026-02-20', 1, 1, TRUE, '2026-01-15 14:00:00', '2026-02-18 16:30:00'),
    (99,  'Optimize Next.js image loading using modern AVIF format', 'Configure next/image loader with responsive breakpoints and blur placeholder.', 2, 1, '2026-02-25', 13, 4, TRUE, '2026-01-20 11:15:00', '2026-02-24 10:20:00'),
    (100, 'Configure CORS headers to allow strict origin matching', 'Disallow wildcard CORS in production and enforce HTTPS credentials validation.', 2, 3, '2026-03-01', 1, 5, TRUE, '2026-02-01 10:45:00', '2026-02-28 17:15:00'),
    (101, 'Implement soft delete filter in EF Core DbContext', 'Add HasQueryFilter(t => t.IsActive) to automatically exclude deleted tasks.', 2, 2, '2026-03-05', 1, 2, TRUE, '2026-02-10 13:20:00', '2026-03-04 15:00:00'),
    (102, 'Create database seed migration with 120 rich tasks', 'Provide robust seed dataset covering multiple departments and status variations.', 2, 2, '2026-03-10', 1, 1, TRUE, '2026-02-15 08:30:00', '2026-03-09 18:00:00'),
    (103, 'Audit frontend bundle size using Webpack / Vite bundle analyzer', 'Tree-shake unused icon imports from lucide-react to reduce initial JS payload by 35%.', 1, 1, '2026-04-15', 13, 4, TRUE, '2026-02-20 14:00:00', NULL),
    (104, 'Add dark mode toggle animation with smooth CSS transition', 'Enhance user delight with rotating sun/moon icon transition.', 1, 0, '2026-04-20', 13, 4, TRUE, '2026-02-22 16:10:00', NULL),
    (105, 'Implement custom error boundary in React application', 'Render friendly fallback UI with error reporting when client component crashes.', 1, 1, '2026-04-25', 6, 4, TRUE, '2026-03-01 10:00:00', NULL),
    (106, 'Configure SonarQube static code quality analysis gate', 'Enforce minimum 80% unit test coverage and zero critical code smells before merge.', 1, 2, '2026-05-01', 11, 7, TRUE, '2026-03-05 11:30:00', NULL),
    (107, 'Set up automated daily database backup verification restore', 'Spin up ephemeral test container every night to verify database dump restorable.', 1, 2, '2026-05-10', 8, 3, TRUE, '2026-03-08 14:15:00', NULL),
    (108, 'Implement JWT token expiration warning popup in UI', 'Alert user 60 seconds before session expires with option to extend session.', 1, 2, '2026-05-15', 6, 4, TRUE, '2026-03-12 16:00:00', NULL),
    (109, 'Refactor Task filter dropdown to support multi-status query', 'Allow users to view To Do and In Progress tasks simultaneously.', 1, 1, '2026-05-20', 6, 2, TRUE, '2026-03-15 09:30:00', NULL),
    (110, 'Write API documentation with comprehensive OpenAPI annotations', 'Detail all request/response schemas, error codes, and auth requirements.', 1, 1, '2026-05-25', 1, 2, TRUE, '2026-03-18 11:00:00', NULL),
    (111, 'Set up automated dependabot alerts for npm and nuget packages', 'Automatically open PRs when security patches are released for dependencies.', 2, 1, '2026-03-15', 9, 5, TRUE, '2026-02-15 13:00:00', '2026-03-14 10:00:00'),
    (112, 'Create Postman collection with test pre-request scripts', 'Automate login token retrieval and environment variable injection for API testing.', 2, 2, '2026-03-20', 1, 7, TRUE, '2026-02-20 15:30:00', '2026-03-19 16:45:00'),
    (113, 'Implement exponential backoff in frontend API service', 'Automatically retry failed network GET requests up to 3 times before displaying error.', 0, 1, '2026-06-01', 6, 4, TRUE, '2026-03-22 10:00:00', NULL),
    (114, 'Design animated SVG empty-state illustrations for no tasks found', 'Create charming modern vector art for empty search and filter results.', 0, 0, '2026-06-10', 13, 4, TRUE, '2026-03-25 14:00:00', NULL),
    (115, 'Evaluate vector embedding search latency across 100,000 tasks', 'Measure query time under HNSW index vs flat IVFFlat index.', 0, 1, '2026-06-20', 19, 1, TRUE, '2026-03-28 11:20:00', NULL),
    (116, 'Implement keyboard shortcuts (Cmd+K / Ctrl+K) for quick search', 'Allow power users to quickly open search modal from anywhere in the app.', 0, 1, '2026-07-01', 6, 4, TRUE, '2026-04-01 15:00:00', NULL),
    (117, 'Implement CSV export feature for filtered task list', 'Generate downloadable CSV file containing task ID, title, status, priority, and dates.', 0, 1, '2026-07-15', 6, 2, TRUE, '2026-04-05 09:30:00', NULL),
    (118, 'Setup Sentry real-time frontend crash monitoring', 'Capture unhandled React component exceptions with stack trace and user breadcrumbs.', 0, 2, '2026-07-25', 11, 7, TRUE, '2026-04-10 13:40:00', NULL),
    (119, 'Perform database vacuum and reindex operation after seed load', 'Optimize PostgreSQL query planner statistics and rebuild B-tree indexes.', 2, 2, '2026-03-25', 38, 1, TRUE, '2026-02-28 16:00:00', '2026-03-24 17:30:00'),
    (120, 'Verify foreign key cascade rules on TaskTag association', 'Ensure deleting a task safely removes associated task-tag records without orphan rows.', 2, 3, '2026-03-30', 1, 1, TRUE, '2026-03-05 10:15:00', '2026-03-29 14:00:00');

SELECT setval('assignment2."Task_TaskID_seq"', (SELECT MAX("TaskID") FROM assignment2."Task"));

-- ============================================================
-- SEED: TaskTag (250+ Many-to-Many associations)
-- ============================================================
INSERT INTO assignment2."TaskTag" ("TaskID", "TagID") VALUES
    -- Tasks 1-10
    (1, 1), (1, 5), (1, 19), (1, 27),
    (2, 1), (2, 8), (2, 19),
    (3, 1), (3, 8), (3, 23),
    (4, 3), (4, 4), (4, 5), (4, 22),
    (5, 3), (5, 9), (5, 24),
    (6, 1), (6, 6), (6, 15), (6, 23),
    (7, 1), (7, 5), (7, 6), (7, 18),
    (8, 1), (8, 8), (8, 23),
    (9, 6), (9, 20), (9, 27),
    (10, 1), (10, 3), (10, 4), (10, 18),

    -- Tasks 11-20
    (11, 1), (11, 2), (11, 18),
    (12, 11), (12, 18), (12, 24),
    (13, 3), (13, 4), (13, 19), (13, 22),
    (14, 1), (14, 8), (14, 23),
    (15, 1), (15, 6), (15, 16),
    (16, 10), (16, 25),
    (17, 8), (17, 10), (17, 19),
    (18, 10), (18, 16),
    (19, 2), (19, 12), (19, 25),
    (20, 2), (20, 8), (20, 12),

    -- Tasks 21-30
    (21, 2), (21, 21), (21, 24),
    (22, 2), (22, 8), (22, 21),
    (23, 2), (23, 18), (23, 26),
    (24, 3), (24, 4), (24, 16), (24, 22),
    (25, 3), (25, 4), (25, 22),
    (26, 3), (26, 4), (26, 6), (26, 18),
    (27, 3), (27, 4), (27, 24),
    (28, 3), (28, 9), (28, 22),
    (29, 3), (29, 6), (29, 24), (29, 27),
    (30, 3), (30, 4), (30, 24),

    -- Tasks 31-40
    (31, 3), (31, 11), (31, 18), (31, 24),
    (32, 6), (32, 11), (32, 24),
    (33, 11), (33, 24),
    (34, 3), (34, 11), (34, 24),
    (35, 11), (35, 18), (35, 23),
    (36, 3), (36, 11), (36, 18),
    (37, 2), (37, 12), (37, 19),
    (38, 2), (38, 8), (38, 12),
    (39, 2), (39, 8), (39, 10),
    (40, 2), (40, 12), (40, 14),

    -- Tasks 41-50
    (41, 2), (41, 12), (41, 14),
    (42, 6), (42, 16), (42, 20), (42, 22),
    (43, 6), (43, 15), (43, 16),
    (44, 5), (44, 6), (44, 20), (44, 27),
    (45, 6), (45, 15), (45, 27),
    (46, 3), (46, 6), (46, 7), (46, 16),
    (47, 1), (47, 8), (47, 13), (47, 23),
    (48, 10), (48, 13), (48, 24),
    (49, 2), (49, 8), (49, 12), (49, 13),
    (50, 5), (50, 13), (50, 21),

    -- Tasks 51-60
    (51, 13), (51, 18), (51, 26),
    (52, 1), (52, 5), (52, 13), (52, 18),
    (53, 5), (53, 10), (53, 13), (53, 24),
    (54, 1), (54, 13), (54, 18), (54, 23),
    (55, 2), (55, 14), (55, 18), (55, 19),
    (56, 5), (56, 14), (56, 18),
    (57, 6), (57, 14), (57, 16),
    (58, 3), (58, 6), (58, 14),
    (59, 2), (59, 14), (59, 18),
    (60, 1), (60, 8), (60, 23), (60, 25),

    -- Tasks 61-70
    (61, 8), (61, 23), (61, 24), (61, 25),
    (62, 10), (62, 15), (62, 25),
    (63, 6), (63, 15), (63, 24),
    (64, 3), (64, 6), (64, 22),
    (65, 3), (65, 22), (65, 24),
    (66, 17), (66, 22),
    (67, 2), (67, 8), (67, 14),
    (68, 10), (68, 19),
    (69, 21), (69, 26),
    (70, 10), (70, 25),

    -- Tasks 71-80
    (71, 10), (71, 11),
    (72, 1), (72, 8), (72, 20), (72, 23),
    (73, 1), (73, 5), (73, 20),
    (74, 20), (74, 27),
    (75, 16), (75, 20), (75, 27),
    (76, 2), (76, 8), (76, 12), (76, 25),
    (77, 10), (77, 25),
    (78, 2), (78, 12), (78, 18), (78, 28),
    (79, 10), (79, 25), (79, 26),
    (80, 10), (80, 20),

    -- Tasks 81-90
    (81, 10), (81, 12), (81, 25),
    (82, 25), (82, 26),
    (83, 1), (83, 5), (83, 6), (83, 20),
    (84, 2), (84, 6), (84, 12), (84, 20),
    (85, 10), (85, 19), (85, 20),
    (86, 10), (86, 12), (86, 19),
    (87, 6), (87, 18), (87, 26),
    (88, 6), (88, 18), (88, 26),
    (89, 1), (89, 6), (89, 18), (89, 26),
    (90, 1), (90, 5), (90, 18), (90, 28),

    -- Tasks 91-100
    (91, 1), (91, 5), (91, 18), (91, 28),
    (92, 3), (92, 5), (92, 18), (92, 22),
    (93, 1), (93, 6), (93, 16), (93, 23),
    (94, 1), (94, 6), (94, 8),
    (95, 2), (95, 8), (95, 12),
    (96, 2), (96, 8), (96, 18),
    (97, 3), (97, 15), (97, 24),
    (98, 1), (98, 6), (98, 15), (98, 23),
    (99, 2), (99, 12), (99, 18), (99, 28),
    (100, 1), (100, 6), (100, 16), (100, 23),

    -- Tasks 101-120
    (101, 1), (101, 5), (101, 9),
    (102, 1), (102, 5), (102, 8),
    (103, 2), (103, 18), (103, 28),
    (104, 2), (104, 12),
    (105, 2), (105, 7), (105, 8),
    (106, 3), (106, 11), (106, 24),
    (107, 3), (107, 5), (107, 24),
    (108, 2), (108, 6), (108, 8),
    (109, 2), (109, 8), (109, 28),
    (110, 1), (110, 10), (110, 23),
    (111, 3), (111, 6), (111, 24),
    (112, 1), (112, 11), (112, 23),
    (113, 2), (113, 8), (113, 18),
    (114, 2), (114, 12), (114, 17),
    (115, 5), (115, 13), (115, 18),
    (116, 2), (116, 8), (116, 28),
    (117, 2), (117, 8), (117, 21),
    (118, 2), (118, 7), (118, 11),
    (119, 5), (119, 18), (119, 28),
    (120, 1), (120, 5), (120, 11);

-- ============================================================
-- VERIFY COUNTS
-- ============================================================
SELECT 'SystemAccount' AS "Table", COUNT(*) AS "Count" FROM assignment2."SystemAccount"
UNION ALL
SELECT 'Department', COUNT(*) FROM assignment2."Department"
UNION ALL
SELECT 'Project', COUNT(*) FROM assignment2."Project"
UNION ALL
SELECT 'Tag', COUNT(*) FROM assignment2."Tag"
UNION ALL
SELECT 'Task', COUNT(*) FROM assignment2."Task"
UNION ALL
SELECT 'TaskTag', COUNT(*) FROM assignment2."TaskTag";
