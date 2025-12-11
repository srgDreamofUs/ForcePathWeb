# 🚀 Backend Deployment Guide - Render.com

## Quick Start (5 minutes)

### Step 1: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub (recommended)

### Step 2: Create Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository: `srgDreamofUs/ForcePathWeb`
3. Configure:
   - **Name:** `forcepath-api`
   - **Region:** Choose closest to your users
   - **Branch:** `main`
   - **Root Directory:** Leave empty (will use `render.yaml`)
   - **Build Command:** `pip install -r api/requirements.txt`
   - **Start Command:** `uvicorn api.app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan:** Free (or upgrade for better performance)

### Step 3: Set Environment Variables
Add these in Render dashboard → Environment:
```
CORS_ORIGINS=https://forcepath.dev,https://www.forcepath.dev
GEMINI_API_KEY=your_gemini_api_key_here
PYTHON_VERSION=3.11
```

### Step 4: Deploy
1. Click "Create Web Service"
2. Wait 2-5 minutes for deployment
3. Copy your Render URL (e.g., `https://forcepath-api.onrender.com`)

### Step 5: Configure Netlify
1. Go to Netlify Dashboard → Your site
2. Site Settings → Environment Variables
3. Add new variable:
   ```
   Key: VITE_API_BASE_URL
   Value: https://forcepath-api.onrender.com
   ```
4. Go to Deploys → Trigger Deploy → Clear cache and deploy site

### Step 6: Test
1. Visit https://forcepath.dev
2. Enter a test scenario
3. Click "Run Simulation"
4. Should work! 🎉

---

## Alternative: Railway.app

1. Go to https://railway.app
2. "New Project" → "Deploy from GitHub"
3. Select repository
4. Add environment variables:
   ```
   PORT=8000
   CORS_ORIGINS=https://forcepath.dev
   GEMINI_API_KEY=your_key
   ```
5. Railway will auto-detect Python and FastAPI
6. Deploy and copy URL
7. Add to Netlify as `VITE_API_BASE_URL`

---

## Verification

After deployment, test your backend:
```bash
curl https://your-backend-url.com/api/health
```

Should return:
```json
{"status": "healthy"}
```

Then test simulation:
```bash
curl -X POST https://your-backend-url.com/api/simulate \
  -H "Content-Type: application/json" \
  -d '{"sentence": "A technological revolution begins", "steps": 2}'
```

---

## Troubleshooting

### Backend deploys but frontend still shows error
- Check Netlify environment variable is set correctly
- Redeploy Netlify with "Clear cache and deploy site"
- Check browser console for exact URL being called

### Backend returns 404
- Verify start command uses correct module path
- Check root directory setting in Render

### CORS errors
- Add your exact domain to `CORS_ORIGINS`
- Include both www and non-www versions
