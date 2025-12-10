'use client'

import { useUser } from '@/contexts/AppContext';

export function useInstitutionId() {
  const { userData } = useUser();

  // Get institution ID from verified userData in AppContext
  // Falls back to 1 if not available
  return userData?.institution_id || 1;
}
