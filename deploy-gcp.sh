#!/bin/bash
# Google Cloud Run Deployment Script for WATCHDOG
# Usage: ./deploy-gcp.sh [PROJECT_ID] [SERVICE_NAME] [REGION]

set -e

# Configuration
PROJECT_ID=${1:-watchdog-project}
SERVICE_NAME=${2:-watchdog-api}
REGION=${3:-us-central1}
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "🚀 WATCHDOG Google Cloud Run Deployment"
echo "================================================"
echo "Project ID: $PROJECT_ID"
echo "Service Name: $SERVICE_NAME"
echo "Region: $REGION"
echo "Image: $IMAGE_NAME"
echo "================================================"

# Step 1: Set up gcloud project
echo "📋 Setting up GCP project..."
gcloud config set project $PROJECT_ID

# Step 2: Enable required APIs
echo "✅ Enabling required APIs..."
gcloud services enable containerregistry.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable firestore.googleapis.com

# Step 3: Build Docker image
echo "🐳 Building Docker image..."
cd backend
docker build -t $IMAGE_NAME .

# Step 4: Push image to Google Container Registry
echo "📤 Pushing image to GCR..."
docker push $IMAGE_NAME

# Step 5: Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --timeout 3600 \
  --memory 2Gi \
  --cpu 2 \
  --set-env-vars \
    MOCK_LLM=false,\
    GOOGLE_GENERATIVEAI_API_KEY=${GOOGLE_GENERATIVEAI_API_KEY},\
    OPENROUTER_API_KEY=${OPENROUTER_API_KEY},\
    CORS_ORIGINS="https://${FRONTEND_DOMAIN}" \
  --no-gen2

# Step 6: Get service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format='value(status.url)')

echo ""
echo "✅ Deployment successful!"
echo "================================================"
echo "Service URL: $SERVICE_URL"
echo "================================================"
echo ""
echo "Next steps:"
echo "1. Set REACT_APP_API_URL environment variable to: $SERVICE_URL/api"
echo "2. Deploy frontend to Cloud Storage + Cloud CDN"
echo "3. Configure domain and SSL certificate"
echo ""
