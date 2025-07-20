'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { AnalysisCard, LoadingState, ErrorState } from '@/components/shared'
import { AnalysisReport } from '@/types'
import { Input, Select, SelectItem, Button, Card, CardBody } from '@nextui-org/react'
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function AnalysisPage() {
  const router = useRouter()
  const { data: analyses, error, isLoading, mutate } = useSWR<AnalysisReport[]>('/api/analysis', fetcher)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterConfidence, setFilterConfidence] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Get unique analysis types from the data
  const analysisTypes = analyses ? Array.from(new Set(analyses.map(a => a.analysisType))) : []
  
  // Create select items for analysis types
  const analysisTypeItems = analysisTypes.map((type: string) => (
    <SelectItem key={type} value={type}>
      {type.replace('_', ' ')}
    </SelectItem>
  ))

  // Filter analyses based on search and filters
  const filteredAnalyses = analyses?.filter(analysis => {
    const matchesSearch = searchTerm === '' || 
      analysis.content.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      analysis.product?.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === 'all' || analysis.analysisType === filterType
    
    const matchesConfidence = filterConfidence === 'all' ||
      (filterConfidence === 'high' && analysis.confidence >= 80) ||
      (filterConfidence === 'medium' && analysis.confidence >= 50 && analysis.confidence < 80) ||
      (filterConfidence === 'low' && analysis.confidence < 50)
    
    return matchesSearch && matchesType && matchesConfidence
  }) || []

  if (isLoading) {
    return <LoadingState message="Loading analysis reports..." />
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load analyses"
        message="Unable to fetch analysis reports from the server. Please try again."
        onRetry={() => mutate()}
      />
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">AI Analysis Reports</h1>
        <p className="text-default-500">
          Comprehensive AI-powered analysis of ProductHunt products
        </p>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Search analyses..."
              value={searchTerm}
              onValueChange={setSearchTerm}
              startContent={<MagnifyingGlassIcon className="h-4 w-4" />}
              isClearable
              onClear={() => setSearchTerm('')}
              className="md:flex-1"
            />
            
            <Select
              label="Analysis Type"
              placeholder="All types"
              selectedKeys={[filterType]}
              onSelectionChange={(keys) => setFilterType(Array.from(keys)[0] as string)}
              startContent={<FunnelIcon className="h-4 w-4" />}
              className="md:w-48"
            >
              <SelectItem key="all" value="all">All types</SelectItem>
              <SelectItem key="market_fit" value="market_fit">Market Fit</SelectItem>
              <SelectItem key="competitive" value="competitive">Competitive</SelectItem>
              <SelectItem key="sentiment" value="sentiment">Sentiment</SelectItem>
              <SelectItem key="comprehensive" value="comprehensive">Comprehensive</SelectItem>
            </Select>
            
            <Select
              label="Confidence Level"
              placeholder="All levels"
              selectedKeys={[filterConfidence]}
              onSelectionChange={(keys) => setFilterConfidence(Array.from(keys)[0] as string)}
              className="md:w-48"
            >
              <SelectItem key="all" value="all">All levels</SelectItem>
              <SelectItem key="high" value="high">High (80%+)</SelectItem>
              <SelectItem key="medium" value="medium">Medium (50-79%)</SelectItem>
              <SelectItem key="low" value="low">Low (&lt;50%)</SelectItem>
            </Select>

            <div className="flex gap-2">
              <Button
                isIconOnly
                variant={viewMode === 'grid' ? 'solid' : 'flat'}
                onClick={() => setViewMode('grid')}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </Button>
              <Button
                isIconOnly
                variant={viewMode === 'list' ? 'solid' : 'flat'}
                onClick={() => setViewMode('list')}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
            </div>
          </div>
          
          <p className="text-small text-default-500 mt-2">
            Showing {filteredAnalyses.length} of {analyses?.length || 0} analyses
          </p>
        </CardBody>
      </Card>

      {/* Analysis Results */}
      {filteredAnalyses.length === 0 ? (
        <Card className="max-w-lg mx-auto">
          <CardBody>
            <p className="text-center text-default-500">
              {analyses?.length === 0 
                ? 'No analysis reports available yet. Reports will appear here once products are analyzed.'
                : 'No analyses match your current filters. Try adjusting your search criteria.'}
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 gap-4' 
          : 'space-y-4'
        }>
          {filteredAnalyses.map((analysis) => (
            <AnalysisCard
              key={analysis.id}
              analysis={analysis}
              productName={analysis.product?.name}
              onViewDetails={() => router.push(`/analysis/${analysis.id}`)}
              compact={viewMode === 'grid'}
            />
          ))}
        </div>
      )}
    </div>
  )
}