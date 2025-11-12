import { setFacture, getSession } from '@/app/lib/session/session-node';
import { getFactureData } from '@/app/lib/data';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {

  // Get the current user session
  const session = await getSession();
  const userId = session?.idUser; // Use idUser, not userId

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized - No session' }, { status: 401 });
  }

  // Get the factureId from request
  const body = await req.json();
  const factureId = body.factureId;
  console.log("factureId in set-facture: ", factureId)

  // Validate factureId
  if (factureId == null || isNaN(factureId)) {
    return NextResponse.json({ error: 'factureId is required' }, { status: 400 });
  }

  // SECURITY: Verify that the user owns this invoice
  try {
    const factureDataResponse = await getFactureData(factureId);
    
    if (!factureDataResponse.success || !factureDataResponse.facture) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Check if the invoice belongs to the current user
    if (factureDataResponse.facture.idUser !== userId) {
      console.warn(`Authorization failed: User ${userId} tried to access invoice ${factureId} owned by ${factureDataResponse.facture.idUser}`);
      return NextResponse.json({ error: 'Unauthorized - You do not own this invoice' }, { status: 403 });
    }

    // User owns the invoice, set it in session
    const response = await setFacture(factureId);
    if (!response) {
      return NextResponse.json({ error: 'Failed to set session' }, { status: 500 });
    }

    return response;
  } catch (error) {
    console.error('Error verifying invoice ownership:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}