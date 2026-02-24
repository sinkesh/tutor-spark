import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationComponentProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  className?: string;
}

export default function PaginationComponent({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  isLoading = false,
  className = "",
}: PaginationComponentProps) {
  if (totalPages <= 1 || isLoading) {
    return null;
  }
  const getVisiblePages = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    pages.push(1);

    if (currentPage > 3) {
      pages.push("...");
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push("...");
    }

    pages.push(totalPages);

    return pages;
  };

  // const startItem = (currentPage - 1) * itemsPerPage + 1;
  // const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePrevious = () => {
    onPageChange(Math.max(currentPage - 1, 1));
  };

  const handleNext = () => {
    onPageChange(Math.min(currentPage + 1, totalPages));
  };

  const handlePageClick = (page: number) => {
    onPageChange(page);
  };

  return (
    <div className={`flex items-center justify-end mt-6 ${className}`}>
      {/* <div className="text-sm text-muted-foreground">
        Showing {startItem} to {endItem} of {totalItems} items
      </div> */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <div className="flex items-center gap-1">
          {getVisiblePages().map((page, index) =>
            page === "..." ? (
              <span
                key={`ellipsis-${index}`}
                className="px-2 text-muted-foreground"
              >
                ...
              </span>
            ) : (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageClick(Number(page))}
                className="w-8 h-8 p-0"
              >
                {page}
              </Button>
            ),
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={currentPage === totalPages}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
