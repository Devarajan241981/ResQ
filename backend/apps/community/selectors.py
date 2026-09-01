"""Read-only queries for community. No mutation happens here — see services for the write path."""


def get_member_count(community_id) -> int:
    from apps.community.models import CommunityMembership

    return CommunityMembership.objects.filter(community_id=community_id).count()


def get_like_count(post_id) -> int:
    from apps.community.models import CommunityPostLike

    return CommunityPostLike.objects.filter(post_id=post_id).count()


def is_member(community_id, user_id) -> bool:
    from apps.community.models import CommunityMembership

    return CommunityMembership.objects.filter(community_id=community_id, user_id=user_id).exists()


def has_liked(post_id, user_id) -> bool:
    from apps.community.models import CommunityPostLike

    return CommunityPostLike.objects.filter(post_id=post_id, user_id=user_id).exists()
