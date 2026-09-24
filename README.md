# NetArmor AI (NetCompliance Engine)

> **AI-Augmented, Vendor-Agnostic Network Device Compliance & Hardening Platform**

NetArmor AI is an enterprise-grade cybersecurity compliance platform designed to audit heterogeneous, multi-vendor network hardware against strict security benchmarks (**CIS Benchmarks**, **NIST SP 800-53 Rev 5**, **DISA STIGs**, and **ISO/IEC 27001:2022**).

Rather than relying on brittle, hard-coded command parsers that break with every firmware upgrade, NetArmor AI implements a **Canonical Security Baseline Model** powered by an **AI/NLP Normalization Engine** and an **Interactive Low-Code Training Loop** that dynamically learns unrecognized vendor syntax on the fly without backend code redeployment.

---

## 🌟 Key Capabilities

1. **Unified Multi-Vendor Ingestion**:
   - Single and bulk drag-and-drop file ingestion (`.cfg`, `.conf`, `.txt`, `.json`, `.xml`) or direct syntax-highlighted paste.
   - Built-in signature fingerprinters for **Cisco IOS/IOS-XE**, **Fortinet FortiOS**, **Palo Alto PAN-OS**, **Juniper JunOS**, **Arista EOS**, and **SONiC Linux (Whitebox Disaggregated)**.
   - Support for proprietary/custom hardware with automatic fallback to AI pattern matching.

2. **AI & NLP Normalization Engine**:
   - Extracts disparate CLI commands and normalizes them into a vendor-neutral **Canonical Security Baseline Model**:
     - **Management Plane**: SSHv2 enforcement, cleartext Telnet/HTTP termination, session idle timeouts, and legal banners.
     - **Authentication & AAA**: Password encryption standards (PBKDF2/Scrypt/SHA-512 vs. legacy reversible), RADIUS/TACACS+ integration, and account lockout policies.
     - **Telemetry & Logging**: Centralized SIEM/Syslog host forwarding, millisecond timestamps, and log buffering.
     - **Time Synchronization (NTP)**: Authoritative NTP sync and authentication.
     - **Monitoring (SNMP)**: SNMPv3-only enforcement and automated detection of insecure default community strings (`public`, `private`).
     - **Perimeter & Interfaces**: Administrative shutdown of unallocated interfaces and default-deny stateful filtering.

3. **Dynamic AI Training Module (The Learning Loop)**:
   - When encountering novel or unseen vendor commands (e.g., in newly acquired hardware or custom appliances), the system identifies unparsed lines.
   - An NLP assistant computes token cosine similarities and presents **instant semantic predictions** with confidence scores.
   - Administrators map commands to canonical security parameters using a low-code GUI and click **"Train & Save Heuristic"**.
   - Heuristics are persisted in SQLite and applied immediately to live audits without restarting the server or altering backend code.

4. **Multi-Framework Compliance Engine**:
   - **CIS Benchmarks** (Level 1 & Level 2 profiles)
   - **NIST SP 800-53 Rev 5** (AC-11, AC-17, AU-2, AU-8, IA-2, SC-8)
   - **DISA STIGs** (CAT I - Critical/High, CAT II - Medium, CAT III - Low)
   - **ISO/IEC 27001:2022** (A.8.9, A.8.15, A.8.20, A.8.24)
   - Provides risk severity ratings, exact evidence lines, and compliance index scores (0–100%).

5. **Actionable Remediation CLI Workbench**:
   - Synthesizes device-specific, copy-pasteable CLI commands tailored to the target vendor/OS.
   - One-click script copying and downloadable `.cfg` remediation patches.

6. **Executive PDF Audit Dossier Generation**:
   - Generates high-fidelity PDF audit reports using ReportLab with hardware metadata, compliance scorecards, audit tables, and remediation command blocks.

---

## 🏗️ Architecture & Project Structure

```
Project_2/
├── backend/
│   ├── app/
│   │   ├── config.py                 # Paths, database settings, report directories
│   │   ├── database.py               # SQLite / SQLAlchemy session engine
│   │   ├── main.py                   # FastAPI routes & endpoints
│   │   ├── models/                   # SQLAlchemy models (DeviceConfig, ComplianceAudit, LearnedHeuristic)
│   │   ├── schemas/                  # Pydantic v2 schemas (CanonicalSecurityBaseline, FindingDetail, Heuristics)
│   │   ├── services/
│   │   │   ├── normalizer/           # Cisco, Juniper, Fortinet, Palo Alto, Arista, SONiC, NLP Engine
│   │   │   ├── compliance/           # CIS, NIST, DISA STIG, ISO 27001 rule evaluators
│   │   │   ├── remediation/          # Vendor-specific CLI hardening command generator
│   │   │   ├── training/             # Interactive learning loop service
│   │   │   └── reporting/            # ReportLab PDF audit dossier generator
│   │   └── data/
│   │       └── sample_configs/       # Ready-to-audit enterprise configurations
│   ├── tests/                        # Pytest automated test suite (8 tests)
│   ├── verify_backend.py             # Standalone verification script
│   ├── pytest.ini                    # Pytest configuration
│   └── requirements.txt              # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── api/client.js             # Axios API client connecting to FastAPI backend
│   │   ├── components/               # Navbar, Dashboard, IngestionHub, ComplianceMatrix, RemediationWorkbench, AITrainingModule
│   │   ├── App.jsx                   # Main application layout and view navigation
│   │   └── index.css                 # Cyber-defense ops theme & Tailwind styling
│   ├── package.json                  # React + Vite dependencies
│   ├── vite.config.js                # Vite configuration with API reverse proxy
│   └── tailwind.config.js            # Tailwind custom color tokens
└── README.md                         # Project documentation
```

---

## 🚀 Quickstart Guide

### 1. Backend Setup
```bash
cd backend
python -m pip install -r requirements.txt
python verify_backend.py
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
- API Swagger Documentation: `http://127.0.0.1:8000/docs`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
- Web Application Console: `http://localhost:5173/`

---

## 🧪 Testing the Platform

### Running Backend Tests
```bash
python -m pytest -c backend/pytest.ini backend/tests
```
Expected output:
```
backend\tests\test_compliance.py ..
backend\tests\test_learning_loop.py .
backend\tests\test_normalizer.py .....
8 passed in 0.85s
```

### End-to-End User Verification Workflow
1. Open `http://localhost:5173/`. Observe the live dashboard pre-loaded with the Cisco Catalyst switch audit.
2. Click **Compliance Matrix** to review CIS, NIST, DISA STIG, and ISO 27001 findings with severity filter chips.
3. Click **CLI Remediation** to review the synthesized Cisco IOS hardening commands.
4. Click **Ingestion Hub** and select the **NexaEdge 9200 (Novel/Unseen Vendor)** preset. Click **Run Multi-Framework Audit**.
5. Switch to **AI Training Loop** to see unrecognized commands. Click **Teach Rule** or **Auto-fill Form** from the AI NLP prediction, then click **Train & Save Heuristic Rule**.
6. Observe the heuristic saved in the dynamic table and the live re-audit applying the new learned rule!
7. Click **Export Dossier PDF** in the top header to download the ReportLab audit report.
