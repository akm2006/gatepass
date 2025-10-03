import crypto from "crypto"

export function generateApprovalToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

export function isTokenExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt
}

export function getTokenExpirationTime(): Date {
  const expirationTime = new Date()
  expirationTime.setHours(expirationTime.getHours() + 1) // 1 hour from now
  return expirationTime
}
