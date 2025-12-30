"use client";

import React from "react";
import ApplicantNavLayout from "../../components/ApplicantNavLayout";
import { useInstitutionByUrl } from "../../hooks/useInstitution";

export default function ApplyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Use the same unified hook that signin uses
  const { institution, isLoading: isLoadingInstitution } = useInstitutionByUrl();

  // Show loading state briefly while institution data loads
  if (isLoadingInstitution) {
    return (
      <ApplicantNavLayout
        institutionName={undefined}
        institutionLogo={undefined}
      >
        {children}
      </ApplicantNavLayout>
    );
  }

  return (
    <ApplicantNavLayout
      institutionName={institution?.name}
      institutionLogo={institution?.logo}
    >
      {children}
    </ApplicantNavLayout>
  );
}