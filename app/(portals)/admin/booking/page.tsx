import type { Metadata } from "next";
import BookingView from "./view";

export const metadata: Metadata = {
  title: "Bookings - Admin",
};

export default function AdminBookingPage() {
  return <BookingView />;
}
