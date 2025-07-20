'use client'

import { Card, CardBody, CardHeader, Divider, Chip, Progress, Button, Accordion, AccordionItem } from '@nextui-org/react'
import { AnalysisReport, AnalysisContent } from '@/types'
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, LightBulbIcon, ExclamationTriangleIcon, SparklesIcon, ChartBarIcon } from '@heroicons/react/24/outline'

interface AnalysisCardProps {
  analysis: AnalysisReport
  productName?: string
  onViewDetails?: () => void
  compact?: boolean
}

export function AnalysisCard({ analysis, productName, onViewDetails, compact = false }: AnalysisCardProps) {
  const content = analysis.content

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return 'success'
      case 'negative':
        return 'danger'
      default:
        return 'warning'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'success'
    if (confidence >= 50) return 'warning'
    return 'danger'
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'danger'
      case 'medium':
        return 'warning'
      default:
        return 'default'
    }
  }

  if (compact) {
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex justify-between items-start">
          <div className="flex-1">
            {productName && <h3 className="text-lg font-semibold">{productName}</h3>}
            <p className="text-small text-default-500 mt-1">
              {new Date(analysis.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            <Chip size="sm" color={getConfidenceColor(analysis.confidence)}>
              {analysis.confidence}% confidence
            </Chip>
            <Chip size="sm" variant="flat">
              {analysis.analysisType}
            </Chip>
          </div>
        </CardHeader>
        <CardBody>
          <p className="text-small text-default-600 line-clamp-3">{content.summary}</p>
          {onViewDetails && (
            <Button 
              size="sm" 
              color="primary" 
              variant="flat" 
              onClick={onViewDetails}
              className="mt-3"
            >
              View Details
            </Button>
          )}
        </CardBody>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex justify-between items-start">
        <div className="flex-1">
          {productName && <h3 className="text-xl font-semibold">{productName}</h3>}
          <p className="text-small text-default-500 mt-1">
            Analysis from {new Date(analysis.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Chip color={getConfidenceColor(analysis.confidence)}>
            {analysis.confidence}% confidence
          </Chip>
          <Chip variant="flat">
            {analysis.analysisType}
          </Chip>
        </div>
      </CardHeader>
      <Divider />
      <CardBody className="space-y-4">
        {/* Summary */}
        <div>
          <h4 className="font-semibold mb-2">Summary</h4>
          <p className="text-default-600">{content.summary}</p>
        </div>

        {/* Metrics */}
        {content.metrics && (
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <ChartBarIcon className="h-4 w-4" />
              Key Metrics
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {content.metrics.innovationScore !== undefined && (
                <div className="space-y-1">
                  <p className="text-small text-default-500">Innovation</p>
                  <Progress 
                    value={content.metrics.innovationScore} 
                    color={content.metrics.innovationScore >= 70 ? 'success' : 'warning'}
                    size="sm"
                    showValueLabel
                  />
                </div>
              )}
              {content.metrics.executionScore !== undefined && (
                <div className="space-y-1">
                  <p className="text-small text-default-500">Execution</p>
                  <Progress 
                    value={content.metrics.executionScore} 
                    color={content.metrics.executionScore >= 70 ? 'success' : 'warning'}
                    size="sm"
                    showValueLabel
                  />
                </div>
              )}
              {content.metrics.viabilityScore !== undefined && (
                <div className="space-y-1">
                  <p className="text-small text-default-500">Viability</p>
                  <Progress 
                    value={content.metrics.viabilityScore} 
                    color={content.metrics.viabilityScore >= 70 ? 'success' : 'warning'}
                    size="sm"
                    showValueLabel
                  />
                </div>
              )}
              {content.metrics.overallScore !== undefined && (
                <div className="space-y-1">
                  <p className="text-small text-default-500">Overall</p>
                  <Progress 
                    value={content.metrics.overallScore} 
                    color={content.metrics.overallScore >= 70 ? 'success' : 'warning'}
                    size="sm"
                    showValueLabel
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sentiment Analysis */}
        {content.sentimentAnalysis && (
          <div>
            <h4 className="font-semibold mb-2">Sentiment Analysis</h4>
            <div className="flex items-center gap-3 mb-2">
              <Chip color={getSentimentColor(content.sentimentAnalysis.overallSentiment)}>
                {content.sentimentAnalysis.overallSentiment}
              </Chip>
              <span className="text-small text-default-500">
                Score: {content.sentimentAnalysis.sentimentScore}
              </span>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {content.sentimentAnalysis.positiveAspects.length > 0 && (
                <div>
                  <p className="text-small font-medium text-success flex items-center gap-1 mb-1">
                    <ArrowTrendingUpIcon className="h-3 w-3" />
                    Positive Aspects
                  </p>
                  <ul className="list-disc list-inside text-small text-default-600 space-y-1">
                    {content.sentimentAnalysis.positiveAspects.slice(0, 3).map((aspect, i) => (
                      <li key={i}>{aspect}</li>
                    ))}
                  </ul>
                </div>
              )}
              {content.sentimentAnalysis.negativeAspects.length > 0 && (
                <div>
                  <p className="text-small font-medium text-danger flex items-center gap-1 mb-1">
                    <ArrowTrendingDownIcon className="h-3 w-3" />
                    Negative Aspects
                  </p>
                  <ul className="list-disc list-inside text-small text-default-600 space-y-1">
                    {content.sentimentAnalysis.negativeAspects.slice(0, 3).map((aspect, i) => (
                      <li key={i}>{aspect}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Insights & Recommendations */}
        <Accordion variant="bordered">
          {content.insights && content.insights.length > 0 && (
            <AccordionItem
              key="insights"
              aria-label="Insights"
              title={
                <span className="flex items-center gap-2">
                  <LightBulbIcon className="h-4 w-4" />
                  Key Insights ({content.insights.length})
                </span>
              }
            >
              <div className="space-y-2">
                {content.insights.map((insight, i) => (
                  <div key={i} className="border-l-2 border-primary pl-3">
                    <p className="font-medium text-small">{insight.title}</p>
                    <p className="text-small text-default-600">{insight.description}</p>
                    <Chip size="sm" variant="flat" className="mt-1">
                      {insight.significance} significance
                    </Chip>
                  </div>
                ))}
              </div>
            </AccordionItem>
          )}

          {content.recommendations && content.recommendations.length > 0 && (
            <AccordionItem
              key="recommendations"
              aria-label="Recommendations"
              title={
                <span className="flex items-center gap-2">
                  <SparklesIcon className="h-4 w-4" />
                  Recommendations ({content.recommendations.length})
                </span>
              }
            >
              <div className="space-y-2">
                {content.recommendations.map((rec, i) => (
                  <div key={i} className="border-l-2 border-secondary pl-3">
                    <div className="flex items-start justify-between">
                      <p className="font-medium text-small">{rec.title}</p>
                      <Chip size="sm" color={getPriorityColor(rec.priority)}>
                        {rec.priority}
                      </Chip>
                    </div>
                    <p className="text-small text-default-600 mt-1">{rec.description}</p>
                    <div className="flex gap-2 mt-1">
                      <Chip size="sm" variant="flat">{rec.category}</Chip>
                      {rec.timeframe && <Chip size="sm" variant="flat">{rec.timeframe}</Chip>}
                    </div>
                  </div>
                ))}
              </div>
            </AccordionItem>
          )}

          {content.risks && content.risks.length > 0 && (
            <AccordionItem
              key="risks"
              aria-label="Risks"
              title={
                <span className="flex items-center gap-2">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  Risks ({content.risks.length})
                </span>
              }
            >
              <div className="space-y-2">
                {content.risks.map((risk, i) => (
                  <div key={i} className="border-l-2 border-danger pl-3">
                    <div className="flex items-start justify-between">
                      <p className="font-medium text-small">{risk.title}</p>
                      <div className="flex gap-1">
                        <Chip size="sm" color={getPriorityColor(risk.severity)}>
                          {risk.severity} severity
                        </Chip>
                        <Chip size="sm" variant="flat">
                          {risk.likelihood} likelihood
                        </Chip>
                      </div>
                    </div>
                    <p className="text-small text-default-600 mt-1">{risk.description}</p>
                    {risk.mitigation && (
                      <p className="text-small text-default-500 mt-1">
                        <span className="font-medium">Mitigation:</span> {risk.mitigation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </AccordionItem>
          )}
        </Accordion>

        {/* Market Analysis */}
        {content.marketAnalysis && (
          <div>
            <h4 className="font-semibold mb-2">Market Analysis</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-small text-default-500">Growth Potential:</span>
                <Chip size="sm" color={content.marketAnalysis.growthPotential === 'high' ? 'success' : content.marketAnalysis.growthPotential === 'medium' ? 'warning' : 'default'}>
                  {content.marketAnalysis.growthPotential}
                </Chip>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-small text-default-500">Product-Market Fit:</span>
                <Progress 
                  value={content.marketAnalysis.productMarketFit} 
                  size="sm" 
                  className="max-w-[200px]"
                  showValueLabel
                />
              </div>
              {content.marketAnalysis.targetAudience.length > 0 && (
                <div>
                  <span className="text-small text-default-500">Target Audience:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {content.marketAnalysis.targetAudience.map((audience, i) => (
                      <Chip key={i} size="sm" variant="flat">{audience}</Chip>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {onViewDetails && (
          <Button 
            color="primary" 
            onClick={onViewDetails}
            className="w-full"
          >
            View Full Analysis
          </Button>
        )}
      </CardBody>
    </Card>
  )
}