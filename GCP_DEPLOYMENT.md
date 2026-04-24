# WATCHDOG - Google Cloud Deployment Guide

This guide walks through deploying WATCHDOG to Google Cloud Run with Gemini API integration.

## Prerequisites

- Google Cloud account with billing enabled
- `gcloud` CLI installed and configured
- Docker installed locally
- Access to Google Generative AI API (Gemini)

## Quick Start (5 minutes)

### 1. Create Google Cloud Project

```bash
# Create a new project
gcloud projects create watchdog-challenge --name="WATCHDOG - Unbiased AI Decision"

# Set as default
gcloud config set project watchdog-challenge
```

### 2. Get Gemini API Key

1. Go to [AI Studio](https://ai.google.dev/)
2. Click "Get API Key"
3. Create API key for this project
4. Copy and save: `GOOGLE_GENERATIVEAI_API_KEY`

### 3. Deploy Backend to Cloud Run

```bash
# From project root
export PROJECT_ID=watchdog-challenge
export GOOGLE_GENERATIVEAI_API_KEY=your_key_here
export OPENROUTER_API_KEY=your_key_here

# Run deployment script
chmod +x deploy-gcp.sh
./deploy-gcp.sh watchdog-challenge watchdog-api us-central1
```

### 4. Deploy Frontend to Cloud Storage

```bash
# Build frontend
cd frontend
npm install
npm run build

# Create GCS bucket
gsutil mb gs://watchdog-frontend-${PROJECT_ID}

# Upload build files
gsutil -m cp -r build/* gs://watchdog-frontend-${PROJECT_ID}/

# Make public
gsutil iam ch serviceAccount:${PROJECT_ID}@appspot.gserviceaccount.com:objectViewer gs://watchdog-frontend-${PROJECT_ID}

# Configure for SPA
gsutil web set -m index.html -e index.html gs://watchdog-frontend-${PROJECT_ID}/
```

### 5. Configure Domain (Optional)

```bash
# Create Cloud DNS zone
gcloud dns managed-zones create watchdog-zone \
  --dns-name=watchdog.example.com \
  --description="WATCHDOG domain"

# Add Cloud Run service as backend
gcloud compute backend-services create watchdog-backend \
  --protocol=HTTPS \
  --load-balancing-scheme=EXTERNAL \
  --global
```

## Architecture on Google Cloud

```
┌─────────────────────────────────────────────────────┐
│              Google Cloud Platform                   │
├─────────────────────────────────────────────────────┤
│                                                       │
│  ┌────────────────────────────────────────────┐    │
│  │   Cloud Load Balancer / Cloud CDN          │    │
│  │   (Global HTTPS endpoint)                  │    │
│  └──┬──────────────────────────────┬──────────┘    │
│     │                              │                │
│     │ Static Assets                │ /api requests  │
│     ↓                              ↓                │
│  ┌────────────┐             ┌──────────────┐      │
│  │ Cloud      │             │ Cloud Run    │      │
│  │ Storage    │             │ (Backend)    │      │
│  │ Bucket     │             │ - FastAPI    │      │
│  │ (React)    │             │ - Bias Engine│      │
│  └────────────┘             │ - Risk Engine│      │
│                             └──────┬───────┘      │
│                                    │               │
│                                    ↓               │
│  ┌────────────────────────────────────────┐       │
│  │     Google Generative AI (Gemini)      │       │
│  │     - Decision Analysis                │       │
│  │     - Bias Report Generation           │       │
│  │     - Dataset Audit Reports            │       │
│  └────────────────────────────────────────┘       │
│                                                     │
│  ┌────────────────────────────────────────┐       │
│  │     Firestore (Audit Logs)             │       │
│  │     - Decision Records                 │       │
│  │     - Audit Trail                      │       │
│  └────────────────────────────────────────┘       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Environment Variables

Set these in Cloud Run:

```
MOCK_LLM=false                          # Use real LLM providers
GOOGLE_GENERATIVEAI_API_KEY=<your_key>  # Gemini API key
OPENROUTER_API_KEY=<your_key>           # OpenRouter API (optional)
CORS_ORIGINS=<frontend_url>             # Allow frontend origin
LOG_LEVEL=INFO                          # Logging level
```

## API Endpoints

### Bias Detection (New for Challenge)

**Analyze single decision:**
```bash
curl -X POST https://watchdog-api.run.app/api/analyze-bias \
  -H "Content-Type: application/json" \
  -d '{
    "decision": {
      "age": 35,
      "gender": "female",
      "race": "black",
      "credit_score": 750,
      "decision": "approved"
    }
  }'
```

**Audit dataset:**
```bash
curl -X POST https://watchdog-api.run.app/api/audit-dataset \
  -H "Content-Type: application/json" \
  -d '{
    "decisions": [
      {"age": 35, "gender": "M", "decision": "approved"},
      {"age": 28, "gender": "F", "decision": "denied"}
    ]
  }'
```

## Monitoring & Logs

```bash
# View Cloud Run logs
gcloud run services describe watchdog-api --region us-central1

# Stream logs
gcloud run services logs read watchdog-api --region us-central1 --limit=50 --follow

# Check API metrics
gcloud monitoring dashboards create --config-from-file=monitoring-config.json
```

## Cost Optimization

- Cloud Run: Always use `--min-instances=0` (scales to zero when idle)
- Gemini API: Pay per request (very cheap for bias analysis)
- Cloud Storage: ~$0.020 per GB/month for frontend
- Firestore: Free tier includes 1GB storage

Estimated monthly cost: **~$5-10** for small-to-medium usage

## Troubleshooting

### API Key not found
```bash
gcloud run services update watchdog-api \
  --set-env-vars GOOGLE_GENERATIVEAI_API_KEY=<key> \
  --region us-central1
```

### CORS errors
```bash
# Check allowed origins
gcloud run services update watchdog-api \
  --set-env-vars CORS_ORIGINS="https://yourdomain.com" \
  --region us-central1
```

### High latency
- Increase CPU: `--cpu 4`
- Increase memory: `--memory 4Gi`
- Enable min instances: `--min-instances 1`

## Production Checklist

- [ ] Set `MOCK_LLM=false` and configure real LLM provider
- [ ] Set `MIN_INSTANCES=1` for production reliability
- [ ] Enable Cloud Armor for DDoS protection
- [ ] Set up Cloud Monitoring alerts
- [ ] Configure Cloud Logging
- [ ] Set `CORS_ORIGINS` to specific domain
- [ ] Enable VPC connector if using private network
- [ ] Set up automated backups for Firestore
- [ ] Configure Cloud CDN for frontend
- [ ] Set up SSL certificate for custom domain

## Support

For issues with Google Cloud:
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Generative AI Documentation](https://ai.google.dev/)
- [Google Cloud Support](https://cloud.google.com/support)
