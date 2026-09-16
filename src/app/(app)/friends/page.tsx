"use client";

import {
  acceptFriendRequest,
  fetchFriends,
  fetchIncomingRequests,
  fetchMyProfile,
  fetchOutgoingRequests,
  removeFriendship,
  searchProfile,
  sendFriendRequest,
  type Friend,
  type FriendRequest,
} from "@/lib/friends";
import type { Profile } from "@/lib/types";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export default function FriendsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [incoming, setIncoming] = useState<FriendRequest[]>([]);
  const [outgoing, setOutgoing] = useState<FriendRequest[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [searchResult, setSearchResult] = useState<Profile | null | undefined>(undefined);
  const [searching, setSearching] = useState(false);

  const loadAll = useCallback(async () => {
    try {
      const [me, friendRows, incomingRows, outgoingRows] = await Promise.all([
        fetchMyProfile(),
        fetchFriends(),
        fetchIncomingRequests(),
        fetchOutgoingRequests(),
      ]);
      setProfile(me);
      setFriends(friendRows);
      setIncoming(incomingRows);
      setOutgoing(outgoingRows);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "정보를 불러오지 못했어요.");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch sets state after awaiting
    loadAll();
  }, [loadAll]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setSearching(true);
    try {
      const result = await searchProfile(trimmed);
      setSearchResult(result);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "검색하지 못했어요.");
    } finally {
      setSearching(false);
    }
  }

  async function handleSendRequest(addresseeId: string) {
    try {
      await sendFriendRequest(addresseeId);
      setSearchResult(null);
      setQuery("");
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "친구 요청을 보내지 못했어요.");
    }
  }

  async function handleAccept(id: string) {
    setIncoming((prev) => prev.filter((r) => r.id !== id));
    try {
      await acceptFriendRequest(id);
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "수락하지 못했어요.");
      loadAll();
    }
  }

  async function handleDecline(id: string) {
    setIncoming((prev) => prev.filter((r) => r.id !== id));
    try {
      await removeFriendship(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "거절하지 못했어요.");
      loadAll();
    }
  }

  async function handleCancel(id: string) {
    setOutgoing((prev) => prev.filter((r) => r.id !== id));
    try {
      await removeFriendship(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "취소하지 못했어요.");
      loadAll();
    }
  }

  async function handleRemoveFriend(id: string) {
    setFriends((prev) => prev.filter((f) => f.friendshipId !== id));
    try {
      await removeFriendship(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "삭제하지 못했어요.");
      loadAll();
    }
  }

  const isAlreadyRelated = (id: string) =>
    friends.some((f) => f.profile.id === id) ||
    incoming.some((r) => r.profile.id === id) ||
    outgoing.some((r) => r.profile.id === id);

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl space-y-5">
        <header className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800">친구</h1>
          {error && (
            <span className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-500">
              {error}
            </span>
          )}
        </header>

        {profile && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">
              내 닉네임: <span className="font-medium text-slate-700">{profile.nickname}</span>
            </p>
            <p className="mt-1 text-sm text-slate-500">
              내 회원 코드:{" "}
              <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono font-medium text-slate-700">
                {profile.friend_code}
              </span>
            </p>
            <p className="mt-2 text-xs text-slate-400">
              친구에게 닉네임이나 회원 코드를 알려주면 나를 찾아 친구 요청을 보낼 수 있어요.
            </p>
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">친구 찾기</h2>
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="닉네임 또는 회원 코드"
              className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
            <button
              type="submit"
              disabled={searching}
              className="flex-shrink-0 rounded-lg bg-indigo-500 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600 disabled:opacity-60"
            >
              검색
            </button>
          </form>

          {searchResult !== undefined && (
            <div className="mt-3">
              {searchResult === null ? (
                <p className="text-sm text-slate-400">일치하는 사용자를 찾지 못했어요.</p>
              ) : (
                <div className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      {searchResult.nickname}
                    </p>
                    <p className="font-mono text-xs text-slate-400">
                      {searchResult.friend_code}
                    </p>
                  </div>
                  {isAlreadyRelated(searchResult.id) ? (
                    <span className="text-xs text-slate-400">이미 친구이거나 요청 중이에요</span>
                  ) : (
                    <button
                      onClick={() => handleSendRequest(searchResult.id)}
                      className="rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-600"
                    >
                      친구 요청
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {incoming.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">받은 친구 요청</h2>
            <ul className="space-y-1.5">
              {incoming.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5"
                >
                  <span className="text-sm text-slate-700">{r.profile.nickname}</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleAccept(r.id)}
                      className="rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-600"
                    >
                      수락
                    </button>
                    <button
                      onClick={() => handleDecline(r.id)}
                      className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-200"
                    >
                      거절
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {outgoing.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">보낸 친구 요청</h2>
            <ul className="space-y-1.5">
              {outgoing.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5"
                >
                  <span className="text-sm text-slate-700">{r.profile.nickname}</span>
                  <button
                    onClick={() => handleCancel(r.id)}
                    className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-200"
                  >
                    취소
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">내 친구</h2>
          {friends.length === 0 ? (
            <p className="text-sm text-slate-400">아직 친구가 없어요.</p>
          ) : (
            <ul className="space-y-1.5">
              {friends.map((f) => (
                <li
                  key={f.friendshipId}
                  className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5"
                >
                  <span className="text-sm text-slate-700">{f.profile.nickname}</span>
                  <div className="flex gap-1.5">
                    <Link
                      href={`/friends/${f.profile.id}`}
                      className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-100"
                    >
                      할 일 보기
                    </Link>
                    <button
                      onClick={() => handleRemoveFriend(f.friendshipId)}
                      className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-200"
                    >
                      삭제
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
