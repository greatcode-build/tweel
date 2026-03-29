import type { Metadata } from "next";
import "./globals.css";
import { createClient } from "../../utils/supabase/server";
import { SessionProvider } from "./context/session";
import { getNews, getUsers } from "./data";
import { DataProvider } from "./context";
import { CommentModal } from "./components/CommentModal";

export const metadata: Metadata = {
  title: {
    template: "%s | Tweel",
    default: "Tweel",
  },
  description: "Tweel website",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const newsResults = await getNews();
  const randomUsersResults = await getUsers();
  return (
    <html lang="en">
      <body>
        <SessionProvider session={session}>
          <DataProvider
            newsResults={newsResults}
            randomUsersResults={randomUsersResults}
          >
            {children}
            <CommentModal />
          </DataProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
