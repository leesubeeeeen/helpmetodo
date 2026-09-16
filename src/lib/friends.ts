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
