# Frontend structure

- `components/admin` contains the protected administration workspace, dashboard, destination editor, and data tables.
- `components/client` contains the public home, tourist profile, and destination feedback experience.
- `components/planner` contains the itinerary planner presentation.
- `components/auth` and `components/common` contain reusable dialogs and shared UI.
- `hooks` owns application behavior such as authentication, navigation, CSRF-aware requests, and planner state.
- `config` contains reusable travel options and initial state.
- `lib` contains formatting and response helpers without React state.
- `styles` mirrors the feature boundaries and is loaded in cascade order from `styles/index.css`.
- Tailwind CSS provides the design tokens, reset, utilities, and shared shell styles through the Vite plugin.

Keep API and state behavior in hooks or service modules. Keep page components focused on rendering and user interaction, place reusable domain values in `config`, and prefer Tailwind utilities or `@apply` with the shared theme tokens for new styling.
