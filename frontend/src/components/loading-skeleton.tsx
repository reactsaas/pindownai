import React from 'react'

export const MarkdownLoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 p-4">
      {/* Title skeleton */}
      <div className="space-y-3">
        <div className="h-8 bg-muted animate-pulse rounded w-3/4" />
        <div className="h-6 bg-muted animate-pulse rounded w-1/2" />
      </div>

      {/* Paragraph skeletons */}
      <div className="space-y-3">
        <div className="h-4 bg-muted animate-pulse rounded w-full" />
        <div className="h-4 bg-muted animate-pulse rounded w-5/6" />
        <div className="h-4 bg-muted animate-pulse rounded w-4/5" />
      </div>

      {/* List skeleton */}
      <div className="space-y-2 ml-4">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-muted animate-pulse rounded-full" />
          <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-muted animate-pulse rounded-full" />
          <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-muted animate-pulse rounded-full" />
          <div className="h-4 bg-muted animate-pulse rounded w-4/5" />
        </div>
      </div>

      {/* Another paragraph */}
      <div className="space-y-2">
        <div className="h-4 bg-muted animate-pulse rounded w-full" />
        <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
      </div>

      {/* Variable placeholders */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <span className="text-muted-foreground">Template data:</span>
          <div className="h-5 w-24 bg-muted animate-pulse rounded" />
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-muted-foreground">Status:</span>
          <div className="h-5 w-16 bg-muted animate-pulse rounded" />
        </div>
      </div>
    </div>
  )
}
