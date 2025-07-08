from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework.validators import UniqueValidator
from django.core.validators import EmailValidator
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import UserProfile, VerificationToken

User = get_user_model()

# ✅ Custom JWT Token Serializer
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    # ✅ Declare both fields as optional
    email = serializers.CharField(required=False)
    username = serializers.CharField(required=False)
    password = serializers.CharField(write_only=True)
# ✅ Fix DRF field validation complaining about missing `username`
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['username'].required = False
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['email'] = user.email
        token['role'] = user.user_type
        return token

    def validate(self, attrs):
        print("Incoming login payload:", attrs)

        username_field = User.USERNAME_FIELD  # default is 'username'

        # ✅ Handle login via email
        if 'email' in attrs:
            try:
                user = User.objects.get(email=attrs['email'])
                attrs[username_field] = user.username
            except User.DoesNotExist:
                raise serializers.ValidationError({'email': 'User with this email does not exist'})
            del attrs['email']

        # ✅ Only check for username if not mapped
        if 'username' not in attrs:
            raise serializers.ValidationError({'email': 'Email is required for login.'})

        data = super().validate(attrs)
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'role': self.user.user_type,
        }
        return data


# ✅ User Serializer
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'user_type', 
                  'phone', 'profile_picture', 'date_of_birth', 'email_verified', 'phone_verified']
        read_only_fields = ['email_verified', 'phone_verified']

# ✅ Profile Serializer
class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'bio', 'website', 'gender']

# ✅ Register Serializer
class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True)
    shop_name = serializers.CharField(write_only=True, required=False)
    business_license = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password2', 
            'first_name', 'last_name', 'user_type', 'phone',
            'shop_name', 'business_license'  # Add shop owner fields
        ]
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'phone': {'required': True}
        }

    def validate(self, attrs):
        # Password match validation
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(
                {"password2": "Password fields didn't match."}
            )
        
        # Shop owner validation
        if attrs.get('user_type') == 'shop_owner':
            if not attrs.get('shop_name'):
                raise serializers.ValidationError(
                    {"shop_name": "Shop name is required for shop owners"}
                )
            if not attrs.get('business_license'):
                raise serializers.ValidationError(
                    {"business_license": "Business license is required for shop owners"}
                )
        
        return attrs

    def create(self, validated_data):
        # Remove unnecessary fields before user creation
        validated_data.pop('password2')
        shop_name = validated_data.pop('shop_name', None)
        business_license = validated_data.pop('business_license', None)
        
        # Create user
        user = User.objects.create_user(**validated_data)
        
        # Create shop if user is shop owner
        if validated_data['user_type'] == 'shop_owner':
            from shops.models import Shop  # Import your Shop model
            Shop.objects.create(
                owner=user,
                name=shop_name,
                business_license=business_license
            )
        
        return user# ✅ Change Password Serializer
class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])

# ✅ Token Serializer
class VerificationTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = VerificationToken
        fields = ['token', 'token_type', 'expires_at']
