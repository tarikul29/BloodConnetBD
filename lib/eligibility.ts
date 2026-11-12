const DONATION_COOLDOWN_DAYS = 90;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

export interface EligibilityResult {
  isEligible: boolean;
  daysRemaining: number; // 0 if eligible
  nextEligibleDate: Date | null;
}

/**
 * Determines whether a donor is eligible to donate again based on
 * their last donation date. A 90-day (~3 month) gap is required
 * between whole-blood donations.
 *
 * @param lastDonationDate - ISO date string or Date, or null if never donated
 * @param referenceDate - defaults to now; pass explicitly for testability
 */
export function checkDonorEligibility(
  lastDonationDate: string | Date | null,
  referenceDate: Date = new Date()
): EligibilityResult {
  // Never donated before -> always eligible
  if (!lastDonationDate) {
    return { isEligible: true, daysRemaining: 0, nextEligibleDate: null };
  }

  const lastDonation =
    typeof lastDonationDate === 'string'
      ? new Date(lastDonationDate)
      : lastDonationDate;

  if (isNaN(lastDonation.getTime())) {
    throw new Error('Invalid lastDonationDate provided');
  }

  const nextEligibleDate = new Date(
    lastDonation.getTime() + DONATION_COOLDOWN_DAYS * MS_PER_DAY
  );

  const diffMs = nextEligibleDate.getTime() - referenceDate.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffMs / MS_PER_DAY));

  return {
    isEligible: daysRemaining === 0,
    daysRemaining,
    nextEligibleDate: daysRemaining === 0 ? null : nextEligibleDate,
  };
}
