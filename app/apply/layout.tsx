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
        // Get current URL from window location
        const currentUrl = typeof window !== "undefined" ? window.location.origin : "";
        
        // Try to fetch by URL first, fallback to ID if URL fails
        let institutionData = null;
        if (currentUrl) {
          try {
            institutionData = await getInstituionByParams({ url: currentUrl }, {});
          } catch (urlError) {
            console.warn("Failed to fetch institution by URL, trying ID:", urlError);
          }
        }
        
        // Fallback to ID if URL lookup failed or returned empty
        if (!institutionData || (typeof institutionData === "object" && !institutionData.id)) {
          institutionData = await getInstituionByParams({ id: "1" }, {});
        }
        
        // Ensure we have a valid institution object
        if (institutionData && typeof institutionData === "object" && institutionData.id) {
          setInstitution(institutionData);
        } else {
          console.error("Invalid institution data received:", institutionData);
          // Set default institution to prevent crashes
          setInstitution({ id: 1, name: "quickStudy", logo: null });
        }
      } catch (error) {
        console.error("Error loading institution:", error);
        // Set default institution if loading fails
        setInstitution({ id: 1, name: "quickStudy", logo: null });
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