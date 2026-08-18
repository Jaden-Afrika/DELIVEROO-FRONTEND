/**
 * Mock users — shape matches what the Flask API will return for
 * /auth/login and /auth/signup (next week).
 *
 * Expected shape (real API):
 *   {
 *     id: string,          // stable primary key
 *     name: string,
 *     email: string,
 *     role: 'user' | 'admin',
 *   }
 *
 * `password` is DEV-ONLY so mock login can be tested. The real API
 * never returns or requires it in response bodies.
 */
const users = [
  { id: 'user-1', name: 'Nesh', email: 'nesh@sendit.com', password: 'password123', role: 'user' },
  { id: 'user-2', name: 'Amina', email: 'amina@sendit.com', password: 'password123', role: 'user' },
  { id: 'admin-1', name: 'Fiona', email: 'admin@sendit.com', password: 'admin123', role: 'admin' },
]

export default users