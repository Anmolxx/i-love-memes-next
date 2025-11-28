import { ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CommunityPaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (newPage: number) => void;
}

export function CommunityPagination({ page, pageCount, onPageChange }: CommunityPaginationProps) {
  return (
    <div className="flex items-center justify-center space-x-2 ">
      {/* Go to First Page */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(1)}
        disabled={page === 1}
      >
        <ChevronsLeftIcon className="w-4 h-4" aria-hidden="true" />
      </Button>

      {/* Previous Page */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
      >
        <ChevronLeftIcon className="w-4 h-4" aria-hidden="true" />
      </Button>

      <span className="text-sm font-medium">
        Page {page} of {pageCount}
      </span>

      {/* Next Page */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(page + 1)}
        disabled={page === pageCount}
      >
        <ChevronRightIcon className="w-4 h-4" aria-hidden="true" />
      </Button>

      {/* Go to Last Page */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(pageCount)}
        disabled={page === pageCount}
      >
        <ChevronsRightIcon className="w-4 h-4" aria-hidden="true" />
      </Button>
    </div>
  );
}
