import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { isValidKenyanPhone } from '@/lib/utils';
import type { AuthUser } from '@/types';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'phone',
      credentials: {
        phone: { 
          label: 'Phone Number', 
          type: 'tel', 
          placeholder: '+254712345678 or 0712345678' 
        },
        settlementId: { 
          label: 'Settlement', 
          type: 'text' 
        },
      },
      async authorize(credentials) {
        if (!credentials?.phone) {
          throw new Error('Phone number is required');
        }

        // Validate phone number format
        if (!isValidKenyanPhone(credentials.phone)) {
          throw new Error('Please enter a valid Kenyan phone number');
        }

        // Normalize phone number to E.164 format
        let normalizedPhone = credentials.phone.replace(/\D/g, '');
        if (normalizedPhone.startsWith('0')) {
          normalizedPhone = '254' + normalizedPhone.slice(1);
        }
        normalizedPhone = '+' + normalizedPhone;

        try {
          // Find user by phone number
          const user = await prisma.user.findUnique({
            where: { phone: normalizedPhone },
            include: {
              settlement: true,
            },
          });

          if (!user) {
            throw new Error('No account found with this phone number');
          }

          // For workers, verify settlement selection matches their assigned settlement
          if (user.role === 'WORKER') {
            if (!credentials.settlementId) {
              throw new Error('Please select your settlement');
            }
            if (user.settlementId !== credentials.settlementId) {
              throw new Error('Selected settlement does not match your account');
            }
          }

          // For admins, settlement selection is optional (system-wide access)
          if (user.role === 'ADMIN' && credentials.settlementId && user.settlementId) {
            // If admin has a specific settlement, verify it matches
            if (user.settlementId !== credentials.settlementId) {
              throw new Error('Selected settlement does not match your admin account');
            }
          }

          // Return user data for session
          return {
            id: user.id,
            name: user.name || `User ${user.phone}`,
            phone: user.phone,
            role: user.role,
            settlementId: user.settlementId,
            settlementName: user.settlement?.name,
          } as AuthUser;
        } catch (error) {
          console.error('Authentication error:', error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      // Persist user data in JWT token
      if (user) {
        token.id = user.id;
        token.name = (user as AuthUser).name;
        token.phone = (user as AuthUser).phone;
        token.role = (user as AuthUser).role;
        token.settlementId = (user as AuthUser).settlementId;
        token.settlementName = (user as AuthUser).settlementName;
      }
      return token;
    },
    async session({ session, token }: any) {
      // Send properties to the client
      session.user = {
        id: token.id as string,
        name: token.name as string,
        phone: token.phone as string,
        role: token.role as 'WORKER' | 'ADMIN',
        settlementId: token.settlementId as string | undefined,
        settlementName: token.settlementName as string | undefined,
      };
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login?error=auth',
  },
  session: {
    strategy: 'jwt' as const,
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
};