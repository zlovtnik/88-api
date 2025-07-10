#!/bin/bash

# Local Kubernetes Deployment Script
# This script helps deploy the 88-api application to a local Kubernetes cluster

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="88-api"
REGISTRY="ghcr.io"
BACKEND_IMAGE="$REGISTRY/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^/]*\/[^/]*\).*/\1/')/backend"
FRONTEND_IMAGE="$REGISTRY/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^/]*\/[^/]*\).*/\1/')/frontend"

echo -e "${GREEN}🚀 88-API Local Deployment Script${NC}"
echo "=================================="

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command_exists kubectl; then
    echo -e "${RED}❌ kubectl is not installed. Please install kubectl first.${NC}"
    exit 1
fi

if ! command_exists docker; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Kubernetes cluster is running
if ! kubectl cluster-info >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Kubernetes cluster not accessible. Starting minikube...${NC}"
    if command_exists minikube; then
        minikube start
        eval $(minikube docker-env)
    else
        echo -e "${RED}❌ minikube is not installed. Please install minikube or start your Kubernetes cluster.${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Function to build and push images
build_images() {
    echo -e "${YELLOW}Building Docker images...${NC}"
    
    # Build backend image
    echo "Building backend image..."
    docker build -t $BACKEND_IMAGE:latest .
    
    # Build frontend image
    echo "Building frontend image..."
    docker build -t $FRONTEND_IMAGE:latest ./frontend
    
    echo -e "${GREEN}✅ Images built successfully${NC}"
}

# Function to deploy to Kubernetes
deploy_to_k8s() {
    echo -e "${YELLOW}Deploying to Kubernetes...${NC}"
    
    # Create namespace if it doesn't exist
    kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -
    
    # Update image tags in manifests
    sed -i.bak "s|BACKEND_IMAGE|$BACKEND_IMAGE:latest|g" k8s/backend-deployment.yaml
    sed -i.bak "s|FRONTEND_IMAGE|$FRONTEND_IMAGE:latest|g" k8s/frontend-deployment.yaml
    
    # Apply manifests
    kubectl apply -f k8s/namespace.yaml
    kubectl apply -f k8s/configmap.yaml
    kubectl apply -f k8s/secret.yaml
    kubectl apply -f k8s/backend-deployment.yaml
    kubectl apply -f k8s/frontend-deployment.yaml
    kubectl apply -f k8s/backend-service.yaml
    kubectl apply -f k8s/frontend-service.yaml
    
    # Restore original files
    mv k8s/backend-deployment.yaml.bak k8s/backend-deployment.yaml 2>/dev/null || true
    mv k8s/frontend-deployment.yaml.bak k8s/frontend-deployment.yaml 2>/dev/null || true
    
    echo -e "${GREEN}✅ Deployment completed${NC}"
}

# Function to check deployment status
check_status() {
    echo -e "${YELLOW}Checking deployment status...${NC}"
    
    echo "Pods:"
    kubectl get pods -n $NAMESPACE
    
    echo -e "\nServices:"
    kubectl get services -n $NAMESPACE
    
    echo -e "\nDeployments:"
    kubectl get deployments -n $NAMESPACE
    
    # Wait for pods to be ready
    echo -e "\n${YELLOW}Waiting for pods to be ready...${NC}"
    kubectl wait --for=condition=ready pod -l app=backend -n $NAMESPACE --timeout=300s
    kubectl wait --for=condition=ready pod -l app=frontend -n $NAMESPACE --timeout=300s
    
    echo -e "${GREEN}✅ All pods are ready${NC}"
}

# Function to show access information
show_access_info() {
    echo -e "${GREEN}🎉 Deployment successful!${NC}"
    echo "=================================="
    
    # Get minikube IP if using minikube
    if command_exists minikube; then
        MINIKUBE_IP=$(minikube ip)
        echo -e "${YELLOW}Minikube IP: $MINIKUBE_IP${NC}"
    fi
    
    echo -e "${YELLOW}Access URLs:${NC}"
    echo "Frontend: http://localhost:8080 (port-forward)"
    echo "Backend API: http://localhost:3000 (port-forward)"
    
    echo -e "\n${YELLOW}Port forwarding commands:${NC}"
    echo "Frontend: kubectl port-forward service/frontend-service 8080:80 -n $NAMESPACE"
    echo "Backend: kubectl port-forward service/backend-service 3000:3000 -n $NAMESPACE"
    
    echo -e "\n${YELLOW}Useful commands:${NC}"
    echo "View logs: kubectl logs -f deployment/backend -n $NAMESPACE"
    echo "View pods: kubectl get pods -n $NAMESPACE"
    echo "Delete deployment: kubectl delete namespace $NAMESPACE"
}

# Function to cleanup
cleanup() {
    echo -e "${YELLOW}Cleaning up...${NC}"
    kubectl delete namespace $NAMESPACE --ignore-not-found=true
    echo -e "${GREEN}✅ Cleanup completed${NC}"
}

# Main script logic
case "${1:-deploy}" in
    "deploy")
        build_images
        deploy_to_k8s
        check_status
        show_access_info
        ;;
    "build")
        build_images
        ;;
    "status")
        check_status
        ;;
    "cleanup")
        cleanup
        ;;
    "logs")
        echo -e "${YELLOW}Showing logs...${NC}"
        kubectl logs -f deployment/backend -n $NAMESPACE &
        kubectl logs -f deployment/frontend -n $NAMESPACE &
        wait
        ;;
    *)
        echo "Usage: $0 {deploy|build|status|cleanup|logs}"
        echo "  deploy  - Build images and deploy to Kubernetes (default)"
        echo "  build   - Build Docker images only"
        echo "  status  - Check deployment status"
        echo "  cleanup - Remove all resources"
        echo "  logs    - Show application logs"
        exit 1
        ;;
esac 