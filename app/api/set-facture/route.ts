import { setFacture } from '@/app/lib/session/session-node';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {

  // aller chercher le factureId
  const body = await req.json();
  const factureId = body.factureId;
  console.log("factureId in set-facture: ", factureId)

  // si null
  if (factureId == null || isNaN(factureId)) {
    return NextResponse.json({ error: 'factureId is required' }, { status: 400 });
  }

  //set facture id
  const response = await setFacture(factureId);
  if (!response) {
    return NextResponse.json({ error: 'Failed to set session' }, { status: 400 });
  }

  return response;
}