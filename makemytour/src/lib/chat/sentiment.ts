const frustrationKeywords = [
  "not working",
  "frustrated",
  "angry",
  "upset",
  "bad",
  "hate",
  "disappointed",
  "problem",
  "issue",
  "help",
  "support",
];

export function detectFrustration(message: string): boolean {
  const lower = message.toLowerCase();
  return frustrationKeywords.some((keyword) => lower.includes(keyword));
}
