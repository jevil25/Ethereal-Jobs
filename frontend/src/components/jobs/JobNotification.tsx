import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';
import { AlertCircle } from 'lucide-react';

const JobSearchNotification = () => {
  return (
    <Card className="w-full max-w-md mx-auto mt-6 border-2 border-amber-200">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3">
          <AlertCircle className="h-5 w-5 text-amber-500 mb-2 sm:mb-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800">
              This search aggregates jobs from multiple sources in real-time, which may take up to 30 seconds to complete.
            </p>
            <div className="mt-3 flex flex-wrap items-center">
              <div className="relative mr-3 mb-2 sm:mb-0">
                <div className="h-4 w-4 rounded-full border-2 border-amber-500 border-t-transparent animate-spin"></div>
              </div>
              <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs sm:text-sm break-normal">
                Please wait for best opportunities
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobSearchNotification;