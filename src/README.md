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

## Visual system

- `styles/design-system.css` defines shared `--ui-*` color, surface, radius, and shadow tokens, plus form and dashboard treatments. Tailwind travel/teal tokens in `index.css` use the same green palette.
- Use `components/common/PageHeading` for page titles, supporting text, and optional actions. Use `ui-button ui-button-secondary` for secondary page actions.
- Home and Discover own their layouts in `styles/home.css` and `styles/discover.css`. The former home-reference override layer has been consolidated into home.css.
- Keep one clear primary action per section, align card actions in a footer, use readable supporting text, and retain visible keyboard focus. Controls should have at least 44px of touch space where practical.
- Keep responsive layouts usable at 320px, with form text at 16px on mobile. Tourist navigation remains a desktop sidebar and an accessible mobile drawer. Preserve print and reduced-motion behavior when changing styles.
