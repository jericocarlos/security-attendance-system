import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getUserByIdentifier } from "@/lib/db";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Username or Employee ID", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          return null;
        }

        try {
          // Get user from database by username or employee ID
          const user = await getUserByIdentifier(credentials.identifier);
          
          // Check if user exists
          if (!user) {
            return null;
          }
          
          // Validate password
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );
          
          if (!isPasswordValid) {
            return null;
          }
          
          // Return user object (excluding password)
          return {
            id: user.id.toString(),
            name: user.name,
            username: user.username,
            employeeId: user.employee_id,
            role: user.role, // <-- ADD THIS LINE
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      // Add custom user properties to the token
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.employeeId = user.employeeId;
        token.role = user.role; // <-- ADD THIS LINE
      }
      return token;
    },
    async session({ session, token }) {
      // Add custom properties to the session
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.employeeId = token.employeeId;
        session.user.role = token.role; // <-- ADD THIS LINE
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };