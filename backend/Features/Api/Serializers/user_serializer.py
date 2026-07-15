# [Layer: Api/Serializers] — user_serializer.py

from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()
    is_online = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name",
                  "is_active", "is_staff", "date_joined", "avatar_url", "is_online"]
        read_only_fields = ["id", "date_joined"]

    def get_is_online(self, obj):
        from django.utils import timezone
        if obj.last_active and (timezone.now() - obj.last_active).total_seconds() < 60:
            return True
        return False

    def get_avatar_url(self, obj):
        request = self.context.get("request")
        if obj.avatar and hasattr(obj.avatar, "url"):
            # Always return relative URL so frontend proxy handles it, fixing cross-device broken images
            return obj.avatar.url
        return None

class UserCreateUpdateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    avatar = serializers.ImageField(required=False, allow_null=True)

    def validate_password(self, value):
        from django.contrib.auth.password_validation import validate_password
        validate_password(value)
        return value

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name",
                  "is_active", "is_staff", "password", "avatar"]

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        validated_data["is_staff"] = True
        user = super().create(validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user
