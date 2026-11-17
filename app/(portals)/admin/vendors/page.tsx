import type { Metadata } from "next";
import VendorsView from "./view";

export const metadata: Metadata = {
  title: "Vendors - Admin",
};

export default function AdminVendorsPage() {
  return <VendorsView />;
}
