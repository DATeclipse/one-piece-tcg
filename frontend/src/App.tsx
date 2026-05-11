import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import { DeckProvider } from "./context/DeckContext";
import { queryClient } from "./lib/queryClient";
import CardSearch from "./pages/CardSearch";
import DeckBuilder from "./pages/DeckBuilder";
import Glossary from "./pages/Glossary";
import DeckView from "./pages/DeckView";
import MetaStrategy from "./pages/MetaStrategy";
import TournamentMeta from "./pages/TournamentMeta";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DeckProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<DeckBuilder />} />
              <Route path="cards" element={<CardSearch />} />
              <Route path="decks" element={<DeckView />} />
              <Route path="tournaments" element={<TournamentMeta />} />
              <Route path="meta" element={<MetaStrategy />} />
              <Route path="glossary" element={<Glossary />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </DeckProvider>
    </QueryClientProvider>
  );
}
