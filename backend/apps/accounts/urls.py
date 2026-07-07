from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from apps.accounts import views

app_name = "accounts"

urlpatterns = [
    path("register/", views.RegisterView.as_view(), name="register"),
    path("login/", views.EmailLoginView.as_view(), name="login"),
    path("otp/request/", views.OTPRequestView.as_view(), name="otp-request"),
    path("otp/verify/", views.OTPVerifyView.as_view(), name="otp-verify"),
    path("google/", views.GoogleLoginView.as_view(), name="google-login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("me/", views.MeView.as_view(), name="me"),
    path("sessions/", views.DeviceSessionViewSet.as_view(), name="sessions"),
    path("sessions/<uuid:session_id>/revoke/", views.DeviceSessionRevokeView.as_view(), name="session-revoke"),
]
