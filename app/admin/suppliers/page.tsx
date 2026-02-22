import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Truck, Mail, Phone } from 'lucide-react'

export default async function SuppliersPage() {
  const supabase = await createClient()

  const { data: suppliers } = await supabase
    .from('suppliers')
    .select('*')
    .order('name')

  const categories = [...new Set(suppliers?.map((s) => s.category) || [])]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Suppliers</h1>
          <p className="text-gray-600 mt-1">Manage vendors and service providers</p>
        </div>
        <Link href="/admin/suppliers/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Supplier
          </Button>
        </Link>
      </div>

      {categories.length > 0 && (
        <div className="mb-6 flex gap-2 flex-wrap">
          {categories.map((category) => (
            <Badge key={category} variant="outline">
              {category}: {suppliers?.filter((s) => s.category === category).length}
            </Badge>
          ))}
        </div>
      )}

      {!suppliers || suppliers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Truck className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers yet</h3>
            <p className="text-gray-600 mb-4">Add suppliers to track vendors and contacts.</p>
            <Link href="/admin/suppliers/new">
              <Button>Add Supplier</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.map((supplier) => (
            <Link key={supplier.id} href={`/admin/suppliers/${supplier.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{supplier.name}</CardTitle>
                    <Badge variant="secondary">{supplier.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {supplier.contact_email && (
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {supplier.contact_email}
                    </p>
                  )}
                  {supplier.contact_phone && (
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {supplier.contact_phone}
                    </p>
                  )}
                  {supplier.notes && (
                    <p className="text-sm text-gray-500 line-clamp-2 mt-2">{supplier.notes}</p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
