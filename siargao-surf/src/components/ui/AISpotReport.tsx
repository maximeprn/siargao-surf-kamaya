'use client'

import { useState, useEffect } from 'react'

interface AIReport {
  title: string
  summary: string
  verdict: 'GO' | 'CONDITIONAL' | 'NO-GO'
}

interface AISpotReportProps {
  spotId?: string
  spotName?: string
  fallbackText: string
  locale?: 'en' | 'fr'
}

export default function AISpotReport({ spotId, spotName, fallbackText, locale = 'en' }: AISpotReportProps) {
  const [report, setReport] = useState<AIReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true)
        setError(false)
        
        const response = await fetch('/api/spot-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ spotId, spotName, locale })
        })

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const data = await response.json()
        if (data.report) {
          setReport(data.report)
        } else {
          throw new Error('No report in response')
        }
      } catch (err) {
        console.error('AI report failed:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    if (spotId || spotName) {
      fetchReport()
    }
  }, [spotId, spotName, locale])

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-white/10 rounded mb-3"></div>
        <div className="h-3 bg-white/10 rounded mb-2"></div>
        <div className="h-3 bg-white/10 rounded mb-2"></div>
        <div className="h-3 bg-white/10 rounded w-3/4"></div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <p className="report-text text-justify">
        {fallbackText}
      </p>
    )
  }

  return (
    <div>
      {report.title && (
        <h3 className="text-lg font-semibold mb-3 text-white">
          {report.title}
        </h3>
      )}
      
      <p className="report-text text-justify">
        {report.summary}
      </p>
    </div>
  )
}