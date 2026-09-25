import { requireUser, getProfile } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProfileForm } from "./ProfileForm";

export default async function ProfilPage() {
  const user = await requireUser();
  const profile = await getProfile();

  return (
    <div>
      <PageHeader eyebrow="Traveler" title="Profil Saya" description="Kelola informasi akun Anda." />
      <ProfileForm fullName={profile?.full_name ?? ""} phone={profile?.phone ?? ""} email={user.email ?? ""} />
    </div>
  );
}
