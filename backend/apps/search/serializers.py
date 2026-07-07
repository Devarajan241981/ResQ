from rest_framework import serializers


class SearchQuerySerializer(serializers.Serializer):
    q = serializers.CharField(min_length=2)
    limit = serializers.IntegerField(required=False, default=20, min_value=1, max_value=100)
