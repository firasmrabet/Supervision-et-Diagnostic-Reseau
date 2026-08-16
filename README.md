#  NetPulse AI — Network Intelligence & Operations Platform

An AI-powered Network Intelligence platform featuring real-time LAN & WiFi diagnostics, interactive 3D topology visualization, multi-model AI routing, and PostgreSQL analytics.

---

##  Features

-  **3D Interactive Topology Visualizer**: Real-time 3D rendering of network nodes, gateways, servers, workstations, IoT sensors, and firewalls with animated data flow tubes and PBR shaders.
-  **LAN & WiFi Network Scanner**: Hardware-level device discovery via ARP and 802.11 BSSID discovery with latency and bandwidth tracking.
-  **Multi-Provider AI Intelligence Engine**: Smart query router across 8 free LLM providers (Mistral, Groq, Cerebras, SambaNova, Cohere, NVIDIA NIM, OpenRouter, GitHub Models).
-  **Security & Authentication**: Dual authentication support with local encrypted JWT credentials and Google OAuth 2.0 (GSI / FedCM).
-  **Real-time Diagnostics & Monitoring**: Live throughput graphs, packet loss inspection, and anomaly alerts.
-  **Persistent Analytics**: PostgreSQL database backend for historical telemetry and audit logging.

---

##  Architecture

```
├── netpulse-ai/
│   ├── src/                    # Next.js 16 App Router Frontend
│   │   ├── app/                # Pages (Dashboard, Network, AI Chat, Reports, Settings, Login)
│   │   ├── components/         # UI Components, Providers & 3D Visualizer (Three.js / R3F)
│   │   ├── lib/                # API client & helpers
│   │   └── types/              # TypeScript definitions
│   ├── backend/                # FastAPI Backend Service
│   │   ├── main.py             # FastAPI entry point & REST endpoints
│   │   ├── ai_router.py        # Multi-provider LLM engine
│   │   ├── network_scanner.py  # ARP & WiFi discovery engine
│   │   ├── auth.py             # JWT & Google OAuth handling
│   │   ├── database.py         # SQLAlchemy & PostgreSQL integration
│   │   └── models.py           # Database schemas
│   └── package.json
```

---

##  Quick Start

### 1. Backend Setup

```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python main.py
```
*Backend runs on `http://localhost:8000`*

### 2. Frontend Setup

```bash
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000`*

### 3. Environment Configuration

Copy `.env.example` to `.env` in both root and `backend/` directories and add your API keys.

---

##  License

MIT License. Designed & Built for Network Operations & Intelligence.
