"use client";

import { use } from "react";
import { BookingConfirmation } from "@/components/booking/components/BookingConfirmation";
import BookingLayout from "@/components/booking/booking.layout";

interface ConfirmationPageProps {
  params: Promise<{
    artistId: string;
  }>;
}

export default function ConfirmationPage({ params }: ConfirmationPageProps) {
  const { artistId } = use(params);

  return (
    <BookingLayout>
      <BookingConfirmation artistId={artistId} />
    </BookingLayout>
  );
}
