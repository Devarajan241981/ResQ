from django.db import transaction

from apps.common.exceptions import NotEligibleError
from apps.community.models import Community, CommunityPost


def create_post(community: Community, author, content: str, image=None) -> CommunityPost:
    """Only the community's owner may post — this is a one-way broadcast channel, not a group chat."""
    if community.owner_id != author.id:
        raise NotEligibleError("Only the community's owner can post here.")

    post = CommunityPost.objects.create(community=community, author=author, content=content, image=image)
    transaction.on_commit(lambda: _notify_members(post))
    return post


def _notify_members(post: CommunityPost) -> None:
    from apps.community.models import CommunityMembership
    from apps.notifications.models import NotificationType
    from apps.notifications.tasks import broadcast_geo_alert

    member_ids = list(
        CommunityMembership.objects.filter(community_id=post.community_id).values_list("user_id", flat=True)
    )
    if member_ids:
        broadcast_geo_alert.delay(
            [str(uid) for uid in member_ids],
            NotificationType.COMMUNITY_POST,
            f"New post in {post.community.name}",
            post.content[:140],
            {"community_id": str(post.community_id), "post_id": str(post.id)},
        )
