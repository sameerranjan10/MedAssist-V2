/**
 * pages/doctor/ReportVerify.jsx
 * Direct deep-link to verify a specific report by ID.
 * Redirects to PendingReports with that report pre-selected.
 */
import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

export default function ReportVerify() {
  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    // In a full implementation, load report by ID and show verify form.
    // For now redirect to pending reports list.
    navigate('/doctor/pending')
  }, [id])

  return null
}
