"use client";

import { PackageEditor, blankPackage } from "@/components/admin/PackageEditor";

export default function NewPackagePage() {
  return <PackageEditor initial={blankPackage} />;
}
