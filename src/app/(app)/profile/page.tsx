"use client";

import Avatar from "@/components/Avatar";
import {
  fetchMyProfile,
  notifyProfileUpdated,
  removeMyAvatar,
  updateMyProfile,
  uploadMyAvatar,
} from "@/lib/friends";
import type { Profile } from "@/lib/types";
import { useEffect, useRef, useState } from "react";

const BIO_MAX = 150;

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMyProfile()
      .then((p) => {
        setProfile(p);
        setNickname(p.nickname);
        setBio(p.bio ?? "");
      })
      .catch((e) =>
        setError(e instanceof Error ? e.message : "프로필을 불러오지 못했어요.")
      );
  }, []);

  function applyProfile(updated: Profile, message: string) {
    setProfile(updated);
    notifyProfileUpdated(updated);
    setNotice(message);
    setError(null);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const trimmedNickname = nickname.trim();
    if (trimmedNickname.length < 2 || trimmedNickname.length > 20) {
      setError("닉네임은 2~20자로 입력해주세요.");
      return;
    }
    setSaving(true);
    try {
      const updated = await updateMyProfile({
        nickname: trimmedNickname,
        bio: bio.trim(),
      });
      setNickname(updated.nickname);
      setBio(updated.bio);
      applyProfile(updated, "프로필을 저장했어요.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "프로필을 저장하지 못했어요.");
    } finally {
      setSaving(false);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("이미지 파일만 올릴 수 있어요.");
      return;
    }
    setUploading(true);
    try {
      applyProfile(await uploadMyAvatar(file), "프로필 사진을 바꿨어요.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "사진을 올리지 못했어요.");
    } finally {
      setUploading(false);
    }
  }

  async function handleRemoveAvatar() {
    setUploading(true);
    try {
      applyProfile(await removeMyAvatar(), "프로필 사진을 지웠어요.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "사진을 지우지 못했어요.");
    } finally {
      setUploading(false);
    }
  }

  const dirty =
    profile !== null &&
    (nickname.trim() !== profile.nickname || bio.trim() !== (profile.bio ?? ""));

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl space-y-5">
        <header className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800">내 프로필</h1>
          {error ? (
            <span className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-500">
              {error}
            </span>
          ) : (
            notice && (
              <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-600">
                {notice}
              </span>
            )
          )}
        </header>

        {profile && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-6 flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="group relative rounded-full disabled:opacity-60"
                aria-label="프로필 사진 변경"
              >
                <Avatar profile={profile} size={96} />
                <span className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-900/40 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {uploading ? "올리는 중..." : "사진 변경"}
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-100 disabled:opacity-60"
                >
                  {profile.avatar_url ? "사진 변경" : "사진 추가"}
                </button>
                {profile.avatar_url && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    disabled={uploading}
                    className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-200 disabled:opacity-60"
                  >
                    사진 삭제
                  </button>
                )}
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label htmlFor="nickname" className="mb-1 block text-xs font-medium text-slate-500">
                  닉네임
                </label>
                <input
                  id="nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  minLength={2}
                  maxLength={20}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <div className="mb-1 flex items-baseline justify-between">
                  <label htmlFor="bio" className="text-xs font-medium text-slate-500">
                    소개
                  </label>
                  <span className="text-xs text-slate-400">
                    {bio.length}/{BIO_MAX}
                  </span>
                </div>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={BIO_MAX}
                  rows={3}
                  placeholder="친구들에게 보여줄 소개를 적어보세요"
                  className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  회원 코드{" "}
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono font-medium text-slate-700">
                    {profile.friend_code}
                  </span>
                </p>
                <button
                  type="submit"
                  disabled={saving || !dirty}
                  className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {saving ? "저장 중..." : "저장"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
