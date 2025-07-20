'use client'

import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { DataTable, Column, LoadingState, ErrorState } from '@/components/shared'
import { Product } from '@/types'
import { Chip, Link, User } from '@nextui-org/react'
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function ProductsPage() {
  const router = useRouter()
  const { data: products, error, isLoading, mutate } = useSWR<Product[]>('/api/products', fetcher)

  const columns: Column<Product>[] = [
    {
      key: 'name',
      label: 'Product',
      sortable: true,
      render: (product) => (
        <User
          name={product.name}
          description={product.tagline}
          avatarProps={{
            src: product.thumbnailUrl || undefined,
            name: product.name,
            size: 'sm',
          }}
        />
      ),
    },
    {
      key: 'votesCount',
      label: 'Votes',
      sortable: true,
      render: (product) => (
        <Chip size="sm" variant="flat">
          {product.votesCount} votes
        </Chip>
      ),
    },
    {
      key: 'categories',
      label: 'Categories',
      render: (product) => (
        <div className="flex flex-wrap gap-1">
          {product.categories.slice(0, 2).map((category, i) => (
            <Chip key={i} size="sm" variant="flat">
              {category}
            </Chip>
          ))}
          {product.categories.length > 2 && (
            <Chip size="sm" variant="flat">
              +{product.categories.length - 2}
            </Chip>
          )}
        </div>
      ),
    },
    {
      key: 'launchedAt',
      label: 'Launched',
      sortable: true,
      render: (product) => (
        <span className="text-small">
          {product.launchedAt 
            ? new Date(product.launchedAt).toLocaleDateString()
            : 'N/A'
          }
        </span>
      ),
    },
    {
      key: 'analysisReports',
      label: 'Analysis',
      render: (product) => {
        const hasAnalysis = product.analysisReports && product.analysisReports.length > 0
        return (
          <Chip
            size="sm"
            color={hasAnalysis ? 'success' : 'default'}
            variant={hasAnalysis ? 'solid' : 'flat'}
          >
            {hasAnalysis ? `${product.analysisReports!.length} reports` : 'No analysis'}
          </Chip>
        )
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (product) => (
        <div className="flex items-center gap-2">
          <Link
            href={product.productHuntUrl || '#'}
            isExternal
            showAnchorIcon
            anchorIcon={<ArrowTopRightOnSquareIcon className="h-3 w-3" />}
            size="sm"
          >
            View on PH
          </Link>
        </div>
      ),
    },
  ]

  if (isLoading) {
    return <LoadingState message="Loading products..." />
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load products"
        message="Unable to fetch products from the server. Please try again."
        onRetry={() => mutate()}
      />
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">ProductHunt Products</h1>
        <p className="text-default-500">
          Browse and analyze products from ProductHunt
        </p>
      </div>
      
      <DataTable
        data={(products || []) as any[]}
        columns={columns}
        loading={isLoading}
        emptyMessage="No products found. Products will appear here once they are scraped from ProductHunt."
        searchPlaceholder="Search products..."
        onRowAction={(key) => router.push(`/products/${key}`)}
        selectionMode="multiple"
        actions={[
          {
            key: 'analyze',
            label: 'Analyze Selected',
            color: 'primary',
            onClick: async (selectedProducts) => {
              // TODO: Implement bulk analysis
              console.log('Analyze products:', selectedProducts)
            },
          },
          {
            key: 'export',
            label: 'Export Selected',
            onClick: (selectedProducts) => {
              // TODO: Implement export functionality
              console.log('Export products:', selectedProducts)
            },
          },
        ]}
      />
    </div>
  )
}