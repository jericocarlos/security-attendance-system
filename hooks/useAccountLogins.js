import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

export function useAccountLogins() {
  // State
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ role: "" }); // Removed status
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [totalAccounts, setTotalAccounts] = useState(0);
  const { data: session } = useSession();

  // Fetch accounts with filters, search, and pagination
  const fetchAccounts = useCallback(async () => {
    if (!session?.user) return;
    
    try {
      setLoading(true);
      
      const searchParams = new URLSearchParams({
        search: searchQuery,
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        role: filters.role || ""
      });

      const response = await fetch(`/api/admin/accounts?${searchParams}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch accounts");
      }
      
      const data = await response.json();
      setAccounts(data.data || []);
      setTotalAccounts(data.total || 0);
    } catch (error) {
      console.error("Error fetching accounts:", error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, pagination.pageIndex, pagination.pageSize, filters, session]);

  // Create a new account
  const createAccount = useCallback(async (accountData) => {
    try {
      const response = await fetch("/api/admin/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(accountData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create account");
      }

      await fetchAccounts();
      return await response.json();
    } catch (error) {
      console.error("Error creating account:", error);
      throw error;
    }
  }, [fetchAccounts]);

  // Update an existing account
  const updateAccount = useCallback(async (id, accountData) => {
    try {
      const response = await fetch(`/api/admin/accounts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(accountData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update account");
      }

      await fetchAccounts();
      return await response.json();
    } catch (error) {
      console.error("Error updating account:", error);
      throw error;
    }
  }, [fetchAccounts]);

  // Delete an account
  const deleteAccount = useCallback(async (id) => {
    try {
      const response = await fetch(`/api/admin/accounts/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete account");
      }

      await fetchAccounts();
      return await response.json();
    } catch (error) {
      console.error("Error deleting account:", error);
      throw error;
    }
  }, [fetchAccounts]);

  // Fetch accounts on initial load and when dependencies change
  useEffect(() => {
    if (session?.user) {
      fetchAccounts();
    }
  }, [fetchAccounts, session]);

  return {
    accounts,
    loading,
    totalAccounts,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    pagination,
    setPagination,
    fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount
  };
}