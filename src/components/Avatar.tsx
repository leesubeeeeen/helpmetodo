import type { Profile } from "@/lib/types";

type Props = {
  profile: Pick<Profile, "nickname" | "avatar_url">;
  size?: number;
};

// Profile photo, falling back to the nickname's first letter.
export default function Avatar({ profile, size = 40 }: Props) {
  if (profile.avatar_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- user-uploaded Supabase Storage URL; next/image would need the project host in next.config
      <img
        src={profile.avatar_url}
        alt={`${profile.nickname} 프로필 사진`}
        width={size}
        height={size}
        className="flex-shrink-0 rounded-full bg-slate-100 object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      aria-hidden
      className="flex flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-500"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {profile.nickname.slice(0, 1).toUpperCase()}
    </span>
  );
}
