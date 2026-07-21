echo "Starting JRMSU Library Kubernetes Cluster..."
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/database.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend-admin.yaml
kubectl apply -f k8s/frontend-webpage.yaml
kubectl apply -f k8s/hpa.yaml
kubectl apply -f k8s/ingress.yaml
echo "Cluster started! Checking HPA..."
kubectl get hpa -n jrmsu-library
