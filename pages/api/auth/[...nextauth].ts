import NextAuth from 'next-auth'
import { authOptions } from './api/auth/[...nextauth]'
 
export default NextAuth(authOptions)