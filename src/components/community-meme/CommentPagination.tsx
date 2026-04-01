import * as React from "react"

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination"

interface PaginationComponentProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const MAX_PAGES_VISIBLE = 5

const PaginationComponent: React.FC<PaginationComponentProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null

  const pages: (number | "ellipsis")[] = []

  let start = Math.max(1, currentPage - Math.floor(MAX_PAGES_VISIBLE / 2))
  let end = Math.min(totalPages, start + MAX_PAGES_VISIBLE - 1)

  if (end - start + 1 < MAX_PAGES_VISIBLE) {
    start = Math.max(1, end - MAX_PAGES_VISIBLE + 1)
  }

  for (let i = start; i <= end; i++) pages.push(i)

  if (start > 1) {
    if (start > 2) pages.unshift("ellipsis")
    pages.unshift(1)
  }

  if (end < totalPages) {
    if (end < totalPages - 1) pages.push("ellipsis")
    pages.push(totalPages)
  }

  const finalPages = pages.filter(
    (value, idx, arr) => idx === 0 || value !== arr[idx - 1]
  )

  const condensedPages = finalPages.filter(
    (value, idx, arr) => value !== "ellipsis" || arr[idx - 1] !== "ellipsis"
  )

  const disablePrev = currentPage === 1
  const disableNext = currentPage === totalPages

  return (
    <Pagination>
      <PaginationContent>

        <PaginationItem>
          <PaginationPrevious
            aria-disabled={disablePrev}
            className={disablePrev ? "pointer-events-none opacity-50" : ""}
            href={!disablePrev ? `#page-${currentPage - 1}` : undefined}
            onClick={() => !disablePrev && onPageChange(currentPage - 1)}
          />
        </PaginationItem>

        {condensedPages.map((page, index) => (
          <PaginationItem key={index}>
            {typeof page === "number" ? (
              <PaginationLink
                isActive={page === currentPage}
                href={`#page-${page}`}
                onClick={() => onPageChange(page)}
              >
                {page}
              </PaginationLink>
            ) : (
              <PaginationEllipsis />
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            aria-disabled={disableNext}
            className={disableNext ? "pointer-events-none opacity-50" : ""}
            href={!disableNext ? `#page-${currentPage + 1}` : undefined}
            onClick={() => !disableNext && onPageChange(currentPage + 1)}
          />
        </PaginationItem>

      </PaginationContent>
    </Pagination>
  )
}

export { PaginationComponent }
