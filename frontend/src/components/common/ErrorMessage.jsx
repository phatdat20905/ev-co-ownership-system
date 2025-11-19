import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorMessage({ error, onRetry }) {
  if (!error) return null;

  return (
    <div className="flex flex-col items-center justify-center py-8 px-4">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-red-800">Đã xảy ra lỗi</h3>
            <p className="mt-2 text-sm text-red-700">
              {typeof error === 'string' ? error : error.message || 'Có lỗi xảy ra, vui lòng thử lại'}
            </p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-sm font-medium transition"
              >
                <RefreshCw className="h-4 w-4" />
                Thử lại
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
