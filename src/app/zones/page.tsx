
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ZonesPage() {
  return (
    <>
      <PageHeader
        title="Zone Management"
        description="Define operational areas for your fleet."
      />
      <Card>
        <CardHeader>
          <CardTitle>Feature Under Construction</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-12">
            The zone editor is currently being redesigned to provide a more stable and intuitive experience.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
