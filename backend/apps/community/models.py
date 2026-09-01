from django.db import models

from apps.common.models import BaseModel


class Community(BaseModel):
    """A broadcast channel: the owner (verified NGO/admin) posts updates, members join to receive them."""

    owner = models.ForeignKey("accounts.User", on_delete=models.CASCADE, related_name="communities_owned")
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    banner_image = models.ImageField(upload_to="community/banners/", null=True, blank=True)
    city = models.CharField(max_length=100, blank=True, db_index=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = "communities"
        indexes = [models.Index(fields=["is_active"])]

    def __str__(self):
        return self.name


class CommunityMembership(BaseModel):
    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name="memberships")
    user = models.ForeignKey("accounts.User", on_delete=models.CASCADE, related_name="community_memberships")

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["community", "user"], name="unique_community_membership"),
        ]

    def __str__(self):
        return f"{self.user_id} in {self.community_id}"


class CommunityPost(BaseModel):
    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name="posts")
    author = models.ForeignKey("accounts.User", on_delete=models.CASCADE, related_name="community_posts")
    content = models.TextField()
    image = models.ImageField(upload_to="community/posts/", null=True, blank=True)

    class Meta:
        indexes = [models.Index(fields=["community", "created_at"])]

    def __str__(self):
        return f"{self.community_id}: {self.content[:40]}"


class CommunityPostLike(BaseModel):
    post = models.ForeignKey(CommunityPost, on_delete=models.CASCADE, related_name="likes")
    user = models.ForeignKey("accounts.User", on_delete=models.CASCADE, related_name="community_post_likes")

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["post", "user"], name="unique_community_post_like"),
        ]
