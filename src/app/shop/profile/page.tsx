import type { Metadata } from "next";
import { ProfileView } from "@/features/shared/profile-view";

export const metadata: Metadata = {
  title: "Profil Warung",
};

export default function ShopProfilePage() {
  return <ProfileView role="shop" />;
}
