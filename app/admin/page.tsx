'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { WorkflowCard, LoadingState, ErrorState } from '@/components/shared'
import { Workflow, DashboardStats } from '@/types'
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Divider, 
  Button, 
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
  useDisclosure,
  Progress,
  Tabs,
  Tab
} from '@nextui-org/react'
import { 
  PlusIcon, 
  ArrowPathIcon,
  ChartBarIcon,
  CogIcon,
  BoltIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function AdminPage() {
  const router = useRouter()
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const [activeTab, setActiveTab] = useState('overview')
  
  // Fetch data
  const { data: stats, error: statsError, isLoading: statsLoading, mutate: mutateStats } = useSWR<DashboardStats>('/api/admin/stats', fetcher)
  const { data: workflows, error: workflowsError, isLoading: workflowsLoading, mutate: mutateWorkflows } = useSWR<Workflow[]>('/api/workflows', fetcher)
  
  // Form state for new workflow
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
    webhookUrl: '',
    schedule: '',
    minVotes: 0,
  })

  const handleCreateWorkflow = async () => {
    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newWorkflow,
          isActive: false,
          configuration: {
            schedule: newWorkflow.schedule,
            filters: {
              minVotes: newWorkflow.minVotes || undefined,
            },
          },
        }),
      })
      
      if (response.ok) {
        mutateWorkflows()
        onOpenChange()
        setNewWorkflow({
          name: '',
          description: '',
          webhookUrl: '',
          schedule: '',
          minVotes: 0,
        })
      }
    } catch (error) {
      console.error('Failed to create workflow:', error)
    }
  }

  const handleToggleWorkflow = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/workflows/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      })
      
      if (response.ok) {
        mutateWorkflows()
        mutateStats()
      }
    } catch (error) {
      console.error('Failed to toggle workflow:', error)
    }
  }

  const handleDeleteWorkflow = async (id: string) => {
    try {
      const response = await fetch(`/api/workflows/${id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        mutateWorkflows()
        mutateStats()
      }
    } catch (error) {
      console.error('Failed to delete workflow:', error)
    }
  }

  const handleRunWorkflow = async (id: string) => {
    try {
      const response = await fetch(`/api/workflows/${id}/run`, {
        method: 'POST',
      })
      
      if (response.ok) {
        // TODO: Show success notification
        mutateStats()
      }
    } catch (error) {
      console.error('Failed to run workflow:', error)
    }
  }

  if (statsLoading || workflowsLoading) {
    return <LoadingState message="Loading admin dashboard..." />
  }

  if (statsError || workflowsError) {
    return (
      <ErrorState
        title="Failed to load dashboard"
        message="Unable to fetch dashboard data. Please check your authentication and try again."
        onRetry={() => {
          mutateStats()
          mutateWorkflows()
        }}
      />
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-default-500 mt-1">Manage workflows and monitor system activity</p>
        </div>
        <Button 
          color="primary" 
          startContent={<PlusIcon className="h-4 w-4" />}
          onClick={onOpen}
        >
          New Workflow
        </Button>
      </div>

      <Tabs 
        aria-label="Admin sections" 
        selectedKey={activeTab} 
        onSelectionChange={(key) => setActiveTab(key as string)}
      >
        <Tab 
          key="overview" 
          title={
            <div className="flex items-center gap-2">
              <ChartBarIcon className="h-4 w-4" />
              Overview
            </div>
          }
        >
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-small text-default-500">Total Products</p>
                    <p className="text-2xl font-bold">{stats?.totalProducts || 0}</p>
                  </div>
                  <ChartBarIcon className="h-8 w-8 text-primary" />
                </div>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-small text-default-500">Total Analyses</p>
                    <p className="text-2xl font-bold">{stats?.totalAnalysis || 0}</p>
                  </div>
                  <BoltIcon className="h-8 w-8 text-secondary" />
                </div>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-small text-default-500">Active Workflows</p>
                    <p className="text-2xl font-bold">{stats?.activeWorkflows || 0}</p>
                  </div>
                  <CogIcon className="h-8 w-8 text-success" />
                </div>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-small text-default-500">Recent Executions</p>
                    <p className="text-2xl font-bold">{stats?.recentExecutions?.length || 0}</p>
                  </div>
                  <ClockIcon className="h-8 w-8 text-warning" />
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Analysis Breakdown */}
          {stats?.analysisBreakdown && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Analysis by Type</h3>
                </CardHeader>
                <Divider />
                <CardBody>
                  <div className="space-y-3">
                    {Object.entries(stats.analysisBreakdown.byType).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-small capitalize">{type.replace('_', ' ')}</span>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={(count / stats.totalAnalysis) * 100} 
                            className="w-24"
                            size="sm"
                          />
                          <span className="text-small text-default-500 w-12 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Analysis by Confidence</h3>
                </CardHeader>
                <Divider />
                <CardBody>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-small">High Confidence (80%+)</span>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={(stats.analysisBreakdown.byConfidence.high / stats.totalAnalysis) * 100} 
                          color="success"
                          className="w-24"
                          size="sm"
                        />
                        <span className="text-small text-default-500 w-12 text-right">
                          {stats.analysisBreakdown.byConfidence.high}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-small">Medium Confidence (50-79%)</span>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={(stats.analysisBreakdown.byConfidence.medium / stats.totalAnalysis) * 100} 
                          color="warning"
                          className="w-24"
                          size="sm"
                        />
                        <span className="text-small text-default-500 w-12 text-right">
                          {stats.analysisBreakdown.byConfidence.medium}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-small">Low Confidence (&lt;50%)</span>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={(stats.analysisBreakdown.byConfidence.low / stats.totalAnalysis) * 100} 
                          color="danger"
                          className="w-24"
                          size="sm"
                        />
                        <span className="text-small text-default-500 w-12 text-right">
                          {stats.analysisBreakdown.byConfidence.low}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          )}

          {/* Recent Executions */}
          {stats?.recentExecutions && stats.recentExecutions.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Recent Workflow Executions</h3>
              </CardHeader>
              <Divider />
              <CardBody>
                <div className="space-y-2">
                  {stats.recentExecutions.slice(0, 5).map((execution) => (
                    <div key={execution.id} className="flex justify-between items-center p-2 rounded-lg hover:bg-default-100">
                      <div>
                        <p className="text-small font-medium">Workflow ID: {execution.workflowId}</p>
                        <p className="text-tiny text-default-500">
                          Started: {new Date(execution.startedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {execution.productsProcessed && (
                          <Chip size="sm" variant="flat">
                            {execution.productsProcessed} products
                          </Chip>
                        )}
                        <Chip 
                          size="sm" 
                          color={
                            execution.status === 'completed' ? 'success' : 
                            execution.status === 'failed' ? 'danger' : 
                            execution.status === 'running' ? 'warning' : 'default'
                          }
                        >
                          {execution.status}
                        </Chip>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
        </Tab>

        <Tab 
          key="workflows" 
          title={
            <div className="flex items-center gap-2">
              <CogIcon className="h-4 w-4" />
              Workflows
            </div>
          }
        >
          <div className="mb-4 flex justify-between items-center">
            <p className="text-default-500">
              Manage automated workflows for product discovery and analysis
            </p>
            <Button 
              size="sm"
              startContent={<ArrowPathIcon className="h-4 w-4" />}
              onClick={() => mutateWorkflows()}
              variant="flat"
            >
              Refresh
            </Button>
          </div>

          {workflows && workflows.length === 0 ? (
            <Card>
              <CardBody className="text-center py-8">
                <CogIcon className="h-12 w-12 text-default-300 mx-auto mb-4" />
                <p className="text-default-500 mb-4">No workflows configured yet</p>
                <Button color="primary" onClick={onOpen}>
                  Create Your First Workflow
                </Button>
              </CardBody>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workflows?.map((workflow) => (
                <WorkflowCard
                  key={workflow.id}
                  workflow={workflow}
                  onToggle={handleToggleWorkflow}
                  onEdit={(workflow) => {
                    // TODO: Implement edit functionality
                    console.log('Edit workflow:', workflow)
                  }}
                  onDelete={handleDeleteWorkflow}
                  onRun={handleRunWorkflow}
                />
              ))}
            </div>
          )}
        </Tab>
      </Tabs>

      {/* Create Workflow Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Create New Workflow</ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Input
                    label="Workflow Name"
                    placeholder="e.g., Daily Product Scanner"
                    value={newWorkflow.name}
                    onValueChange={(value) => setNewWorkflow({ ...newWorkflow, name: value })}
                    isRequired
                  />
                  <Textarea
                    label="Description"
                    placeholder="Describe what this workflow does..."
                    value={newWorkflow.description}
                    onValueChange={(value) => setNewWorkflow({ ...newWorkflow, description: value })}
                  />
                  <Input
                    label="Webhook URL"
                    placeholder="https://your-webhook-endpoint.com"
                    value={newWorkflow.webhookUrl}
                    onValueChange={(value) => setNewWorkflow({ ...newWorkflow, webhookUrl: value })}
                    isRequired
                  />
                  <Input
                    label="Schedule (Cron Expression)"
                    placeholder="e.g., 0 9 * * * (daily at 9am)"
                    value={newWorkflow.schedule}
                    onValueChange={(value) => setNewWorkflow({ ...newWorkflow, schedule: value })}
                    description="Leave empty for manual execution only"
                  />
                  <Input
                    type="number"
                    label="Minimum Votes Filter"
                    placeholder="0"
                    value={newWorkflow.minVotes.toString()}
                    onValueChange={(value) => setNewWorkflow({ ...newWorkflow, minVotes: parseInt(value) || 0 })}
                    description="Only process products with at least this many votes"
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button 
                  color="primary" 
                  onPress={handleCreateWorkflow}
                  isDisabled={!newWorkflow.name || !newWorkflow.webhookUrl}
                >
                  Create Workflow
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}