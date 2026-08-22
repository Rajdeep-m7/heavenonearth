"use client";

import { StayEditor, blankStay } from "@/components/admin/StayEditor";

export default function NewStayPage() {
  return <StayEditor initial={blankStay} />;
}
