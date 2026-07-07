from django.contrib.auth import authenticate, get_user_model
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from apps.accounts.serializers import (
    DeviceSessionSerializer,
    EmailLoginSerializer,
    GoogleLoginSerializer,
    OTPRequestSerializer,
    OTPVerifySerializer,
    RegisterSerializer,
    UserSerializer,
)
from apps.accounts.services import device_session_service, google_service, otp_service
from apps.common.exceptions import DomainError

User = get_user_model()


def _auth_response(user, request) -> dict:
    tokens = device_session_service.issue_tokens(user, request)
    return {**tokens, "user": UserSerializer(user).data}


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth"

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(_auth_response(user, request), status=status.HTTP_201_CREATED)


class EmailLoginView(APIView):
    serializer_class = EmailLoginSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth"

    def post(self, request):
        serializer = EmailLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = authenticate(
            request,
            username=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
        )
        if user is None:
            return Response({"detail": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(_auth_response(user, request))


class OTPRequestView(APIView):
    serializer_class = OTPRequestSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "otp"

    def post(self, request):
        serializer = OTPRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            otp_service.generate_and_send_otp(**serializer.validated_data)
        except DomainError as exc:
            return Response({"detail": exc.message}, status=exc.status_code)
        return Response({"detail": "OTP sent."})


class OTPVerifyView(APIView):
    serializer_class = OTPVerifySerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "otp"

    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            otp_service.verify_otp(data["phone"], data["code"], data["purpose"])
        except DomainError as exc:
            return Response({"detail": exc.message}, status=exc.status_code)

        user, created = User.objects.get_or_create(
            phone=data["phone"],
            defaults={"full_name": data.get("full_name", ""), "is_verified": True},
        )
        if not created and not user.is_verified:
            user.is_verified = True
            user.save(update_fields=["is_verified"])

        return Response(_auth_response(user, request), status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class GoogleLoginView(APIView):
    serializer_class = GoogleLoginSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth"

    def post(self, request):
        serializer = GoogleLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            profile = google_service.verify_google_id_token(serializer.validated_data["id_token"])
        except DomainError as exc:
            return Response({"detail": exc.message}, status=exc.status_code)

        user, created = User.objects.get_or_create(
            email=profile["email"],
            defaults={
                "full_name": profile["full_name"],
                "google_sub": profile["sub"],
                "is_verified": profile["email_verified"],
            },
        )
        if not created and not user.google_sub:
            user.google_sub = profile["sub"]
            user.save(update_fields=["google_sub"])

        return Response(_auth_response(user, request), status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class DeviceSessionViewSet(generics.ListAPIView):
    serializer_class = DeviceSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.device_sessions.filter(is_active=True)


class DeviceSessionRevokeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, session_id):
        try:
            device_session_service.revoke_session(request.user, session_id)
        except DomainError as exc:
            return Response({"detail": exc.message}, status=exc.status_code)
        return Response({"detail": "Session revoked."})
