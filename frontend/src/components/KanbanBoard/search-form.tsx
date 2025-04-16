"use client";

import { Search } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

export function SearchForm() {
  return (
    <form className="relative">
      <Label htmlFor="search" className="sr-only">
        Search
      </Label>
      <Input id="search" placeholder="Search tasks..." className="pl-8" />
      <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </form>
  );
}
