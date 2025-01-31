import { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET } from "@/env";
import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth from "next-auth/next";
import DiscordProvider from "next-auth/providers/discord";

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    DiscordProvider({
      clientId: DISCORD_CLIENT_ID,
      clientSecret: DISCORD_CLIENT_SECRET,
    }),
  ],
  callbacks: {},
  session: {
    strategy: "jwt",
  },
});

export { handler as GET, handler as POST };
