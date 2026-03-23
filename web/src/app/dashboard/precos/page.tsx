"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { PricingConfigPage } from "@/components/admin/pricing/PricingConfig";

export default function PrecosPage() {
  return (
    <div>
      <PageHeader
        title="Precos"
        description="Configure a tabela de precos do seu estudio"
      />
      <PricingConfigPage />
    </div>
  );
}
