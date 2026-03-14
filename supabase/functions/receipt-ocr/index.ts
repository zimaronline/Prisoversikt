type OcrApiReceiptItem = {
  rawText?: string | null;
  normalizedName: string;
  quantity?: number | null;
  unit?: string | null;
  sizeValue?: number | null;
  sizeUnit?: string | null;
  unitPrice?: number | null;
  lineTotal: number;
  discount?: number | null;
  confidence?: number | null;
};

type OcrApiReceiptResponse = {
  merchantName: string;
  merchantAddress?: string | null;
  purchaseDate: string;
  subtotal?: number | null;
  total: number;
  vatTotal?: number | null;
  currency?: string | null;
  parseConfidence?: number | null;
  items: OcrApiReceiptItem[];
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    });
  }

  if (req.method !== 'POST') {
    return jsonResponse(
      { error: 'Method not allowed. Use POST.' },
      405
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get('receiptImage');

    if (!(file instanceof File)) {
      return jsonResponse(
        { error: 'Mangler filfeltet receiptImage.' },
        400
      );
    }

    if (!file.type.startsWith('image/')) {
      return jsonResponse(
        { error: 'receiptImage må være et bilde.' },
        400
      );
    }

    const receipt = buildMockReceiptFromFilename(file.name);

    return jsonResponse(receipt, 200);
  } catch (error) {
    console.error('receipt-ocr failed', error);

    return jsonResponse(
      {
        error: 'Kunne ikke behandle kvitteringsbildet.',
      },
      500
    );
  }
});

function buildMockReceiptFromFilename(filename: string): OcrApiReceiptResponse {
  const lower = filename.toLowerCase();

  if (lower.includes('kiwi')) {
    return {
      merchantName: 'KIWI',
      merchantAddress: 'Storgata 12, 4632 Kristiansand',
      purchaseDate: '2026-03-14',
      subtotal: 116.7,
      total: 145.9,
      vatTotal: 29.2,
      currency: 'NOK',
      parseConfidence: 0.82,
      items: [
        {
          rawText: 'BANAN 1,2 KG 29,90',
          normalizedName: 'Banan',
          quantity: 1.2,
          unit: 'kg',
          unitPrice: 24.92,
          lineTotal: 29.9,
          discount: 0,
          confidence: 0.82,
        },
        {
          rawText: 'LETTMELK 1L 24,90',
          normalizedName: 'Lettmelk',
          quantity: 1,
          unit: 'stk',
          sizeValue: 1,
          sizeUnit: 'L',
          unitPrice: 24.9,
          lineTotal: 24.9,
          discount: 0,
          confidence: 0.84,
        },
        {
          rawText: 'GROVT BRØD 39,90',
          normalizedName: 'Grovt brød',
          quantity: 1,
          unit: 'stk',
          unitPrice: 39.9,
          lineTotal: 39.9,
          discount: 0,
          confidence: 0.79,
        },
        {
          rawText: 'EGG 12 PK 51,20',
          normalizedName: 'Egg 12-pk',
          quantity: 1,
          unit: 'stk',
          sizeValue: 12,
          sizeUnit: 'pk',
          unitPrice: 51.2,
          lineTotal: 51.2,
          discount: 0,
          confidence: 0.77,
        },
      ],
    };
  }

  if (lower.includes('rema')) {
    return {
      merchantName: 'REMA 1000',
      merchantAddress: 'Vestre Strandgate 44, 4612 Kristiansand',
      purchaseDate: '2026-02-07',
      subtotal: 88.5,
      total: 110.6,
      vatTotal: 22.1,
      currency: 'NOK',
      parseConfidence: 0.8,
      items: [
        {
          rawText: 'APPELSINJUICE 1L 26,90',
          normalizedName: 'Appelsinjuice',
          quantity: 1,
          unit: 'stk',
          sizeValue: 1,
          sizeUnit: 'L',
          unitPrice: 26.9,
          lineTotal: 26.9,
          discount: 0,
          confidence: 0.8,
        },
        {
          rawText: 'OST SKIVET 39,90',
          normalizedName: 'Ost skivet',
          quantity: 1,
          unit: 'stk',
          unitPrice: 39.9,
          lineTotal: 39.9,
          discount: 0,
          confidence: 0.79,
        },
        {
          rawText: 'YOGHURT 4PK 43,80',
          normalizedName: 'Yoghurt 4-pk',
          quantity: 1,
          unit: 'stk',
          sizeValue: 4,
          sizeUnit: 'pk',
          unitPrice: 43.8,
          lineTotal: 43.8,
          discount: 0,
          confidence: 0.81,
        },
      ],
    };
  }

  if (lower.includes('meny')) {
    return {
      merchantName: 'MENY',
      merchantAddress: 'Skippergata 10, 4611 Kristiansand',
      purchaseDate: '2026-03-06',
      subtotal: 210.3,
      total: 262.9,
      vatTotal: 52.6,
      currency: 'NOK',
      parseConfidence: 0.78,
      items: [
        {
          rawText: 'LAKS FILET 129,90',
          normalizedName: 'Laksefilet',
          quantity: 1,
          unit: 'stk',
          unitPrice: 129.9,
          lineTotal: 129.9,
          discount: 0,
          confidence: 0.76,
        },
        {
          rawText: 'AVOKADO 2 STK 39,80',
          normalizedName: 'Avokado',
          quantity: 2,
          unit: 'stk',
          unitPrice: 19.9,
          lineTotal: 39.8,
          discount: 0,
          confidence: 0.8,
        },
        {
          rawText: 'SPINAT 49,90',
          normalizedName: 'Spinat',
          quantity: 1,
          unit: 'stk',
          unitPrice: 49.9,
          lineTotal: 49.9,
          discount: 0,
          confidence: 0.77,
        },
        {
          rawText: 'BRØD 43,30',
          normalizedName: 'Brød',
          quantity: 1,
          unit: 'stk',
          unitPrice: 43.3,
          lineTotal: 43.3,
          discount: 0,
          confidence: 0.78,
        },
      ],
    };
  }

  return {
    merchantName: 'Ukjent butikk',
    merchantAddress: null,
    purchaseDate: '2026-03-14',
    subtotal: null,
    total: 0,
    vatTotal: null,
    currency: 'NOK',
    parseConfidence: 0.4,
    items: [],
  };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}