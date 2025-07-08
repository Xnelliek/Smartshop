from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from rest_framework.views import APIView

from django.contrib.auth import get_user_model
from .models import UserProfile, VerificationToken
from .serializers import (UserSerializer, UserProfileSerializer, RegisterSerializer, 
                         ChangePasswordSerializer, VerificationTokenSerializer, 
                         CustomTokenObtainPairSerializer)
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.core.mail import send_mail
from django.conf import settings
import random
import string
from datetime import timedelta
from django.utils import timezone

from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer



User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_permissions(self):
        if self.action in ['retrieve', 'update', 'partial_update']:
            return [permissions.IsAuthenticated()]
        return super().get_permissions()

    def get_object(self):
        if self.kwargs.get('pk') == 'me':
            if not self.request.user.is_authenticated:
                from rest_framework.exceptions import NotAuthenticated
                raise NotAuthenticated("Authentication required to access your user object.")
            return self.request.user
        return super().get_object()
    
#    def get_object(self):
#        if self.kwargs.get('pk') == 'me':
#            return self.request.user
#        return super().get_object()
#
class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_object(self):
        if not self.request.user.is_authenticated:
            from rest_framework.exceptions import NotAuthenticated
            raise NotAuthenticated("Authentication required to access profile.")
        profile, _ = UserProfile.objects.get_or_create(user=self.request.user)
        return profile
    
#    def get_object(self):
#        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
#        return profile
#
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

class ChangePasswordView(generics.UpdateAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        
        if not user.check_password(serializer.data.get('old_password')):
            return Response({"old_password": ["Wrong password."]}, status=status.HTTP_400_BAD_REQUEST)
        
        user.set_password(serializer.data.get('new_password'))
        user.save()
        return Response({"message": "Password updated successfully."}, status=status.HTTP_200_OK)

class SendVerificationEmailView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        token = ''.join(random.choices(string.ascii_letters + string.digits, k=32))
        expires_at = timezone.now() + timedelta(hours=24)
        
        VerificationToken.objects.filter(user=user, token_type='email').delete()
        VerificationToken.objects.create(
            user=user,
            token=token,
            token_type='email',
            expires_at=expires_at
        )
        
        verification_link = f"{settings.FRONTEND_URL}/verify-email?token={token}"
        send_mail(
            'Verify your email',
            f'Please click the following link to verify your email: {verification_link}',
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
        
        return Response({"message": "Verification email sent."}, status=status.HTTP_200_OK)

class VerifyEmailView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        token = request.data.get('token')
        try:
            verification_token = VerificationToken.objects.get(
                user=request.user,
                token=token,
                token_type='email',
                is_used=False,
                expires_at__gt=timezone.now()
            )
            request.user.email_verified = True
            request.user.save()
            verification_token.is_used = True
            verification_token.save()
            return Response({"message": "Email verified successfully."}, status=status.HTTP_200_OK)
        except VerificationToken.DoesNotExist:
            return Response({"error": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)