# Deployment Guide

This guide walks you through setting up and deploying the 88-API project using the CI/CD pipeline and Kubernetes.

## Prerequisites

### Local Development
- Docker Desktop with Kubernetes enabled
- kubectl CLI tool
- Git

### Production
- Kubernetes cluster (1.20+)
- Container registry (GitHub Container Registry)
- Domain name for ingress
- SSL certificates (optional but recommended)

## Quick Start

### 1. Local Development Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd 88-api

# Install dependencies
make install

# Run database migrations
make db-migrate

# Start development servers
make dev
```

### 2. Local Kubernetes Deployment

```bash
# Deploy to local Kubernetes cluster
make deploy-local

# Check deployment status
make status

# View logs
make logs

# Access the application
# Frontend: http://localhost:8080 (port-forward)
# Backend: http://localhost:3000 (port-forward)
```

### 3. Production Deployment

The production deployment is automated via GitHub Actions:

1. **Push to main branch** to trigger deployment
2. **Monitor the deployment** in GitHub Actions
3. **Access your application** at your configured domain

## Detailed Setup

### GitHub Actions Setup

1. **Fork or create repository** on GitHub
2. **Add secrets** in repository settings:
   - `KUBECONFIG`: Base64 encoded kubeconfig for your cluster
   - `REGISTRY_TOKEN`: Container registry access token

3. **Update domain names** in `k8s/ingress.yaml`:
   ```yaml
   - host: api.your-domain.com
   - host: your-domain.com
   ```

4. **Push to main** to trigger the first deployment

### Kubernetes Cluster Setup

#### Option 1: Cloud Provider (Recommended)

**Google Cloud (GKE)**:
```bash
# Create cluster
gcloud container clusters create 88-api-cluster \
  --zone=us-central1-a \
  --num-nodes=3 \
  --machine-type=e2-medium

# Get credentials
gcloud container clusters get-credentials 88-api-cluster --zone=us-central1-a
```

**AWS (EKS)**:
```bash
# Create cluster using eksctl
eksctl create cluster --name 88-api-cluster --region us-west-2 --nodes 3

# Get credentials
aws eks update-kubeconfig --name 88-api-cluster --region us-west-2
```

**Azure (AKS)**:
```bash
# Create cluster
az aks create --resource-group myResourceGroup --name 88-api-cluster --node-count 3

# Get credentials
az aks get-credentials --resource-group myResourceGroup --name 88-api-cluster
```

#### Option 2: Local Development

**Docker Desktop**:
1. Enable Kubernetes in Docker Desktop settings
2. Install nginx-ingress:
   ```bash
   kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml
   ```

**Minikube**:
```bash
# Install minikube
brew install minikube

# Start cluster
minikube start

# Enable ingress addon
minikube addons enable ingress
```

### Configuration

#### 1. Update Secrets

Edit `k8s/secret.yaml`:
```yaml
stringData:
  JWT_SECRET: "your-super-secret-jwt-key-change-this-in-production"
  DATABASE_PASSWORD: "your-database-password"
```

#### 2. Update ConfigMap

Edit `k8s/configmap.yaml`:
```yaml
data:
  CORS_ORIGIN: "https://your-domain.com,https://www.your-domain.com"
```

#### 3. Update Ingress

Edit `k8s/ingress.yaml`:
```yaml
spec:
  rules:
  - host: api.your-domain.com
  - host: your-domain.com
```

### Deployment Commands

#### Manual Deployment

```bash
# Apply all manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -n 88-api
kubectl get services -n 88-api
kubectl get ingress -n 88-api

# View logs
kubectl logs -f deployment/backend -n 88-api
kubectl logs -f deployment/frontend -n 88-api
```

#### Automated Deployment

The GitHub Actions workflow handles:
1. Building Docker images
2. Pushing to container registry
3. Updating Kubernetes manifests
4. Deploying to cluster
5. Health checks

### Monitoring Setup

#### Basic Monitoring

```bash
# Deploy monitoring stack
kubectl apply -f k8s/monitoring.yaml

# Access monitoring
# Prometheus: http://monitoring.your-domain.com/prometheus
# Grafana: http://monitoring.your-domain.com/grafana (admin/admin)
```

#### Advanced Monitoring

Consider using:
- **Prometheus Operator** for production
- **Grafana Cloud** for managed monitoring
- **Datadog** or **New Relic** for APM

### SSL/TLS Setup

#### Using Let's Encrypt

1. **Install cert-manager**:
   ```bash
   kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
   ```

2. **Create ClusterIssuer**:
   ```yaml
   apiVersion: cert-manager.io/v1
   kind: ClusterIssuer
   metadata:
     name: letsencrypt-prod
   spec:
     acme:
       server: https://acme-v02.api.letsencrypt.org/directory
       email: your-email@example.com
       privateKeySecretRef:
         name: letsencrypt-prod
       solvers:
       - http01:
           ingress:
             class: nginx
   ```

3. **Update ingress** to use TLS:
   ```yaml
   spec:
     tls:
     - hosts:
       - your-domain.com
       - api.your-domain.com
       secretName: 88-api-tls
   ```

### Database Setup

#### Development (SQLite)
The current setup uses SQLite with persistent storage.

#### Production (PostgreSQL)
For production, consider migrating to PostgreSQL:

1. **Deploy PostgreSQL**:
   ```bash
   kubectl apply -f k8s/postgres.yaml
   ```

2. **Update backend** to use PostgreSQL connection
3. **Run migrations** on the new database

### Backup Strategy

#### Database Backup
```bash
# Create backup
kubectl exec <backend-pod> -n 88-api -- cp /app/data.db /tmp/backup.db
kubectl cp <backend-pod>:/tmp/backup.db ./backup.db -n 88-api

# Restore backup
kubectl cp ./backup.db <backend-pod>:/app/data.db -n 88-api
```

#### Application Backup
- Docker images are stored in container registry
- Kubernetes manifests are version controlled
- Persistent volumes should be backed up separately

### Troubleshooting

#### Common Issues

1. **Image Pull Errors**:
   ```bash
   kubectl describe pod <pod-name> -n 88-api
   ```

2. **Service Not Accessible**:
   ```bash
   kubectl get endpoints -n 88-api
   kubectl describe service <service-name> -n 88-api
   ```

3. **Ingress Issues**:
   ```bash
   kubectl describe ingress 88-api-ingress -n 88-api
   kubectl get ingress -n 88-api -o yaml
   ```

#### Debug Commands

```bash
# Port forward for local access
kubectl port-forward service/backend-service 3000:3000 -n 88-api
kubectl port-forward service/frontend-service 8080:80 -n 88-api

# Exec into containers
kubectl exec -it <pod-name> -n 88-api -- /bin/sh

# Check resource usage
kubectl top pods -n 88-api
kubectl top nodes

# View events
kubectl get events -n 88-api --sort-by='.lastTimestamp'
```

### Performance Optimization

1. **Resource Limits**: Monitor and adjust CPU/memory limits
2. **Image Optimization**: Use multi-stage builds and alpine images
3. **Caching**: Implement proper caching headers
4. **CDN**: Use CDN for static assets
5. **Database**: Consider migrating to PostgreSQL for production

### Security Considerations

1. **Secrets Management**: Use external secret management
2. **Network Policies**: Implement network policies
3. **RBAC**: Configure proper RBAC
4. **TLS**: Enable TLS termination
5. **Image Security**: Use image scanning

### Scaling

#### Horizontal Scaling
```bash
# Manual scaling
kubectl scale deployment backend --replicas=5 -n 88-api

# Automatic scaling (HPA)
kubectl apply -f k8s/hpa.yaml
```

#### Vertical Scaling
Edit deployment manifests to adjust resource requests/limits.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review application logs
3. Check Kubernetes events
4. Consult the CI-CD-README.md for detailed information 