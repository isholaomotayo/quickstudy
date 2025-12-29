"use client";

import {
  ArrowLeft,
  BookOpen,
  ExternalLink,
  Filter,
  Globe,
  GraduationCap,
  Library,
  Search,
  X,
  LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import OERData, { OERResource } from "./data";

export default function OERPage() {
  const [mounted, setMounted] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [filteredResources, setFilteredResources] = useState<OERResource[]>([]);

  useEffect(() => {
    setMounted(true);
    setFilteredResources(OERData.getAllResources());
  }, []);

  useEffect(() => {
    let resources = OERData.getAllResources();

    // Filter by search query
    if (searchQuery) {
      resources = resources.filter(
        (resource) =>
          resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          resource.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
          resource.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      resources = resources.filter(
        (resource) => resource.category === selectedCategory
      );
    }

    setFilteredResources(resources);
  }, [searchQuery, selectedCategory]);

  if (!mounted) return null;

  const categories: string[] = ["all", ...OERData.getCategories()];

  const getCategoryIcon = (category: string): LucideIcon => {
    switch (category) {
      case "Open Courseware & MOOCs":
        return GraduationCap;
      case "Research & Open Access":
        return Library;
      case "Simulations & Virtual Labs":
        return Globe;
      case "OER & Digital Libraries":
        return BookOpen;
      case "Academic & Research Tools":
        return Search;
      default:
        return BookOpen;
    }
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case "Open Courseware & MOOCs":
        return "from-blue-500 to-blue-600";
      case "Research & Open Access":
        return "from-emerald-500 to-emerald-600";
      case "Simulations & Virtual Labs":
        return "from-purple-500 to-purple-600";
      case "OER & Digital Libraries":
        return "from-teal-500 to-cyan-500";
      case "Academic & Research Tools":
        return "from-indigo-500 to-indigo-600";
      default:
        return "from-muted-foreground/50 to-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-in fade-in duration-700">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Discover Free Learning Resources
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
            Access thousands of free, high-quality educational resources from
            top universities and institutions worldwide. Enhance your learning
            with open courseware, research repositories, virtual labs, and
            academic tools.
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Search */}
          <Card className="lg:col-span-2 border border-border bg-card shadow-lg animate-in slide-in-from-top duration-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Search className="w-5 h-5 text-primary" />
                Search Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search for courses, tools, simulations, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background border border-border/60"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Category Filter */}
          <Card className="border border-border bg-card shadow-lg animate-in slide-in-from-top duration-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Filter className="w-5 h-5 text-primary" />
                Filter by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="bg-background border border-border/60">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === "all" ? "All Categories" : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredResources.length} resource
            {filteredResources.length !== 1 ? "s" : ""}
            {searchQuery && ` for "${searchQuery}"`}
            {selectedCategory !== "all" && ` in ${selectedCategory}`}
          </p>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource, index) => {
            const CategoryIcon = getCategoryIcon(resource.category);
            const categoryColor = getCategoryColor(resource.category);

            return (
              <Card
                key={resource.name}
                className="border border-border bg-card shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer animate-in slide-in-from-bottom group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 bg-gradient-to-r ${categoryColor} rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-200`}
                    >
                      <CategoryIcon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-foreground group-hover:text-primary transition-colors duration-200 mb-2">
                        {resource.name}
                      </h4>
                      <Badge variant="secondary" className="text-xs mb-3">
                        {resource.category}
                      </Badge>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {resource.summary}
                      </p>
                      <a
                        href={resource.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:opacity-80 transition-colors duration-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Visit Resource
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* No Results */}
        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted/40 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              No resources found
            </h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search terms or category filter
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Category Overview */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-foreground mb-6">
            Resource Categories
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {OERData.getCategories().map((category, index) => {
              const CategoryIcon = getCategoryIcon(category);
              const categoryColor = getCategoryColor(category);
              const categoryResources =
                OERData.getResourcesByCategory(category);

              return (
                <Card
                  key={category}
                  className="border border-border bg-card shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer animate-in slide-in-from-left"
                  style={{ animationDelay: `${index * 200}ms` }}
                  onClick={() => setSelectedCategory(category)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div
                        className={`w-12 h-12 bg-gradient-to-r ${categoryColor} rounded-lg flex items-center justify-center text-white flex-shrink-0`}
                      >
                        <CategoryIcon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-foreground truncate">
                          {category}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {categoryResources.length} resource
                          {categoryResources.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {category === "Open Courseware & MOOCs" &&
                        "Free university courses and materials from top institutions"}
                      {category === "Research & Open Access" &&
                        "Open access journals, repositories, and research databases"}
                      {category === "Simulations & Virtual Labs" &&
                        "Interactive simulations and virtual laboratory experiences"}
                      {category === "OER & Digital Libraries" &&
                        "Open educational resources and digital library collections"}
                      {category === "Academic & Research Tools" &&
                        "Tools for research, citation management, and academic work"}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
