/**
 * Loading and empty state components for employee management
 * Provides consistent loading and empty state UI
 */

import React, { memo } from 'react';
import { FiRefreshCw, FiUsers, FiUserPlus } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

/**
 * LoadingState Component
 * @param {Object} props - Component props
 * @param {string} props.message - Loading message
 */
export const LoadingState = memo(({ message = 'Loading employees...' }) => (
  <div className="flex flex-col items-center justify-center py-12 space-y-4">
    <FiRefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
    <p className="text-muted-foreground" aria-live="polite">
      {message}
    </p>
  </div>
));

LoadingState.displayName = 'LoadingState';

/**
 * EmptyState Component
 * @param {Object} props - Component props
 * @param {Function} props.onAddEmployee - Handler for adding first employee
 * @param {boolean} props.hasFilters - Whether filters are applied
 * @param {Function} props.onResetFilters - Handler to reset filters
 */
export const EmptyState = memo(({ 
  onAddEmployee, 
  hasFilters = false, 
  onResetFilters 
}) => (
  <Card className="border-dashed">
    <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
      <div className="rounded-full bg-muted p-4">
        <FiUsers className="h-8 w-8 text-muted-foreground" />
      </div>
      
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">
          {hasFilters ? 'No employees found' : 'No employees yet'}
        </h3>
        <p className="text-muted-foreground max-w-md">
          {hasFilters 
            ? 'No employees match your current search criteria. Try adjusting your filters or search terms.'
            : 'Get started by adding your first employee to the system.'
          }
        </p>
      </div>

      <div className="flex gap-2">
        {hasFilters ? (
          <>
            <Button variant="outline" onClick={onResetFilters}>
              Clear filters
            </Button>
            <Button onClick={onAddEmployee}>
              <FiUserPlus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </>
        ) : (
          <Button onClick={onAddEmployee}>
            <FiUserPlus className="mr-2 h-4 w-4" />
            Add First Employee
          </Button>
        )}
      </div>
    </CardContent>
  </Card>
));

EmptyState.displayName = 'EmptyState';

/**
 * ErrorState Component
 * @param {Object} props - Component props
 * @param {string} props.error - Error message
 * @param {Function} props.onRetry - Handler to retry the operation
 */
export const ErrorState = memo(({ error, onRetry }) => (
  <Card className="border-destructive">
    <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
      <div className="rounded-full bg-destructive/10 p-4">
        <FiRefreshCw className="h-8 w-8 text-destructive" />
      </div>
      
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-destructive">
          Failed to load employees
        </h3>
        <p className="text-muted-foreground max-w-md">
          {error || 'An error occurred while loading employee data. Please try again.'}
        </p>
      </div>

      <Button onClick={onRetry} variant="outline">
        <FiRefreshCw className="mr-2 h-4 w-4" />
        Try Again
      </Button>
    </CardContent>
  </Card>
));

ErrorState.displayName = 'ErrorState';
