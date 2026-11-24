from rest_framework import serializers
from Remote_User.models import detect_phishing_email, ClientRegister_Model


class EmailScanRequestSerializer(serializers.Serializer):
    sender = serializers.CharField(required=False, allow_blank=True, default="")
    receiver = serializers.CharField(required=False, allow_blank=True, default="")
    subject = serializers.CharField(required=False, allow_blank=True, default="")
    body = serializers.CharField(required=True, allow_blank=False)


class BatchScanRequestSerializer(serializers.Serializer):
    emails = serializers.ListField(
        child=EmailScanRequestSerializer(),
        allow_empty=False,
        max_length=50
    )


class DetectPhishingEmailRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = detect_phishing_email
        fields = ['id', 'sender', 'receiver', 'edate', 'subject', 'body', 'Prediction']


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientRegister_Model
        fields = ['id', 'username', 'email', 'phoneno', 'country', 'state', 'city', 'address', 'gender']
