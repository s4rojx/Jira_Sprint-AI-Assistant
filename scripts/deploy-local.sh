#!/usr/bin/env bash
set -euo pipefail

echo "=== Building application ==="
mvn clean package -DskipTests -B

echo "=== Building Docker image ==="
docker build -t sprint-assistant:latest .

echo "=== Loading image into Minikube ==="
minikube image load sprint-assistant:latest

echo "=== Applying Kubernetes manifests ==="
kubectl apply -f kubernetes/namespace.yaml
kubectl apply -f kubernetes/secret.yaml -n sprint-assistant
kubectl apply -f kubernetes/deployment.yaml -n sprint-assistant
kubectl apply -f kubernetes/service.yaml -n sprint-assistant

echo "=== Waiting for rollout ==="
kubectl rollout status deployment/sprint-assistant \
    -n sprint-assistant --timeout=5m

echo ""
echo "=== Done ==="
echo "URL: http://$(minikube ip):30080"
