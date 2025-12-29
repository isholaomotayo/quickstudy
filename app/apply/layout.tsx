"use client";

import React, { useState, useEffect } from "react";
import ApplicantNavLayout from "../../components/ApplicantNavLayout";
import { getInstituionByParams } from "../../helpers/FetchWrapper";

export default function ApplyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [institution, setInstitution] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInstitution = async () => {
      try {
        const institutionData = await getInstituionByParams({ id: "1" }, {});
        setInstitution(institutionData);
      } catch (error) {
        console.error("Error loading institution:", error);
        // Set default institution if loading fails
        setInstitution({ name: "quickStudy", logo: null });
      } finally {
        setIsLoading(false);
      }
    };

    loadInstitution();
  }, []);

  // Show loading state briefly while institution data loads
  if (isLoading) {
    return (
      <ApplicantNavLayout
        institutionName="quickStudy"
        institutionLogo={undefined}
      >
        {children}
      </ApplicantNavLayout>
    );
  }

  return (
    <ApplicantNavLayout
      institutionName={institution?.name || "quickStudy"}
      institutionLogo={institution?.logo}
    >
      {children}
    </ApplicantNavLayout>
  );
}