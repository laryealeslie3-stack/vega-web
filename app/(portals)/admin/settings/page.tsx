import type { Metadata } from "next";
import SettingsView from "./view";

export const metadata: Metadata = {
  title: "Settings - Admin",
};

export default function AdminSettingsPage() {
  return <SettingsView />;
}
