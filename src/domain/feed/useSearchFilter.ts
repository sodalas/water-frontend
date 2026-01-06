
// src/domain/feed/useSearchFilter.ts
import { useState } from "react";

export function useSearchFilter() {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  return {
    searchTerm,
    handleSearchChange,
  };
}
