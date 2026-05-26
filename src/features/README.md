# Features Directory

Domain-driven feature modules. Each feature is self-contained with its own API, components, hooks, and types.

## Features

### auth/
Authentication and authorization
- api/ - Auth API calls
- components/ - Login, Register forms
- hooks/ - useAuth, useLogin
- pages/ - LoginPage, RegisterPage
- store/ - Auth state management
- types/ - Auth types

### appointments/
Appointment booking and management
- api/ - Appointment API calls
- components/ - Shared appointment components
- hooks/ - useAppointments
- admin/ - Admin-specific appointment views
- doctor/ - Doctor-specific appointment views
- patient/ - Patient-specific appointment views
- types/ - Appointment types

### consultations/
Video consultation features
- api/ - Consultation API calls
- components/ - Video room, controls
- hooks/ - useVideoCall
- doctor/ - Doctor consultation views
- patient/ - Patient consultation views
- types/ - Consultation types

### users/
User profile management
- api/ - User API calls
- components/ - Profile components
- admin/ - Admin user management
- doctor/ - Doctor profile views
- patient/ - Patient profile views
- types/ - User types

### notifications/
Notification system
- api/ - Notification API calls
- components/ - Notification bell, list
- hooks/ - useNotifications
- types/ - Notification types

### ai/
AI-powered features (diagnosis assistance, chatbot, etc.)
- api/ - AI API calls
- services/ - AI service integrations
- components/ - AI chat, suggestions
- hooks/ - useAI
- types/ - AI types

## Feature Structure Pattern

Each feature follows this structure:
```
feature-name/
├── api/           # API calls for this feature
├── components/    # Feature-specific components
├── hooks/         # Feature-specific hooks
├── types/         # TypeScript types
└── [role]/        # Role-specific views (admin/doctor/patient)
```
