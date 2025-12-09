'use client'

import { useState, useEffect } from 'react';

export function useInstitutionId() {
  const [institutionId, setInstitutionId] = useState<number>(1); // Default to 1

  useEffect(() => {
    // Try to get institution ID from cookies
    const getInstitutionIdFromCookies = () => {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'institution_id' || name === 'institutionId') {
          const id = parseInt(value);
          if (!isNaN(id)) {
            return id;
          }
        }
      }
      return 1; // Default fallback
    };

    // Try to get from localStorage as fallback
    const getInstitutionIdFromStorage = () => {
      try {
        const stored = localStorage.getItem('institution_id') || localStorage.getItem('institutionId');
        if (stored) {
          const id = parseInt(stored);
          if (!isNaN(id)) {
            return id;
          }
        }
      } catch (error) {
        console.warn('Could not read institution ID from localStorage:', error);
      }
      return null;
    };

    // Get institution ID with fallbacks
    const id = getInstitutionIdFromCookies() || getInstitutionIdFromStorage() || 1;
    setInstitutionId(id);
  }, []);

  return institutionId;
}
