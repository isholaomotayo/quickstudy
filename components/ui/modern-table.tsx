"use client"

import { useState, type ReactNode } from "react"
import { ChevronUp, ChevronDown, Search } from "lucide-react"

interface Column<T> {
  key: keyof T | string
  header: string
  render?: (item: T) => ReactNode
  sortable?: boolean
  className?: string
}

interface ModernTableProps<T> {
  data: T[]
  columns: Column<T>[]
  searchable?: boolean
  searchPlaceholder?: string
  onRowClick?: (item: T) => void
  className?: string
}

export function ModernTable<T extends Record<string, any>>({
  data,
  columns,
  searchable = false,
  searchPlaceholder = "Search...",
  onRowClick,
  className = "",
}: ModernTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: "asc" | "desc"
  } | null>(null)

  // Filter data based on search term
  const filteredData = searchable
    ? data.filter((item) =>
        Object.values(item).some((value) => String(value).toLowerCase().includes(searchTerm.toLowerCase())),
      )
    : data

  // Sort data
  const sortedData = sortConfig
    ? [...filteredData].sort((a, b) => {
        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1
        }
        return 0
      })
    : filteredData

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return {
          key,
          direction: current.direction === "asc" ? "desc" : "asc",
        }
      }
      return { key, direction: "asc" }
    })
  }

  const getValue = (item: T, key: keyof T | string) => {
    if (typeof key === "string" && key.includes(".")) {
      return key.split(".").reduce((obj, k) => obj?.[k], item)
    }
    return item[key as keyof T]
  }

  return (
    <div
      className={`bg-card/80 backdrop-blur-sm rounded-2xl border border-border shadow-lg overflow-hidden ${className}`}
    >
      {searchable && (
        <div className="p-6 border-b border-border/60 bg-card/80">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 pl-10 text-sm text-foreground placeholder:text-muted-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-muted/40 via-card to-primary/5 border-b border-border/70">
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-6 py-4 text-left text-sm font-semibold text-foreground ${
                    column.sortable ? "cursor-pointer hover:bg-muted/30 transition-colors" : ""
                  } ${column.className || ""}`}
                  onClick={() => column.sortable && handleSort(String(column.key))}
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {column.sortable && (
                      <div className="flex flex-col">
                        <ChevronUp
                          className={`h-3 w-3 ${
                            sortConfig?.key === column.key && sortConfig.direction === "asc"
                              ? "text-primary"
                              : "text-muted-foreground/60"
                          }`}
                        />
                        <ChevronDown
                          className={`h-3 w-3 -mt-1 ${
                            sortConfig?.key === column.key && sortConfig.direction === "desc"
                              ? "text-primary"
                              : "text-muted-foreground/60"
                          }`}
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item, index) => (
              <tr
                key={index}
                className={`border-b border-border/40 hover:bg-muted/30 transition-all duration-200 ${
                  onRowClick ? "cursor-pointer" : ""
                } ${index % 2 === 0 ? "bg-muted/20" : "bg-transparent"}`}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className={`px-6 py-4 text-sm text-foreground ${column.className || ""}`}>
                    {column.render ? column.render(item) : String(getValue(item, column.key) || "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {sortedData.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <div className="text-lg font-medium text-foreground">No results found</div>
            <div className="text-sm mt-1">
              {searchable && searchTerm ? `No items match "${searchTerm}"` : "No data available"}
            </div>
          </div>
        )}
      </div>

      {sortedData.length > 0 && (
        <div className="px-6 py-4 bg-card/80 border-t border-border/60">
          <div className="text-sm text-muted-foreground">
            Showing {sortedData.length} of {data.length} results
            {searchable && searchTerm && ` for "${searchTerm}"`}
          </div>
        </div>
      )}
    </div>
  )
}
