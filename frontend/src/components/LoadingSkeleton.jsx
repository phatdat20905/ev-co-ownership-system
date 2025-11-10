// src/components/LoadingSkeleton.jsx
import React from 'react';

/**
 * Reusable loading skeleton components for better UX
 * Replace spinners with these skeletons to show content structure while loading
 */

// Base Skeleton Component
export const Skeleton = ({ className = '', variant = 'rectangular' }) => {
  const variants = {
    rectangular: 'rounded',
    circular: 'rounded-full',
    text: 'rounded',
  };

  return (
    <div
      className={`animate-pulse bg-gray-200 ${variants[variant]} ${className}`}
      role="status"
      aria-label="Loading..."
    />
  );
};

// Card Skeleton
export const CardSkeleton = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-6 space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <div className="flex space-x-2 pt-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      ))}
    </>
  );
};

// Table Skeleton
export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Table Header */}
      <div className="border-b border-gray-200 bg-gray-50 p-4">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton key={`header-${index}`} className="h-4 w-3/4" />
          ))}
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="p-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton key={`cell-${rowIndex}-${colIndex}`} className="h-4 w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// List Skeleton
export const ListSkeleton = ({ items = 5 }) => {
  return (
    <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="p-4 flex items-center space-x-4">
          <Skeleton variant="circular" className="w-12 h-12 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  );
};

// Stats Card Skeleton
export const StatsCardSkeleton = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-6 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton variant="circular" className="w-10 h-10" />
          </div>
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      ))}
    </div>
  );
};

// Form Skeleton
export const FormSkeleton = ({ fields = 5 }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <Skeleton className="h-8 w-48 mb-6" />
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex space-x-3 pt-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
};

// Profile Skeleton
export const ProfileSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="h-32 bg-gradient-to-r from-blue-400 to-indigo-500 relative">
        <div className="absolute -bottom-12 left-6">
          <Skeleton variant="circular" className="w-24 h-24 border-4 border-white" />
        </div>
      </div>

      {/* Body */}
      <div className="pt-16 px-6 pb-6 space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>

        <div className="flex space-x-3 pt-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  );
};

// Contract Details Skeleton (5 Tabs)
export const ContractDetailsSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-6 w-48" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="flex space-x-4">
          <Skeleton className="h-20 w-32" />
          <Skeleton className="h-20 w-32" />
          <Skeleton className="h-20 w-32" />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200 p-4">
          <div className="flex space-x-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-24" />
            ))}
          </div>
        </div>
        <div className="p-6 space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    </div>
  );
};

// Vehicle Details Skeleton (4 Tabs)
export const VehicleDetailsSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Header with Image */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Skeleton className="h-64 w-full" />
        <div className="p-6 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-full" />
          <div className="flex space-x-4">
            <Skeleton className="h-20 w-32" />
            <Skeleton className="h-20 w-32" />
            <Skeleton className="h-20 w-32" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200 p-4">
          <div className="flex space-x-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-28" />
            ))}
          </div>
        </div>
        <div className="p-6 space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    </div>
  );
};

// Notification Settings Skeleton
export const NotificationSettingsSkeleton = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-24" />
      </div>

      {/* 3 Channel Cards */}
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Skeleton variant="circular" className="w-12 h-12" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-6 w-12" />
          </div>
          <div className="space-y-3 pl-15">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-5 w-10" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Calendar Skeleton
export const CalendarSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-8" />
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Weekday headers */}
        {Array.from({ length: 7 }).map((_, index) => (
          <Skeleton key={`weekday-${index}`} className="h-8 w-full" />
        ))}
        {/* Days */}
        {Array.from({ length: 35 }).map((_, index) => (
          <Skeleton key={`day-${index}`} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
};

// Page Loading (Full Screen)
export const PageLoading = ({ message = 'Loading...' }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Skeleton variant="circular" className="w-3 h-3 animate-bounce" />
          <Skeleton variant="circular" className="w-3 h-3 animate-bounce delay-100" />
          <Skeleton variant="circular" className="w-3 h-3 animate-bounce delay-200" />
        </div>
        <p className="text-gray-500 font-medium">{message}</p>
      </div>
    </div>
  );
};

export default {
  Skeleton,
  CardSkeleton,
  TableSkeleton,
  ListSkeleton,
  StatsCardSkeleton,
  FormSkeleton,
  ProfileSkeleton,
  ContractDetailsSkeleton,
  VehicleDetailsSkeleton,
  NotificationSettingsSkeleton,
  CalendarSkeleton,
  PageLoading,
};
