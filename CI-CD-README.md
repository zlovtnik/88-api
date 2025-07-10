# CI/CD Pipeline & Kubernetes Deployment

This document describes the CI/CD pipeline and Kubernetes deployment setup for the 88-API project.

## Overview

The project consists of:
- **Backend**: TypeScript API built with Bun
- **Frontend**: Angular application
- **Infrastructure**: Kubernetes manifests for deployment

## CI/CD Pipeline

### GitHub Actions Workflow

The CI/CD pipeline is defined in `.github/workflows/ci-cd.yml` and includes:

1. **Testing Stage**:
   - Backend tests with Bun
   - Frontend tests with Angular
   - Linting and code quality checks

2. **Build Stage**:
   - Docker image building for both services
   - Pushing to GitHub Container Registry
   - Multi-stage builds for optimization

3. **Deploy Stage**:
   - Automatic deployment to Kubernetes
   - Rolling updates with zero downtime
   - Health checks and monitoring

### Pipeline Triggers

- **Push to main**: Full CI/CD pipeline with deployment
- **Pull Requests**: Testing and validation only
- **Push to develop**: Testing and validation only

## Kubernetes Architecture

### Namespace
- All resources are deployed in the `88-api` namespace

### Services
- **Backend Service**: ClusterIP service exposing port 3000
- **Frontend Service**: ClusterIP service exposing port 80

### Deployments
- **Backend**: 3 replicas with resource limits and health checks
- **Frontend**: 3 replicas with resource limits and health checks

### Ingress
- Routes traffic based on host and path
- Supports CORS for API access
- SSL termination (when configured)

### Autoscaling
- HorizontalPodAutoscaler for both services
- Scales based on CPU and memory usage
- Min: 2 replicas, Max: 10 replicas

## Prerequisites

### Local Development
```bash
# Install kubectl
brew install kubectl

# Install Docker Desktop with Kubernetes
# Or use minikube
brew install minikube
minikube start

# Install nginx-ingress
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml
```

### Production Requirements
- Kubernetes cluster (1.20+)
- nginx-ingress controller
- Container registry access
- Persistent storage provisioner

## Configuration

### Environment Variables

The application uses ConfigMaps and Secrets for configuration:

**ConfigMap (`k8s/configmap.yaml`)**:
- `NODE_ENV`: Production environment
- `PORT`: Backend port (3000)
- `DATABASE_URL`: SQLite database path
- `CORS_ORIGIN`: Allowed origins for CORS

**Secret (`k8s/secret.yaml`)**:
- `JWT_SECRET`: JWT signing secret
- `DATABASE_PASSWORD`: Database password

### Customization

1. **Update domains** in `k8s/ingress.yaml`:
   ```yaml
   - host: api.your-domain.com
   - host: your-domain.com
   ```

2. **Update secrets** in `k8s/secret.yaml`:
   ```bash
   echo -n "your-secret" | base64
   ```

3. **Adjust resource limits** in deployment files based on your needs

## Deployment

### Manual Deployment

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

### Automated Deployment

The GitHub Actions workflow automatically deploys on pushes to main:

1. Builds Docker images
2. Pushes to GitHub Container Registry
3. Updates Kubernetes manifests with new image tags
4. Applies manifests to cluster
5. Waits for deployment completion

## Monitoring & Health Checks

### Health Endpoints
- Backend: `GET /health`
- Frontend: `GET /health`

### Monitoring
- Liveness probes check if containers are running
- Readiness probes check if containers are ready to serve traffic
- Resource monitoring via HPA

### Logs
```bash
# View application logs
kubectl logs -f deployment/backend -n 88-api
kubectl logs -f deployment/frontend -n 88-api

# View ingress logs
kubectl logs -f deployment/ingress-nginx-controller -n ingress-nginx
```

## Troubleshooting

### Common Issues

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

### Debug Commands

```bash
# Port forward for local access
kubectl port-forward service/backend-service 3000:3000 -n 88-api
kubectl port-forward service/frontend-service 8080:80 -n 88-api

# Exec into containers
kubectl exec -it <pod-name> -n 88-api -- /bin/sh

# Check resource usage
kubectl top pods -n 88-api
kubectl top nodes
```

## Security Considerations

1. **Secrets Management**: Use external secret management (HashiCorp Vault, AWS Secrets Manager)
2. **Network Policies**: Implement network policies to restrict pod-to-pod communication
3. **RBAC**: Configure proper RBAC for service accounts
4. **TLS**: Enable TLS termination in ingress
5. **Image Security**: Use image scanning and signed images

## Scaling

### Horizontal Scaling
- Automatic scaling via HPA based on CPU/memory usage
- Manual scaling: `kubectl scale deployment backend --replicas=5 -n 88-api`

### Vertical Scaling
- Adjust resource requests/limits in deployment manifests
- Monitor resource usage and adjust accordingly

## Backup & Recovery

### Database Backup
```bash
# Backup SQLite database
kubectl exec <backend-pod> -n 88-api -- cp /app/data.db /tmp/backup.db
kubectl cp <backend-pod>:/tmp/backup.db ./backup.db -n 88-api
```

### Application Backup
- Docker images are stored in GitHub Container Registry
- Kubernetes manifests are version controlled
- Persistent volumes should be backed up separately

## Performance Optimization

1. **Resource Limits**: Monitor and adjust CPU/memory limits
2. **Image Optimization**: Use multi-stage builds and alpine images
3. **Caching**: Implement proper caching headers
4. **CDN**: Use CDN for static assets
5. **Database**: Consider migrating to PostgreSQL for production

## Cost Optimization

1. **Resource Limits**: Set appropriate resource requests/limits
2. **Autoscaling**: Use HPA to scale down during low traffic
3. **Spot Instances**: Use spot instances for non-critical workloads
4. **Storage**: Use appropriate storage classes based on performance needs 