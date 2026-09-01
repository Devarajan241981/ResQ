from rest_framework import serializers

from apps.tts.services import SARVAM_LANGUAGES


class TtsQuerySerializer(serializers.Serializer):
    # The assistant only ever speaks short replies; cap length so a bad request
    # can't run up provider costs.
    text = serializers.CharField(max_length=1000, trim_whitespace=True)
    language = serializers.ChoiceField(choices=sorted(SARVAM_LANGUAGES.keys()), default="en")
