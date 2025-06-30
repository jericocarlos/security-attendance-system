/**
 * Employee Management Page
 * 
 * Main page for managing employees with comprehensive CRUD operations,
 * filtering, searching, and data export/import capabilities.
 * 
 * Features:
 * - Employee listing with pagination
 * - Advanced search and filtering
 * - Employee creation and editing
 * - Employee deletion with confirmation
 * - Dashboard statistics
 * - Data export/import (future feature)
 * - Responsive design and accessibility
 */

"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  EmployeeTable, 
  EmployeeFormDialog, 
  FilterDialog, 
  DashboardStats,
  SearchAndFilterControls,
  EmployeeActions,
  LoadingState,
  EmptyState,
  ErrorState
} from "@/components/admin/employees";
import { useEmployeesManager } from "@/hooks/useEmployeesManager";
import PermissionGuard from "@/components/auth/PermissionGuard";

/**
 * EmployeesManagementPage Component
 * Main component for employee management functionality
 */
export default function EmployeesManagementPage() {
  const {
    // Data state
    employees,
    totalEmployees,
    departments,
    positions,
    leaders,
    
    // Loading states
    loading,
    loadingMetadata,
    submitting,
    
    // Filter and search state
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    pagination,
    setPagination,
    
    // Dialog state
    isFormDialogOpen,
    setIsFormDialogOpen,
    isFilterDialogOpen,
    setIsFilterDialogOpen,
    currentEmployee,
    
    // Error state
    error,
    
    // Actions
    handleEmployeeSubmit,
    openEmployeeForm,
    resetFilters,
    refreshEmployees,
  } = useEmployeesManager();

  /**
   * Memoized computed values for better performance
   */
  const computedValues = useMemo(() => {
    const hasActiveFilters = Object.values(filters).some(Boolean);
    const hasSearchQuery = searchQuery.trim().length > 0;
    const hasFiltersOrSearch = hasActiveFilters || hasSearchQuery;
    const showEmptyState = !loading && employees.length === 0;
    
    return {
      hasActiveFilters,
      hasSearchQuery,
      hasFiltersOrSearch,
      showEmptyState,
    };
  }, [filters, searchQuery, loading, employees.length]);

  /**
   * Placeholder handlers for future features
   */
  const handleExportEmployees = () => {
    // TODO: Implement employee data export
    console.log('Export employees functionality to be implemented');
  };

  const handleImportEmployees = () => {
    // TODO: Implement employee data import
    console.log('Import employees functionality to be implemented');
  };

  /**
   * Handles opening the filter dialog
   */
  const handleOpenFilter = () => {
    setIsFilterDialogOpen(true);
  };

  /**
   * Main content rendering based on current state
   */
  const renderMainContent = () => {
    // Error state
    if (error && !loading) {
      return (
        <ErrorState 
          error={error} 
          onRetry={refreshEmployees} 
        />
      );
    }

    // Loading state
    if (loading) {
      return <LoadingState message="Loading employees..." />;
    }

    // Empty state
    if (computedValues.showEmptyState) {
      return (
        <EmptyState
          hasFilters={computedValues.hasFiltersOrSearch}
          onAddEmployee={() => openEmployeeForm()}
          onResetFilters={resetFilters}
        />
      );
    }

    // Employee table
    return (
      <EmployeeTable 
        employees={employees}
        totalEmployees={totalEmployees}
        pagination={pagination}
        setPagination={setPagination}
        onEdit={openEmployeeForm}
        loading={loading}
      />
    );
  };

  return (
    <PermissionGuard module="employees_management">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Dashboard Statistics */}
        <DashboardStats />

        {/* Main Employee Management Card */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-bold">
                  Employee Management
                </CardTitle>
                <p className="text-muted-foreground mt-1">
                  Manage your organization&apos;s employees and their information
                </p>
              </div>
              
              {/* Header Actions */}
              <EmployeeActions
                onAddEmployee={() => openEmployeeForm()}
                onExportEmployees={handleExportEmployees}
                onImportEmployees={handleImportEmployees}
                loading={loading}
                totalEmployees={totalEmployees}
              />
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Search and Filter Controls */}
            <SearchAndFilterControls
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filters={filters}
              onOpenFilter={handleOpenFilter}
              onResetFilters={resetFilters}
              onRefresh={refreshEmployees}
              loading={loading}
            />

            {/* Main Content */}
            {renderMainContent()}
          </CardContent>
        </Card>

        {/* Employee Form Dialog */}
        <EmployeeFormDialog
          open={isFormDialogOpen}
          onOpenChange={setIsFormDialogOpen}
          employee={currentEmployee}
          departments={departments}
          positions={positions}
          leaders={leaders}
          onSubmit={handleEmployeeSubmit}
          isLoadingOptions={loadingMetadata}
          isSubmitting={submitting}
        />

        {/* Filter Dialog */}
        <FilterDialog
          open={isFilterDialogOpen}
          onOpenChange={setIsFilterDialogOpen}
          departments={departments}
          positions={positions}
          leaders={leaders}
          filters={filters}
          setFilters={setFilters}
          loading={loadingMetadata}
        />
      </div>
    </PermissionGuard>
  );
}