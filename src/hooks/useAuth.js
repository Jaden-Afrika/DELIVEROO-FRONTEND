import { useSelector } from 'react-redux'
import {
  selectCurrentUser,
  selectIsAuthenticated,
} from '../features/auth/authSlice'

// Reads auth state from the Redux auth slice. Keeps the { currentUser }
// shape the parcel details feature already depends on, so components
// don't care whether auth comes from Redux or elsewhere.
export default function useAuth() {
  const currentUser = useSelector(selectCurrentUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  return { currentUser, isAuthenticated }
}