import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { isValidKenyanPhone } from '@/lib/utils';
import type { AuthUser } from '@/types';

const handler = NextAuth({
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
          
          // Development fallback for demo purposes when database is not accessible
          if (process.env.NODE_ENV === 'development') {
            // Mock users for testing
            const mockUsers = [
              { phone: '+254701234567', role: 'ADMIN', settlementId: null, settlementName: null },
              { phone: '+254702345678', role: 'ADMIN', settlementId: '1', settlementName: 'Mji wa Huruma' },
              { phone: '+254712345678', role: 'WORKER', settlementId: '1', settlementName: 'Mji wa Huruma' },
              { phone: '+254723456789', role: 'WORKER', settlementId: '2', settlementName: 'Kayole Soweto' },
              { phone: '+254734567890', role: 'WORKER', settlementId: '3', settlementName: 'Kariobangi' },
            ];

            const mockUser = mockUsers.find(u => u.phone === normalizedPhone);
            if (mockUser) {
              // Validate settlement for workers
              if (mockUser.role === 'WORKER' && mockUser.settlementId !== credentials.settlementId) {
                throw new Error('Selected settlement does not match your account');
              }
              
              return {
                id: mockUser.phone,
                name: `Demo ${mockUser.role}`,
                phone: mockUser.phone,
                role: mockUser.role as 'WORKER' | 'ADMIN',
                settlementId: mockUser.settlementId,
                settlementName: mockUser.settlementName,
              } as AuthUser;
            }
          }
          
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
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
    async session({ session, token }) {
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
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };