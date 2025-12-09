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
      className={`bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl overflow-hidden ${className}`}
    >
      {searchable && (
        <div className="p-6 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex h-10 w-full rounded-md border border-white/20 bg-white/50 px-3 py-2 pl-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus:border-blue-300 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-blue-50/50 to-emerald-50/50 border-b border-white/10">
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-6 py-4 text-left text-sm font-semibold text-gray-700 ${
                    column.sortable ? "cursor-pointer hover:bg-white/20 transition-colors" : ""
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
                              ? "text-blue-600"
                              : "text-gray-300"
                          }`}
                        />
                        <ChevronDown
                          className={`h-3 w-3 -mt-1 ${
                            sortConfig?.key === column.key && sortConfig.direction === "desc"
                              ? "text-blue-600"
                              : "text-gray-300"
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
                className={`border-b border-white/5 hover:bg-white/30 transition-all duration-200 ${
                  onRowClick ? "cursor-pointer" : ""
                } ${index % 2 === 0 ? "bg-white/10" : "bg-transparent"}`}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className={`px-6 py-4 text-sm text-gray-700 ${column.className || ""}`}>
                    {column.render ? column.render(item) : String(getValue(item, column.key) || "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {sortedData.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-lg font-medium">No results found</div>
            <div className="text-sm mt-1">
              {searchable && searchTerm ? `No items match "${searchTerm}"` : "No data available"}
            </div>
          </div>
        )}
      </div>

      {sortedData.length > 0 && (
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50/50 to-white/50 border-t border-white/10">
          <div className="text-sm text-gray-600">
            Showing {sortedData.length} of {data.length} results
            {searchable && searchTerm && ` for "${searchTerm}"`}
          </div>
        </div>
      )}
    </div>
  )
}
