import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Filter, ArrowUpDown, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type SortField = 'name' | 'score' | 'createdAt' | 'stage';
export type SortOrder = 'asc' | 'desc';

interface LeadFiltersProps {
  stages: string[];
  sources: string[];
  selectedStages: string[];
  selectedSources: string[];
  sortField: SortField;
  sortOrder: SortOrder;
  onStageChange: (stages: string[]) => void;
  onSourceChange: (sources: string[]) => void;
  onSortChange: (field: SortField, order: SortOrder) => void;
  onClearFilters: () => void;
}

const stageLabels: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  booked: "Booked",
  qualified: "Qualified",
  won: "Won",
  lost: "Lost",
};

const sortLabels: Record<SortField, string> = {
  name: "Name",
  score: "Score",
  createdAt: "Date Created",
  stage: "Stage",
};

export function LeadFilters({
  stages,
  sources,
  selectedStages,
  selectedSources,
  sortField,
  sortOrder,
  onStageChange,
  onSourceChange,
  onSortChange,
  onClearFilters,
}: LeadFiltersProps) {
  const hasActiveFilters = selectedStages.length > 0 || selectedSources.length > 0;
  const activeFilterCount = selectedStages.length + selectedSources.length;

  const toggleStage = (stage: string) => {
    if (selectedStages.includes(stage)) {
      onStageChange(selectedStages.filter(s => s !== stage));
    } else {
      onStageChange([...selectedStages, stage]);
    }
  };

  const toggleSource = (source: string) => {
    if (selectedSources.includes(source)) {
      onSourceChange(selectedSources.filter(s => s !== source));
    } else {
      onSourceChange([...selectedSources, source]);
    }
  };

  const handleSortClick = (field: SortField) => {
    if (sortField === field) {
      onSortChange(field, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      onSortChange(field, 'desc');
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Filter Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Filter by Stage</DropdownMenuLabel>
          {stages.map(stage => (
            <DropdownMenuCheckboxItem
              key={stage}
              checked={selectedStages.includes(stage)}
              onCheckedChange={() => toggleStage(stage)}
            >
              {stageLabels[stage] || stage}
            </DropdownMenuCheckboxItem>
          ))}
          
          {sources.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Filter by Source</DropdownMenuLabel>
              {sources.map(source => (
                <DropdownMenuCheckboxItem
                  key={source}
                  checked={selectedSources.includes(source)}
                  onCheckedChange={() => toggleSource(source)}
                >
                  {source}
                </DropdownMenuCheckboxItem>
              ))}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Sort Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <ArrowUpDown className="h-4 w-4" />
            Sort: {sortLabels[sortField]}
            <span className="text-xs text-muted-foreground">
              ({sortOrder === 'asc' ? '↑' : '↓'})
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          {(Object.keys(sortLabels) as SortField[]).map(field => (
            <DropdownMenuCheckboxItem
              key={field}
              checked={sortField === field}
              onCheckedChange={() => handleSortClick(field)}
            >
              {sortLabels[field]}
              {sortField === field && (
                <span className="ml-auto text-xs">
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1 text-muted-foreground"
          onClick={onClearFilters}
        >
          <X className="h-3 w-3" />
          Clear
        </Button>
      )}
    </div>
  );
}
