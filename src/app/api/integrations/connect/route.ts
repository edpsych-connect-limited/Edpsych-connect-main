import { NextResponse } from 'next/server';
import { IntegrationService } from '@/lib/integrations/service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { providerId, apiKey, url } = body;

    // In a real app, we'd get the tenantId from the session
    // const session = await getServerSession(authOptions);
    // const tenantId = session?.user?.tenantId;
    const tenantId = 'demo-tenant-id'; 

    const service = IntegrationService.getInstance();
    
    // Map providerId to service type
    let type: 'wonde' | 'sims' | undefined;
    if (providerId === 'wonde') type = 'wonde';
    else if (providerId === 'sims-legacy') type = 'sims';
    
    if (!type) {
        // For other providers not yet fully implemented in the backend service
        // We simulate a success for the demo "wiring up"
        return NextResponse.json({ success: true, status: 'connected', message: 'Integration enabled (Simulation)' });
    }

    const provider = service.getProvider({ type, apiKey, url });
    const isConnected = await provider.isConnected();

    if (isConnected) {
        // In a real app, we would save the encrypted credentials to the database here
        // await prisma.integration.create({ ... })
        
        // Trigger an initial sync in the background
        // service.runNightlySync(tenantId, { type, apiKey, url });

        return NextResponse.json({ success: true, status: 'connected' });
    } else {
        return NextResponse.json({ success: false, error: 'Connection failed: Invalid credentials or unreachable host' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Integration connect error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
