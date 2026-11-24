"""phishinggnn URL Configuration"""
import os
from django.contrib import admin
from django.urls import path, re_path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve

from Remote_User import views as remoteuser
from Service_Provider import views as serviceprovider
from api import views as api_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('react/', api_views.react_dashboard_view, name="react_dashboard"),
    re_path(r'^react/assets/(?P<path>.*)$', serve, {'document_root': os.path.join(settings.BASE_DIR, 'frontend', 'dist', 'assets')}),
    path('api/docs/', api_views.api_docs_view, name="api_docs"),
    path('api/', api_views.api_docs_view, name="api_home"),
    path('api/v1/', include('api.urls')),
    path('', remoteuser.login, name="login"),
    path('Register1/', remoteuser.Register1, name="Register1"),
    path('Detect_Email_Phishing_Detection_Status/', remoteuser.Detect_Email_Phishing_Detection_Status, name="Detect_Email_Phishing_Detection_Status"),
    path('ViewYourProfile/', remoteuser.ViewYourProfile, name="ViewYourProfile"),
    path('serviceproviderlogin/', serviceprovider.serviceproviderlogin, name="serviceproviderlogin"),
    path('View_Remote_Users/', serviceprovider.View_Remote_Users, name="View_Remote_Users"),
    re_path(r'^charts/(?P<chart_type>\w+)', serviceprovider.charts, name="charts"),
    re_path(r'^charts1/(?P<chart_type>\w+)', serviceprovider.charts1, name="charts1"),
    re_path(r'^likeschart/(?P<like_chart>\w+)', serviceprovider.likeschart, name="likeschart"),
    path('View_Detected_Email_Phishing_Detection_Status_Ratio/', serviceprovider.View_Detected_Email_Phishing_Detection_Status_Ratio, name="View_Detected_Email_Phishing_Detection_Status_Ratio"),
    path('train_model/', serviceprovider.train_model, name="train_model"),
    path('View_Detected_Email_Phishing_Detection_Status_Type/', serviceprovider.View_Detected_Email_Phishing_Detection_Status_Type, name="View_Detected_Email_Phishing_Detection_Status_Type"),
    path('Download_Predicted_DataSets/', serviceprovider.Download_Predicted_DataSets, name="Download_Predicted_DataSets"),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
