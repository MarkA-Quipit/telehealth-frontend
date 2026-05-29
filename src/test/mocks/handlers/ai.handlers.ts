import { http, HttpResponse } from 'msw';

const BASE = 'http://localhost:3000';

export const aiHandlers = [
  http.get(`${BASE}/api/ai/history`, () =>
    HttpResponse.json({
      success: true,
      data: [],
    }),
  ),

  http.post(`${BASE}/api/ai/recommendations`, () =>
    HttpResponse.json({
      success: true,
      data: {
        recommendations: [
          { specialization: 'Cardiology', reason: 'Based on your symptoms', doctors: [] },
        ],
      },
    }),
  ),
];
