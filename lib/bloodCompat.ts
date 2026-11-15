// কোন গ্রুপের রক্ত কোন গ্রুপের রোগীকে দেওয়া যায়
const CAN_GIVE_TO: Record<string, string[]> = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'],
};

/** রোগীর গ্রুপ দিলে — কোন কোন গ্রুপের ডোনার রক্ত দিতে পারবেন */
export function donorGroupsFor(recipientGroup: string): string[] {
  return Object.keys(CAN_GIVE_TO).filter((g) => CAN_GIVE_TO[g].includes(recipientGroup));
}