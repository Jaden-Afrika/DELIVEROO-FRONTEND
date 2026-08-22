// TEMPORARY: stands in for the real auth state until the teammate
// building "Login & Accounts" wires in real auth. The rest of the app
// should only ever read `currentUser.id` from this hook, so that swap
// stays a one-line change.
export default function useAuth() {
  return {
    currentUser: { id: 'user-1', name: 'Nesh' },
  }
}