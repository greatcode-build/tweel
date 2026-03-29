"use client";
import { createContext, useContext } from "react";

interface newsResultsProps {
  title: string;
  description?: string;
  url?: string;
  urlToImage?: string;
  source: { name: string };
}

interface randomUsersResultsProps {
  name: { first: string; last: string };
  login: { username: string };
  picture: { thumbnail: string };
}

interface ResultsProps {
  articles: newsResultsProps[];
  results: randomUsersResultsProps[];
}

interface DataContextType {
  newsResults: ResultsProps;
  randomUsersResults: ResultsProps;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({
  children,
  newsResults,
  randomUsersResults,
}: {
  children: React.ReactNode;
  newsResults: ResultsProps;
  randomUsersResults: ResultsProps;
}) {
  return (
    <DataContext.Provider value={{ newsResults, randomUsersResults }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useGlobalData must be used within a GlobalProvider");
  }
  return context;
}
