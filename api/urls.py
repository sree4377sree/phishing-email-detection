from django.urls import path
from api import views

urlpatterns = [
    path('health/', views.HealthCheckAPIView.as_view(), name='api_health'),
    path('predict/', views.PredictEmailAPIView.as_view(), name='api_predict'),
    path('batch-predict/', views.BatchPredictAPIView.as_view(), name='api_batch_predict'),
    path('metrics/', views.ModelMetricsAPIView.as_view(), name='api_metrics'),
    path('history/', views.ScanHistoryAPIView.as_view(), name='api_history'),
    path('stats/', views.StatsSummaryAPIView.as_view(), name='api_stats'),
]
