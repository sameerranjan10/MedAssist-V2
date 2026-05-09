/**
 * hooks/useReports.js
 * Custom hook — fetches the current patient's reports with loading/error state.
 */
import { useEffect, useState, useCallback } from 'react'
import { reportsAPI } from '@/api/services'

export function useReports(options = {}) {
  const [reports, setReports]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  const fetch = useCallback(() => {
    setLoading(true)
    setError(null)
    reportsAPI.list(options)
      .then(r => setReports(r.data))
      .catch(e => setError(e.response?.data?.detail || 'Failed to load reports'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { reports, loading, error, refetch: fetch }
}

/**
 * hooks/useAnalysis.js
 * Fetch AI analysis for a specific report.
 */
export function useAnalysis(reportId) {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(!!reportId)
  const [error, setError]   = useState(null)

  useEffect(() => {
    if (!reportId) return
    setLoading(true)
    setError(null)
    reportsAPI.getAnalysis(reportId)
      .then(r => setData(r.data))
      .catch(e => setError(e.response?.data?.detail || 'Failed to load analysis'))
      .finally(() => setLoading(false))
  }, [reportId])

  return { data, loading, error }
}

/**
 * hooks/usePagination.js
 * Simple pagination state manager.
 */
export function usePagination(pageSize = 20) {
  const [page, setPage] = useState(0)
  const skip = page * pageSize

  return {
    page,
    skip,
    limit: pageSize,
    nextPage: () => setPage(p => p + 1),
    prevPage: () => setPage(p => Math.max(0, p - 1)),
    resetPage: () => setPage(0),
  }
}

/**
 * hooks/useDebounce.js
 * Debounce a value — useful for search inputs.
 */
import { useState as _useState, useEffect as _useEffect } from 'react'

export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = _useState(value)

  _useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
