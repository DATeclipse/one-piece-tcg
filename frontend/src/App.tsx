import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import { queryClient } from "./lib/queryClient";
import DeckBuilder from "./pages/DeckBuilder";
import MetaStrategy from "./pages/MetaStrategy";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<DeckBuilder />} />
            <Route path="meta" element={<MetaStrategy />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
