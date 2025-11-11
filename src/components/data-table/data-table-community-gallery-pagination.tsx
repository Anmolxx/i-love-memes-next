import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface CommunityPaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (newPage: number) => void;
}

export function CommunityPagination({ page, pageCount, onPageChange }: CommunityPaginationProps) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center space-x-2 mt-4">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(1)}
        disabled={page === 1}
      >
        <ChevronLeftIcon className="size-4" aria-hidden="true" />
      </Button>
      <span className="text-sm font-medium">
        Page {page} of {pageCount}
      </span>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(page + 1)}
        disabled={page === pageCount}
      >
        <ChevronRightIcon className="size-4" aria-hidden="true" />
      </Button>
    </div>
  );
}
