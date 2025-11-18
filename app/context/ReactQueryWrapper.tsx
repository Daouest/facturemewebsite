"use client";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export default function ReactQueryWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  // Create QueryClient inside component to avoid sharing between users
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Reduce refetch frequency to save bandwidth and server load
            staleTime: 60 * 1000, // Data is fresh for 60 seconds
            gcTime: 5 * 60 * 1000, // Cache for 5 minutes
            refetchOnWindowFocus: false, // Don't refetch when window regains focus
            refetchOnReconnect: false, // Don't refetch on reconnect
            retry: 1, // Only retry failed requests once
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Only show devtools in development */}
      {process.env.NODE_ENV === "development" && <ReactQueryDevtools />}
    </QueryClientProvider>
  );
}
