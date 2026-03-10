import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { isLoginBlocked, recordLoginFailure } from '@/lib/rate-limit';

if (process.env.NODE_ENV === 'production' && !process.env.NEXTAUTH_SECRET) {
  console.error('NEXTAUTH_SECRET is required in production. Set it in .env');
}

/** Find or create User by email for OAuth sign-in. Returns DB user id. Username is set to email. */
async function findOrCreateOAuthUser(email: string, name: string | null): Promise<string> {
  const normalized = email.toLowerCase().trim();
  let user = await prisma.user.findUnique({ where: { email: normalized } });
  if (!user) {
    user = await prisma.user.create({
      data: { email: normalized, name: name ?? null, passwordHash: null, username: normalized },
    });
  } else if (!user.username || user.username.trim() === '') {
    await prisma.user.update({
      where: { id: user.id },
      data: { username: normalized },
    });
  }
  return user.id;
}

/** True if the id looks like our cuid (from credentials), not a provider id. */
function isOurUserId(id: string | undefined): boolean {
  return typeof id === 'string' && id.length >= 24 && id.length <= 26 && /^[a-z]/.test(id);
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  useSecureCookies: process.env.NODE_ENV === 'production',
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email or username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const identifier = String(credentials.email).trim();
        if (!identifier) return null;
        if (isLoginBlocked(identifier)) return null;
        const isEmail = identifier.includes('@');
        const user = await prisma.user.findFirst({
          where: isEmail
            ? { email: identifier.toLowerCase() }
            : { username: identifier.toLowerCase() },
        });
        if (!user || user.passwordHash == null) return null;
        const ok = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!ok) {
          recordLoginFailure(identifier);
          return null;
        }
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
        };
      },
    }),
  ],
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        const email = (user.email ?? '').toString().toLowerCase().trim();
        if (email && (account?.provider === 'google' || account?.provider === 'github')) {
          const dbId = await findOrCreateOAuthUser(email, user.name ?? null);
          token.id = dbId;
        } else if (isOurUserId(user.id as string)) {
          token.id = user.id;
        }
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id: string }).id = token.id as string;
      }
      return session;
    },
  },
  pages: { signIn: '/login' },
};
