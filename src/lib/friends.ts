import { supabase } from "./supabaseClient";
import type { Category, Friendship, Profile, Todo } from "./types";

export type FriendRequest = Friendship & { profile: Profile };
export type Friend = { friendshipId: string; profile: Profile };

async function getCurrentUserId(): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요해요.");
  return user.id;
}

async function profilesByIds(ids: string[]): Promise<Map<string, Profile>> {
  if (ids.length === 0) return new Map();
  const { data, error } = await supabase.from("profiles").select("*").in("id", ids);
  if (error) throw error;
  return new Map((data ?? []).map((p) => [p.id, p]));
}

export async function fetchMyProfile(): Promise<Profile> {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
}

export async function searchProfile(query: string): Promise<Profile | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;
  const userId = await getCurrentUserId();

  const byNickname = await supabase
    .from("profiles")
    .select("*")
    .ilike("nickname", trimmed)
    .neq("id", userId)
    .maybeSingle();
  if (byNickname.error) throw byNickname.error;
  if (byNickname.data) return byNickname.data;

  const byCode = await supabase
    .from("profiles")
    .select("*")
    .ilike("friend_code", trimmed)
    .neq("id", userId)
    .maybeSingle();
  if (byCode.error) throw byCode.error;
  return byCode.data;
}

export async function sendFriendRequest(addresseeId: string): Promise<void> {
  const userId = await getCurrentUserId();
  const { error } = await supabase
    .from("friendships")
    .insert({ requester_id: userId, addressee_id: addresseeId });
  if (error) throw error;
}

export async function fetchIncomingRequests(): Promise<FriendRequest[]> {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("friendships")
    .select("*")
    .eq("addressee_id", userId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  if (error) throw error;
  const rows = data ?? [];
  const profiles = await profilesByIds(rows.map((r) => r.requester_id));
  return rows
    .filter((r) => profiles.has(r.requester_id))
    .map((r) => ({ ...r, profile: profiles.get(r.requester_id)! }));
}

export async function fetchOutgoingRequests(): Promise<FriendRequest[]> {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("friendships")
    .select("*")
    .eq("requester_id", userId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  if (error) throw error;
  const rows = data ?? [];
  const profiles = await profilesByIds(rows.map((r) => r.addressee_id));
  return rows
    .filter((r) => profiles.has(r.addressee_id))
    .map((r) => ({ ...r, profile: profiles.get(r.addressee_id)! }));
}

export async function fetchFriends(): Promise<Friend[]> {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("friendships")
    .select("*")
    .eq("status", "accepted")
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);
  if (error) throw error;
  const rows = data ?? [];
  const otherIds = rows.map((r) => (r.requester_id === userId ? r.addressee_id : r.requester_id));
  const profiles = await profilesByIds(otherIds);
  return rows
    .map((r) => {
      const otherId = r.requester_id === userId ? r.addressee_id : r.requester_id;
      const profile = profiles.get(otherId);
      return profile ? { friendshipId: r.id, profile } : null;
    })
    .filter((f): f is Friend => f !== null);
}

export async function acceptFriendRequest(friendshipId: string): Promise<void> {
  const { error } = await supabase
    .from("friendships")
    .update({ status: "accepted", responded_at: new Date().toISOString() })
    .eq("id", friendshipId);
  if (error) throw error;
}

export async function removeFriendship(friendshipId: string): Promise<void> {
  const { error } = await supabase.from("friendships").delete().eq("id", friendshipId);
  if (error) throw error;
}

export async function fetchFriendProfile(friendId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", friendId)
    .single();
  if (error) throw error;
  return data;
}

export async function fetchFriendCategories(friendId: string): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", friendId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchFriendTodosInRange(
  friendId: string,
  startDate: string,
  endDate: string
): Promise<Todo[]> {
  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .eq("user_id", friendId)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

const AVATAR_BUCKET = "avatars";
const AVATAR_SIZE = 256;

export async function updateMyProfile(
  updates: Partial<Pick<Profile, "nickname" | "bio" | "avatar_url">>
): Promise<Profile> {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();
  if (error) {
    // profiles_nickname_lower_idx: nickname is unique (case-insensitive).
    if (error.code === "23505") throw new Error("이미 사용 중인 닉네임이에요.");
    throw error;
  }
  return data;
}

// Center-crops and downsizes the picked image to a small square JPEG so
// uploads stay tiny regardless of how large the original photo is.
async function toAvatarBlob(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = AVATAR_SIZE;
  canvas.height = AVATAR_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("이미지를 처리하지 못했어요.");
  ctx.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    AVATAR_SIZE,
    AVATAR_SIZE
  );
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("이미지를 처리하지 못했어요."))),
      "image/jpeg",
      0.85
    )
  );
}

export async function uploadMyAvatar(file: File): Promise<Profile> {
  const userId = await getCurrentUserId();
  const blob = await toAvatarBlob(file);
  const fileName = `avatar-${Date.now()}.jpg`;
  const path = `${userId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, blob, { contentType: "image/jpeg" });
  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  const profile = await updateMyProfile({ avatar_url: publicUrl });
  await removeAvatarFiles(userId, fileName);
  return profile;
}

export async function removeMyAvatar(): Promise<Profile> {
  const userId = await getCurrentUserId();
  const profile = await updateMyProfile({ avatar_url: null });
  await removeAvatarFiles(userId);
  return profile;
}

// Best-effort cleanup of previous avatar files; a failure here shouldn't
// fail the profile change itself.
async function removeAvatarFiles(userId: string, keepFileName?: string) {
  const { data } = await supabase.storage.from(AVATAR_BUCKET).list(userId);
  const stale = (data ?? [])
    .filter((f) => f.name !== keepFileName)
    .map((f) => `${userId}/${f.name}`);
  if (stale.length > 0) {
    await supabase.storage.from(AVATAR_BUCKET).remove(stale);
  }
}

// Fired on window after the user edits their profile, so the NavBar (which
// lives outside the profile page) can refresh its avatar/nickname.
export const PROFILE_UPDATED_EVENT = "profile-updated";

export function notifyProfileUpdated(profile: Profile) {
  window.dispatchEvent(new CustomEvent<Profile>(PROFILE_UPDATED_EVENT, { detail: profile }));
}
