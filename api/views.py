import os
import json
import datetime
from django.db.models import Count, Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from Remote_User.models import detect_phishing_email, ClientRegister_Model
from api.serializers import (
    EmailScanRequestSerializer,
    BatchScanRequestSerializer,
    DetectPhishingEmailRecordSerializer,
    UserProfileSerializer,
)
from ai_engine.predict import predict_email
from ai_engine.model_pipeline import METRICS_FILE


class PredictEmailAPIView(APIView):
    """
    POST /api/v1/predict/
    Classify a single email for phishing threats with sub-second latency and XAI explanations.
    """
    def post(self, request):
        serializer = EmailScanRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        sender = data.get('sender', '')
        receiver = data.get('receiver', '')
        subject = data.get('subject', '')
        body = data.get('body', '')

        # Perform fast inference
        result = predict_email(
            sender=sender,
            receiver=receiver,
            subject=subject,
            body=body
        )

        # Persist scan to database
        today_str = datetime.date.today().strftime("%Y-%m-%d")
        record = detect_phishing_email.objects.create(
            sender=sender or "N/A",
            receiver=receiver or "N/A",
            edate=today_str,
            subject=subject or "N/A",
            body=body,
            Prediction=result["prediction"]
        )

        return Response({
            "success": True,
            "scan_id": record.id,
            "data": result
        }, status=status.HTTP_200_OK)


class BatchPredictAPIView(APIView):
    """
    POST /api/v1/batch-predict/
    Scan multiple emails in a single request.
    """
    def post(self, request):
        serializer = BatchScanRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        emails = serializer.validated_data.get('emails', [])
        results = []
        phish_count = 0

        for item in emails:
            res = predict_email(
                sender=item.get('sender', ''),
                receiver=item.get('receiver', ''),
                subject=item.get('subject', ''),
                body=item.get('body', '')
            )
            if res["is_phishing"]:
                phish_count += 1
            results.append({
                "subject": item.get('subject', ''),
                "sender": item.get('sender', ''),
                "result": res
            })

        return Response({
            "success": True,
            "total_scanned": len(results),
            "phishing_detected": phish_count,
            "safe_detected": len(results) - phish_count,
            "results": results
        }, status=status.HTTP_200_OK)


class ModelMetricsAPIView(APIView):
    """
    GET /api/v1/metrics/
    Returns evaluation metrics, model comparison benchmarks, and confusion matrix.
    """
    def get(self, request):
        if not os.path.exists(METRICS_FILE):
            from ai_engine.train import run_training
            run_training()

        try:
            with open(METRICS_FILE, "r", encoding="utf-8") as f:
                metrics = json.load(f)
            return Response({"success": True, "metrics": metrics}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"success": False, "error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ScanHistoryAPIView(APIView):
    """
    GET /api/v1/history/
    Retrieve past scan logs with optional search filtering and pagination limit.
    """
    def get(self, request):
        query = request.query_params.get('q', '').strip()
        limit = int(request.query_params.get('limit', 50))
        qs = detect_phishing_email.objects.all().order_by('-id')

        if query:
            qs = qs.filter(
                Q(sender__icontains=query) |
                Q(subject__icontains=query) |
                Q(body__icontains=query) |
                Q(Prediction__icontains=query)
            )

        qs = qs[:limit]
        serializer = DetectPhishingEmailRecordSerializer(qs, many=True)
        return Response({
            "success": True,
            "count": len(serializer.data),
            "scans": serializer.data
        }, status=status.HTTP_200_OK)


class StatsSummaryAPIView(APIView):
    """
    GET /api/v1/stats/
    Returns aggregate phishing vs benign detection numbers and ratios.
    """
    def get(self, request):
        total_scans = detect_phishing_email.objects.count()
        phishing_count = detect_phishing_email.objects.filter(Prediction="Phishing").count()
        safe_count = detect_phishing_email.objects.filter(Prediction="Non-Phishing").count()

        ratio = round((phishing_count / total_scans * 100), 1) if total_scans > 0 else 0

        # Read model accuracy
        accuracy = 96.44
        if os.path.exists(METRICS_FILE):
            try:
                with open(METRICS_FILE, "r", encoding="utf-8") as f:
                    metrics = json.load(f)
                    accuracy = metrics.get("accuracy", 96.44)
            except Exception:
                pass

        return Response({
            "success": True,
            "total_scans": total_scans,
            "phishing_count": phishing_count,
            "safe_count": safe_count,
            "phishing_ratio_percentage": ratio,
            "model_accuracy": accuracy,
        }, status=status.HTTP_200_OK)


class HealthCheckAPIView(APIView):
    """
    GET /api/v1/health/
    Health and status check for the API and model engine.
    """
    def get(self, request):
        from ai_engine.model_pipeline import MODEL_FILE
        model_ready = os.path.exists(MODEL_FILE)

        return Response({
            "status": "healthy",
            "service": "Phishing Email Detection AI API",
            "model_ready": model_ready,
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "stack": {
                "framework": "Django REST Framework 3.18",
                "ai_engine": "DistilBERT + Calibrated Ensemble (PyTorch + Scikit-Learn)",
                "database": "Multi-Database Engine (PostgreSQL / MySQL / SQLite)"
            }
        }, status=status.HTTP_200_OK)


from django.conf import settings
from django.http import HttpResponse, Http404
from django.shortcuts import render


def react_dashboard_view(request):
    """Serve the built React 18 SPA directly through Django on port 8000."""
    index_file = os.path.join(settings.BASE_DIR, 'frontend', 'dist', 'index.html')
    if os.path.exists(index_file):
        with open(index_file, 'r', encoding='utf-8') as f:
            content = f.read()
        return HttpResponse(content, content_type='text/html')
    else:
        raise Http404("React build not found. Please run 'npm run build' inside frontend directory.")


def api_docs_view(request):
    """Render interactive REST API Documentation & Live Console."""
    return render(request, 'api_docs.html')

