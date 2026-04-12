// src/app/api/delete-stuck-index/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
    const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_APPOINTMENTS_COLLECTION_ID!;
    const INDEX_ID = 'index_2doctor_date_time_unique';
    const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!; // already contains /v1
    const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY!;

    const res = await fetch(
      `${APPWRITE_ENDPOINT}/databases/${DATABASE_ID}/collections/${COLLECTION_ID}/indexes/${INDEX_ID}`,
      {
        method: 'DELETE',
        headers: {
          'X-Appwrite-Project': process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!,
          'X-Appwrite-Key': APPWRITE_API_KEY,
        },
      }
    );

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || 'Failed to delete index');
    }

    return NextResponse.json({ message: 'Index deleted successfully!' });
  } catch (err: any) {
    console.error('Failed to delete index:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to delete index' },
      { status: 500 }
    );
  }
}