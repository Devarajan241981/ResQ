"use client";

import { Bell, Heart, Info, MapPin, Megaphone, UserRound, Users } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useLanguage } from "@/lib/i18n/language-context";
import { apiFetch, extractErrorMessage } from "@/lib/api/client";
import type { Community, CommunityPost, PaginatedResponse } from "@/lib/api/types";

export function CommunityDetail({ communityId }: { communityId: string }) {
  const { authFetch, isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { t } = useLanguage();

  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [newPost, setNewPost] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [likingId, setLikingId] = useState<string | null>(null);

  useEffect(() => {
    // Wait for auth to resolve, then fetch with the authenticated client when
    // logged in so is_member / has_liked reflect THIS user. Fetching with the
    // anonymous apiFetch made a joined member see the "Join" button again on
    // reload, because the server computed membership against no user.
    if (authLoading) return;
    const fetcher = isAuthenticated ? authFetch : apiFetch;
    Promise.all([
      fetcher<Community>(`/community/${communityId}/`),
      fetcher<PaginatedResponse<CommunityPost>>(`/community/posts/?community=${communityId}`),
    ])
      .then(([communityData, postsData]) => {
        setCommunity(communityData);
        setPosts(postsData.results);
        setStatus("ready");
      })
      .catch((err) => {
        setError(extractErrorMessage(err));
        setStatus("error");
      });
  }, [communityId, authFetch, isAuthenticated, authLoading]);

  async function toggleMembership() {
    if (!community) return;
    setIsJoining(true);
    try {
      const action = community.is_member ? "leave" : "join";
      const updated = await authFetch<Community>(`/community/${communityId}/${action}/`, { method: "POST" });
      setCommunity(updated);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsJoining(false);
    }
  }

  async function handlePost(e: FormEvent) {
    e.preventDefault();
    setPostError(null);
    setIsPosting(true);
    try {
      const post = await authFetch<CommunityPost>("/community/posts/", {
        method: "POST",
        body: { community: communityId, content: newPost },
      });
      setPosts((prev) => [post, ...prev]);
      setNewPost("");
    } catch (err) {
      setPostError(extractErrorMessage(err));
    } finally {
      setIsPosting(false);
    }
  }

  async function toggleLike(post: CommunityPost) {
    setLikingId(post.id);
    try {
      const action = post.has_liked ? "unlike" : "like";
      const updated = await authFetch<CommunityPost>(`/community/posts/${post.id}/${action}/`, { method: "POST" });
      setPosts((prev) => prev.map((p) => (p.id === post.id ? updated : p)));
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLikingId(null);
    }
  }

  if (status === "loading") return <p className="text-foreground/70">{t("common.loading")}</p>;
  if (status === "error" || !community)
    return (
      <p role="alert" className="text-red-600">
        {error}
      </p>
    );

  const isOwner = user?.id === community.owner;
  // WhatsApp-style: oldest at the top, newest at the bottom near the composer.
  const timeline = [...posts].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  const guidelines: { icon: typeof Bell; key: "community.detail.guideline1" | "community.detail.guideline2" | "community.detail.guideline3" }[] = [
    { icon: Megaphone, key: "community.detail.guideline1" },
    { icon: Heart, key: "community.detail.guideline2" },
    { icon: Bell, key: "community.detail.guideline3" },
  ];

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 lg:flex-row lg:items-start">
      {/* Broadcast chat card */}
      <div className="flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-sm lg:flex-1">
        {/* Chat header bar */}
        <div className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#123a6b] text-sm font-semibold text-white">
            {community.name.trim().charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-semibold leading-tight">{community.name}</h1>
            <p className="truncate text-xs text-foreground/60">
              {community.member_count} {t("community.list.membersSuffix")}
              {community.city && ` · ${community.city}`}
            </p>
          </div>
          {!isOwner && (
            <button
              type="button"
              disabled={!isAuthenticated || isJoining}
              onClick={toggleMembership}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium disabled:opacity-50 ${
                community.is_member ? "border border-border hover:bg-background" : "bg-[#123a6b] text-white hover:opacity-90"
              }`}
            >
              {community.is_member ? t("community.detail.leaveButton") : t("community.detail.joinButton")}
            </button>
          )}
        </div>

        {/* Message timeline */}
        <div className="flex min-h-[24rem] flex-1 flex-col gap-3 bg-surface/60 px-4 py-4">
          <p className="mx-auto rounded-full bg-surface px-3 py-1 text-center text-xs text-foreground/50">
            {t("community.detail.broadcastNotice")}
          </p>
          {!isAuthenticated && (
            <p className="mx-auto text-center text-xs text-foreground/60">{t("community.detail.loginToJoin")}</p>
          )}

          {timeline.length === 0 && (
            <div className="m-auto flex flex-col items-center gap-2 py-8 text-center">
              <Megaphone className="h-10 w-10 text-foreground/25" aria-hidden />
              <p className="text-sm text-foreground/60">{t("community.detail.noPosts")}</p>
            </div>
          )}
          {timeline.map((post) => (
            <div key={post.id} className="flex max-w-[85%] flex-col self-start">
              <div className="rounded-2xl rounded-tl-sm border border-border bg-background px-3.5 py-2.5 shadow-sm">
                <p className="text-xs font-semibold text-[#138808]">{post.author_name}</p>
                <p className="mt-0.5 whitespace-pre-wrap text-sm">{post.content}</p>
                <p className="mt-1 text-right text-[10px] text-foreground/45">
                  {new Date(post.created_at).toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                disabled={!isAuthenticated || likingId === post.id}
                onClick={() => toggleLike(post)}
                className={`-mt-2 ml-2 self-start rounded-full border bg-background px-2 py-0.5 text-xs shadow-sm disabled:opacity-50 ${
                  post.has_liked ? "border-red-600 text-red-600" : "border-border text-foreground/60 hover:bg-surface"
                }`}
              >
                ♥ {post.like_count}
              </button>
            </div>
          ))}
        </div>

        {/* Composer pinned at the bottom — admin/owner only, like a WhatsApp announcement group */}
        {isOwner && (
          <form onSubmit={handlePost} className="border-t border-border bg-surface px-3 py-3">
            {postError && (
              <p role="alert" className="mb-2 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600">
                {postError}
              </p>
            )}
            <div className="flex items-end gap-2">
              <textarea
                required
                rows={1}
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder={t("community.detail.composerPlaceholder")}
                aria-label={t("community.detail.composerPlaceholder")}
                className="min-h-10 flex-1 resize-y rounded-2xl border border-border bg-background px-4 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={isPosting}
                className="shrink-0 rounded-full bg-[#138808] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {isPosting ? t("community.detail.posting") : t("community.detail.postButton")}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Info sidebar — fills the page and gives context */}
      <aside className="w-full space-y-4 lg:w-80 lg:shrink-0">
        <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
          <h2 className="flex items-center gap-2 font-semibold">
            <Info className="h-4 w-4 text-[#123a6b] dark:text-blue-400" aria-hidden />
            {t("community.detail.aboutHeading")}
          </h2>
          {community.description && (
            <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/70">{community.description}</p>
          )}
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex items-center gap-2 text-foreground/70">
              <Users className="h-4 w-4 shrink-0 text-foreground/45" aria-hidden />
              {community.member_count} {t("community.list.membersSuffix")}
            </div>
            {community.city && (
              <div className="flex items-center gap-2 text-foreground/70">
                <MapPin className="h-4 w-4 shrink-0 text-foreground/45" aria-hidden />
                {community.city}
              </div>
            )}
            <div className="flex items-center gap-2 text-foreground/70">
              <UserRound className="h-4 w-4 shrink-0 text-foreground/45" aria-hidden />
              {t("community.list.byPrefix")} {community.owner_name}
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-border bg-surface/50 p-4">
          <h2 className="font-semibold">{t("community.detail.guidelinesHeading")}</h2>
          <ul className="mt-3 space-y-2.5 text-sm text-foreground/70">
            {guidelines.map(({ icon: Icon, key }) => (
              <li key={key} className="flex gap-2.5">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#138808]" aria-hidden />
                <span>{t(key)}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
