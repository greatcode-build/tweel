"use client";
import Feed from "./components/Feed";
import Sidebar from "./components/Sidebar";
import Widgets from "./components/Widgets";
import { useData } from "./context";

export default function Home() {
  const { newsResults, randomUsersResults } = useData();

  return (
    <main className="flex min-h-screen mx-auto">
      <Sidebar />
      <Feed />
      <Widgets
        newsResults={newsResults}
        randomUsersResults={randomUsersResults}
      />
    </main>
  );
}
