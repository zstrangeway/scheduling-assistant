import { Card, CardContent } from "../molecules/card";

interface LoadingSkeletonProps {
  variant?: 'cards' | 'list' | 'detail';
  count?: number;
}

export function LoadingSkeleton({ variant = 'cards', count = 3 }: LoadingSkeletonProps) {
  const renderHeader = () => (
    <div className="animate-pulse">
      <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
      <div className="h-4 bg-muted rounded w-1/2"></div>
    </div>
  );

  const renderCardsSkeleton = () => (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="animate-pulse flex items-center">
              <div className="w-8 h-8 bg-muted rounded-lg"></div>
              <div className="ml-5 flex-1">
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-6 bg-muted rounded w-1/3"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderListSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="animate-pulse flex items-center space-x-4">
              <div className="w-10 h-10 bg-muted rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderDetailSkeleton = () => (
    <div className="grid gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-muted rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-muted rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded w-1/3 mb-1"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderContent = () => {
    switch (variant) {
      case 'list':
        return renderListSkeleton();
      case 'detail':
        return renderDetailSkeleton();
      case 'cards':
      default:
        return renderCardsSkeleton();
    }
  };

  return (
    <div className="space-y-6">
      {renderHeader()}
      {renderContent()}
    </div>
  );
}