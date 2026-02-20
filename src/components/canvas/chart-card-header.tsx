"use client";

import {
  MoreHorizontal,
  GripVertical,
  Maximize2,
  Trash2,
  MessageSquare,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ChartCardHeaderProps {
  title: string;
  description?: string;
  onRefine?: () => void;
  onMaximize?: () => void;
  onExport?: () => void;
  onDelete?: () => void;
}

export function ChartCardHeader({
  title,
  description,
  onRefine,
  onMaximize,
  onExport,
  onDelete,
}: ChartCardHeaderProps) {
  return (
    <div className="flex items-center gap-1 px-3 py-2 border-b bg-card">
      <div className="drag-handle cursor-grab active:cursor-grabbing p-0.5">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium truncate">{title}</h4>
          </div>
        </TooltipTrigger>
        {description && (
          <TooltipContent side="bottom" className="max-w-[300px]">
            <p className="text-xs">{description}</p>
          </TooltipContent>
        )}
      </Tooltip>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
            <MoreHorizontal className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onRefine && (
            <DropdownMenuItem onClick={onRefine}>
              <MessageSquare className="h-3.5 w-3.5 mr-2" />
              Refine with AI
            </DropdownMenuItem>
          )}
          {onMaximize && (
            <DropdownMenuItem onClick={onMaximize}>
              <Maximize2 className="h-3.5 w-3.5 mr-2" />
              Maximize
            </DropdownMenuItem>
          )}
          {onExport && (
            <DropdownMenuItem onClick={onExport}>
              <Download className="h-3.5 w-3.5 mr-2" />
              Export PNG
            </DropdownMenuItem>
          )}
          {onDelete && (
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="h-3.5 w-3.5 mr-2" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
