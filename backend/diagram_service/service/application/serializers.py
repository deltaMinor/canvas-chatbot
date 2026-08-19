from rest_framework import serializers


class ProjectIdSerializer(serializers.Serializer):
    project_id = serializers.CharField(required=True)


class MessageSerializer(serializers.Serializer):
    message = serializers.CharField(help_text="Status message")


class CanvasIdSerializer(serializers.Serializer):
    canvas_id = serializers.CharField(required=True)


class DeleteCanvasRequestSerializer(ProjectIdSerializer, CanvasIdSerializer):
    pass


class DeleteCanvasResponseSerializer(MessageSerializer):
    data = serializers.BooleanField(
        allow_null=True, help_text="Data field, always null in this case"
    )


class GetDataFlowFilesResponseSerializer(MessageSerializer):
    data = serializers.DictField(
        child=serializers.ListField(child=serializers.FileField()),
        help_text="Dictionary containing a list of data flow files",
    )


class GetModuleRequestSerializer(ProjectIdSerializer):
    pass


class GetModuleResponseSerializer(MessageSerializer):
    data = serializers.FileField(help_text="Module directory zip file")


class GetNetworkFilesResponseSerializer(MessageSerializer):
    data = serializers.DictField(
        child=serializers.ListField(child=serializers.FileField()),
        help_text="Dictionary containing a list of network files",
    )


class GetProjectADResponseSerializer(MessageSerializer):
    data = serializers.SerializerMethodField()

    def get_data(self, obj):
        # Define the structure of the 'data' field based on the structure of 'db_ad'
        pass


class GetTerraformFilesResponseSerializer(MessageSerializer):
    data = serializers.DictField(
        child=serializers.ListField(child=serializers.FileField()),
        help_text="Dictionary containing a list of terraform files",
    )


class NetworkFileSerializer(serializers.Serializer):
    file_id = serializers.CharField(help_text="The unique identifier of the file.")
    file_name = serializers.CharField(help_text="The name of the file.")
    file_content = serializers.CharField(help_text="The content of the file.")


class PatchNodeToscaRequestSerializer(serializers.Serializer):
    node = serializers.CharField(required=True)


class PatchNodeToscaResponseSerializer(MessageSerializer):
    data = serializers.CharField(help_text="Updated node")


class PostDataFlowFilesRequestSerializer(ProjectIdSerializer, CanvasIdSerializer):
    file = serializers.FileField(required=True)


class PostDataFlowFilesResponseSerializer(MessageSerializer):
    data = serializers.CharField(help_text="Data field, always null in this case")


class PostNetworkFilesRequestSerializer(ProjectIdSerializer, CanvasIdSerializer):
    file = serializers.FileField(required=True)


class PostNetworkFilesResponseSerializer(MessageSerializer):
    data = serializers.CharField(help_text="Data field, always null in this case")


class PostProjectRequestSerializer(ProjectIdSerializer):
    pass


class PostProjectResponseSerializer(MessageSerializer):
    data = serializers.DictField(
        child=PostProjectRequestSerializer(), help_text="Updated project data"
    )


class UploadModuleRequestSerializer(ProjectIdSerializer):
    zip_file = serializers.FileField(required=True)


class UploadModuleResponseSerializer(MessageSerializer):
    data = serializers.BooleanField(
        allow_null=True, help_text="Data field, always null in this case"
    )


class UploadTerraformFilesRequestSerializer(ProjectIdSerializer):
    file = serializers.ListField(
        child=serializers.FileField(), help_text="List of terraform files"
    )


class UploadTerraformFilesResponseSerializer(MessageSerializer):
    data = serializers.BooleanField(
        allow_null=True, help_text="Data field, always null in this case"
    )


class DeleteTerraformFileRequestSerializer(ProjectIdSerializer):
    pass
