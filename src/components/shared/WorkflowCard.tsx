'use client'

import { Card, CardBody, CardHeader, Divider, Chip, Button, Switch, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Input, Textarea } from '@nextui-org/react'
import { Workflow } from '@/types'
import { EllipsisVerticalIcon, PencilIcon, TrashIcon, PlayIcon, PauseIcon, ClockIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

interface WorkflowCardProps {
  workflow: Workflow
  onToggle: (id: string, isActive: boolean) => Promise<void>
  onEdit: (workflow: Workflow) => void
  onDelete: (id: string) => Promise<void>
  onRun: (id: string) => Promise<void>
  loading?: boolean
}

export function WorkflowCard({ workflow, onToggle, onEdit, onDelete, onRun, loading = false }: WorkflowCardProps) {
  const [isToggling, setIsToggling] = useState(false)
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  const handleToggle = async (isSelected: boolean) => {
    setIsToggling(true)
    try {
      await onToggle(workflow.id, isSelected)
    } finally {
      setIsToggling(false)
    }
  }

  const handleDelete = async () => {
    await onDelete(workflow.id)
    onOpenChange()
  }

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{workflow.name}</h3>
            {workflow.description && (
              <p className="text-small text-default-500 mt-1">{workflow.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Switch
              size="sm"
              isSelected={workflow.isActive}
              onValueChange={handleToggle}
              isDisabled={isToggling || loading}
              color="success"
            />
            <Dropdown>
              <DropdownTrigger>
                <Button 
                  isIconOnly 
                  size="sm" 
                  variant="light"
                  isDisabled={loading}
                >
                  <EllipsisVerticalIcon className="h-4 w-4" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Workflow actions">
                <DropdownItem
                  key="run"
                  startContent={<PlayIcon className="h-4 w-4" />}
                  onPress={() => onRun(workflow.id)}
                  isDisabled={!workflow.isActive}
                >
                  Run Now
                </DropdownItem>
                <DropdownItem
                  key="edit"
                  startContent={<PencilIcon className="h-4 w-4" />}
                  onPress={() => onEdit(workflow)}
                >
                  Edit
                </DropdownItem>
                <DropdownItem
                  key="delete"
                  color="danger"
                  className="text-danger"
                  startContent={<TrashIcon className="h-4 w-4" />}
                  onPress={onOpen}
                >
                  Delete
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-3">
          {/* Configuration Details */}
          <div className="space-y-2">
            {workflow.configuration.schedule && (
              <div className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-default-400" />
                <span className="text-small text-default-600">
                  Schedule: {workflow.configuration.schedule}
                </span>
              </div>
            )}
            
            {workflow.configuration.filters && (
              <div className="space-y-1">
                {workflow.configuration.filters.minVotes && (
                  <Chip size="sm" variant="flat">
                    Min votes: {workflow.configuration.filters.minVotes}
                  </Chip>
                )}
                {workflow.configuration.filters.categories && workflow.configuration.filters.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {workflow.configuration.filters.categories.map((cat, i) => (
                      <Chip key={i} size="sm" variant="flat">{cat}</Chip>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Webhook URL */}
          <div>
            <p className="text-small text-default-500 mb-1">Webhook URL:</p>
            <code className="text-tiny bg-default-100 p-1 rounded block truncate">
              {workflow.webhookUrl}
            </code>
          </div>

          {/* Status */}
          <div className="flex justify-between items-center text-small">
            <span className="text-default-500">
              Created {new Date(workflow.createdAt).toLocaleDateString()}
            </span>
            <Chip
              size="sm"
              color={workflow.isActive ? 'success' : 'default'}
              variant={workflow.isActive ? 'solid' : 'flat'}
            >
              {workflow.isActive ? 'Active' : 'Inactive'}
            </Chip>
          </div>
        </CardBody>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Delete Workflow</ModalHeader>
              <ModalBody>
                <p>
                  Are you sure you want to delete the workflow "{workflow.name}"? 
                  This action cannot be undone.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="danger" onPress={handleDelete}>
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}