/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/EmptyState';
import { FileText, Plus } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground mt-2">
            Generate and manage professional educational psychology reports.
          </p>
        </div>
        <Link href="/reports/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New Report
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Reports
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              +0% from last month
            </p>
          </CardContent>
        </Card>
        {/* Add more stats cards here if needed */}
      </div>

      <div className="grid gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Recent Reports</h2>
        <EmptyState
          title="No reports found"
          description="Get started by creating your first professional report using our templates."
          icon={<FileText className="h-8 w-8 text-blue-500" />}
          actionLabel="Create report"
          actionHref="/reports/create"
        />
      </div>
    </div>
  );
}
