cat << 'EOF' > ARCHITECTURE.md

\# ForcePath Project Architecture



This document describes the full structure of the ForcePath repository.

Cursor and Antigravity should use this file to understand how the project is organized,

where each responsibility lives, and how new files should be generated.



---



\# 1. Overview



ForcePath is composed of three main layers inside a single repository:



1\. \*\*Core Engine (`src/`)\*\*  

&nbsp;  - The mathematical and linguistic simulation engine.  

&nbsp;  - Pure Python module.  

&nbsp;  - No web-specific logic should enter this layer.



2\. \*\*Web Backend (`api/`)\*\*  

&nbsp;  - FastAPI server that exposes the ForcePath engine as HTTP endpoints.  

&nbsp;  - Responsible for request validation, calling the engine, and returning JSON responses.



3\. \*\*Web Frontend (`web/`)\*\*  

&nbsp;  - React (Vite) UI that communicates with the backend.  

&nbsp;  - No engine logic should be implemented here.



All layers are physically in one repo but logically separated.



---



\# 2. Directory Structure



ForcePath/

├── LICENSE

├── README.md

├── requirements.txt

├── package.json

├── .gitignore

├── .env

│

├── main.py # CLI entry

│

├── src/ # Core ForcePath engine

│ ├── config/

│ ├── embeddings/

│ ├── forces/

│ ├── penalties/

│ ├── engine/

│ ├── decoder/

│ └── utils/

│

├── data/

│ ├── forces/

│ └── social\_reference.yaml

│

├── cache/

├── runs/

├── test/

│

├── api/ # FastAPI backend

│ ├── app/

│ │ ├── routes/

│ │ │ ├── simulate.py

│ │ │ ├── transition.py

│ │ │ └── health.py

│ │ ├── services/

│ │ │ └── forcepath\_service.py

│ │ ├── schemas/

│ │ │ ├── request.py

│ │ │ └── response.py

│ │ ├── core/

│ │ │ ├── config.py

│ │ │ └── logging.py

│ │ └── main.py

│ └── requirements.txt

│

├── web/ # React + Vite frontend

│ ├── src/

│ │ ├── components/

│ │ ├── pages/

│ │ ├── api/

│ │ │ └── forcepath.js

│ │ ├── hooks/

│ │ ├── styles/

│ │ ├── App.jsx

│ │ └── main.jsx

│ ├── index.html

│ ├── vite.config.js

│ └── package.json

│

├── Dockerfile.backend

├── Dockerfile.frontend

└── docker-compose.yml



yaml

코드 복사



---



\# 3. Responsibilities by Layer



\## 3.1 `src/` — Core Engine (Python)



This layer contains:



\- Sentence embeddings (OpenAI)

\- Force vector model

\- Penalty functions

\- CMA-ES simulation engine

\- Natural language decoding



\*\*Golden rule:\*\*  

> No API, web, UI, or HTTP logic belongs here.  

The backend and CLI should simply call this layer.



Example usage:



```python

from src.engine.simulator import run\_cma

3.2 api/ — FastAPI Backend

The backend wraps the ForcePath engine in stable API endpoints.



Responsibilities:



Request validation (Pydantic)



Routing (/api/simulate, /api/transition)



Logging \& error handling



Response formatting



Environment loading



Must NOT contain:



Mathematical logic



Embedding logic



CMA-ES simulation logic



These stay in src/.



3.3 web/ — React Frontend

This folder is fully isolated from Python.



Responsibilities:



UI for entering input sentences



Display simulation outputs



Optional visualization components



Frontend communicates with backend exclusively through /api/\*.



Example:



javascript

코드 복사

export async function simulate(prompt) {

&nbsp; return fetch("/api/simulate", {

&nbsp;   method: "POST",

&nbsp;   headers: {"Content-Type": "application/json"},

&nbsp;   body: JSON.stringify({ prompt }),

&nbsp; }).then(r => r.json());

}

4\. Backend–Engine Interaction

Data flow:



bash

코드 복사

Frontend → Backend → src/engine → Backend → Frontend

Standard backend flow:



JSON request arrives at /api/simulate



Backend validates input via Pydantic schema



Backend calls forcepath\_service



Service calls actual engine modules under src/



Response returned to frontend



5\. Coding Guidelines for Cursor

Cursor must follow these boundaries:



✔ Respect layer separation

Engine logic → src/



Backend API → api/



UI code → web/



✔ New API endpoints go in api/app/routes/

✔ Backend services go into api/app/services/

✔ Pydantic models go into api/app/schemas/

✔ Frontend API wrappers go in web/src/api/

✔ Engine must remain usable via CLI (main.py)

✔ No sensitive values hard-coded in code

6\. Development Commands

Run backend:

lua

코드 복사

uvicorn api.app.main:app --reload --port 8000

Run frontend:

arduino

코드 복사

cd web

npm install

npm run dev

Run entire stack with Docker:

css

코드 복사

docker-compose up --build

7\. Extension Points

Cursor may generate the following if requested:



New force models



New penalty functions



Visualization endpoints



Batch simulation modes



Frontend visualizers



Authentication layer



Internal data explorer



8\. Environment \& Configuration

ForcePath uses a .env file at the repository root.



Required environment variables:



OPENAI\_API\_KEY: Mandatory for embeddings and decoding.



OPENAI\_EMBED\_MODEL: Optional. Default text-embedding-4.



OPENAI\_CHAT\_MODEL: Optional. Default gpt-4o or similar.



FORCEPATH\_ENV: Optional. One of local, dev, prod.



The backend loads these through api/app/core/config.py.

Cursor must never commit secrets or hard-code them in source files.



Non-secret configuration may live under src/config/.



9\. Frontend–Backend Routing

Development setup:



Backend: http://localhost:8000



Frontend (Vite): http://localhost:5173



Vite proxies requests starting with /api to the backend.



Example mapping:



bash

코드 복사

Frontend request: /api/simulate

→ Proxied to: http://localhost:8000/api/simulate

Production deployments should preserve the /api/\* prefix to avoid CORS and rewrite issues.



Cursor should never remove or change this prefix unless explicitly asked.



10\. Testing

All tests belong under test/.



Structure:



bash

코드 복사

test/

├── engine/

├── forces/

├── penalties/

├── api/

└── ...

Guidelines:



Use pytest



Core engine tests must not depend on backend or frontend



Backend tests live under test/api



Frontend tests (if any) go under web/src/\_\_tests\_\_/



Changes to engine (src/) should be accompanied by updated tests.

