
// src/components/feed/SearchInput.tsx
import React from "react";

type SearchInputProps = {
  searchTerm: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export function SearchInput({ searchTerm, onSearchChange }: SearchInputProps) {
  return (
    <input
      type="text"
      placeholder="Search feed..."
      value={searchTerm}
      onChange={onSearchChange}
      className="border p-2 rounded w-full mb-4"
    />
  );
}
