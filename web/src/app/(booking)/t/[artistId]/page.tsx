"use client";

import { use } from "react";
import { BookingFlow } from "@/components/booking/components/BookingFlow";
import BookingLayout from "@/components/booking/booking.layout";

interface BookingPageProps {
  params: Promise<{
    artistId: string;
  }>;
}

export default function BookingPage({ params }: BookingPageProps) {
  const { artistId } = use(params);

  return (
    <BookingLayout>
      <BookingFlow artistId={artistId} />
    </BookingLayout>
  );
}
