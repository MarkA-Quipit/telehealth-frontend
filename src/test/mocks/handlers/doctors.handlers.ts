import { http, HttpResponse } from 'msw';

const BASE = 'http://localhost:3000';

const mockDoctor = {
  id: 'doctor-1',
  userId: 'user-doctor-1',
  firstName: 'Jane',
  lastName: 'Smith',
  specialization: 'Cardiology',
  consultationFee: 50000,
  isAcceptingPatients: true,
  averageRating: 4.5,
  reviewCount: 10,
  completedConsultationsCount: 20,
  yearsOfExperience: 8,
  profilePictureUrl: null,
};

export const doctorsHandlers = [
  http.get(`http://localhost:3000/api/doctors`, () =>
    HttpResponse.json({
      success: true,
      data: { items: [mockDoctor], total: 1, page: 1, limit: 10 },
    }),
  ),

  http.get(`${BASE}/api/doctors/:id`, ({ params }) =>
    HttpResponse.json({
      success: true,
      data: { ...mockDoctor, id: params.id },
    }),
  ),

  http.get(`${BASE}/api/doctors/:id/slots`, () =>
    HttpResponse.json({
      success: true,
      data: [
        { startTime: '09:00', endTime: '09:30' },
        { startTime: '10:00', endTime: '10:30' },
      ],
    }),
  ),
];
