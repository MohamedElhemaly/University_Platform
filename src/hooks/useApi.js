import { useState, useEffect, useCallback } from 'react'

/**
 * Custom hook for API calls with loading and error states
 * @param {Function} apiFunction - The API function to call
 * @param {Array} dependencies - Dependencies that trigger refetch
 * @param {boolean} immediate - Whether to call immediately on mount
 */
export function useApi(apiFunction, dependencies = [], immediate = true) {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(immediate)
  const [error, setError] = useState(null)

  const execute = useCallback(async (...args) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await apiFunction(...args)
      setData(result)
      return result
    } catch (err) {
      setError(err.message || 'حدث خطأ غير متوقع')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [apiFunction])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, dependencies)

  const refetch = useCallback(() => execute(), [execute])

  return { data, isLoading, error, execute, refetch, setData }
}

/**
 * Custom hook for mutations (POST, PUT, DELETE)
 * @param {Function} apiFunction - The API function to call
 */
export function useMutation(apiFunction) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const mutate = useCallback(async (...args) => {
    setIsLoading(true)
    setError(null)
    setIsSuccess(false)
    try {
      const result = await apiFunction(...args)
      setIsSuccess(true)
      return result
    } catch (err) {
      setError(err.message || 'حدث خطأ غير متوقع')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [apiFunction])

  const reset = useCallback(() => {
    setIsLoading(false)
    setError(null)
    setIsSuccess(false)
  }, [])

  return { mutate, isLoading, error, isSuccess, reset }
}

/**
 * Custom hook for paginated API calls
 * @param {Function} apiFunction - The API function to call
 * @param {Object} initialFilters - Initial filter values
 */
export function usePaginatedApi(apiFunction, initialFilters = {}) {
  const [data, setData] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })
  const [filters, setFilters] = useState(initialFilters)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async (page = 1) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await apiFunction({ ...filters, page, limit: pagination.limit })
      setData(result.data || result)
      setPagination(prev => ({
        ...prev,
        page,
        total: result.total || result.length,
        totalPages: result.totalPages || Math.ceil((result.total || result.length) / prev.limit),
      }))
    } catch (err) {
      setError(err.message || 'حدث خطأ غير متوقع')
    } finally {
      setIsLoading(false)
    }
  }, [apiFunction, filters, pagination.limit])

  useEffect(() => {
    fetchData(1)
  }, [filters])

  const goToPage = useCallback((page) => {
    fetchData(page)
  }, [fetchData])

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  const refetch = useCallback(() => fetchData(pagination.page), [fetchData, pagination.page])

  return {
    data,
    pagination,
    filters,
    isLoading,
    error,
    goToPage,
    updateFilters,
    refetch,
  }
}
