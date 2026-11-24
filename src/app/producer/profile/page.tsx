import type { Metadata } from "next";
import { ProfileView } from "@/features/shared/profile-view";

export const metadata: Metadata = {
  title: "Profil Produsen",
};

export default function ProducerProfilePage() {
  return <ProfileView role="producer" />;
}
