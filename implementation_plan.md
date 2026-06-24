# Feature Expansion & Frontend Restoration Plan

This plan outlines the steps to restore the missing sections that were inadvertently stubbed out during the previous session, alongside implementing the 5 new features you requested.

## User Review Required

> [!IMPORTANT]
> A previous automation process overwrote the component files for `HeroSection`, `GatewaySection`, `PersonnelSection`, `AboutSection`, `ServicesSection`, `FileServicesSection`, and `ContactSection` with "Missing: [Name]" placeholder stubs.
> 
> Because I have the `PROJECT_SKILL.md` master reference document containing the exact text, structure, and styling rules, **I can perfectly recreate all of them**. Please review the plan below and approve so I can begin execution.

## Open Questions

> [!NOTE]
> 1. **AI Assistant Bubble:** Are we integrating an actual backend endpoint for the chatbot right now, or should I build the frontend UI (the floating bubble + chat window) with static/mock responses for now?
> 2. **Admin/Librarian Dashboard:** We also have "Admin login form and dashboard" in our backlog from your previous messages. Should I tackle that *after* finishing this UI batch?

## Proposed Changes

### Component Restoration

#### [MODIFY] `src/Features/Hero/components/HeroSection.tsx`
- Rebuild the Hero layout using `linear-gradient` and full-viewport styling.
- Integrate the **Time-based Open/Closed Status indicator**.
  - Logic: Get current time in `Asia/Manila` timezone.
  - If Day is Mon-Fri and Time is 07:00 to 19:00 -> "LIBRARY IS NOW OPEN" with a pulsing green dot.
  - Else -> "LIBRARY IS CLOSED" with a red dot.

#### [MODIFY] `src/Features/Gateway/components/GatewaySection.tsx`
- Rebuild the intro/welcome panel using `PROJECT_SKILL.md` rules.

#### [MODIFY] `src/Features/Personnel/components/PersonnelSection.tsx`
- Rebuild the Librarian's corner / Staff section.

#### [MODIFY] `src/Features/About/components/AboutSection.tsx`
- Rebuild the 2-column layout with the Google Maps iframe embed and "Padayon" text.

#### [MODIFY] `src/Features/Services/components/ServicesSection.tsx`
- Rebuild the accordion service cards with the required color-coded tabs and tables.

#### [MODIFY] `src/Features/FileServices/components/FileServicesSection.tsx`
- Rebuild the 3-column card grid for forms, clearance, etc.

#### [MODIFY] `src/Features/Contact/components/ContactSection.tsx`
- Rebuild the two-column contact section.

### New Features

#### [MODIFY] `src/Components/LayoutBars/TopNavBar.tsx`
- **Sidebar UI Fix:** Adjust the mobile sidebar container. Ensure it uses `overflow-y-auto`, correct `h-[100dvh]` with safe-area paddings, and adjust z-indexing so it doesn't clip behind browser elements.

#### [NEW] `src/Features/Modals/components/BrowserCardModal.tsx`
- Build a reusable full-screen modal component.
- Implement the **Interactive Browser Cards** (Feedback and External Services). When clicked, these will open the modal to display their respective content.

#### [NEW] `src/Features/Modals/components/FacebookIframeModal.tsx`
- Implement a modal specifically for the **Facebook iframe**.
- Ensure the iframe is responsive and securely embeds the JRMSU Katipunan Library Facebook page.

#### [NEW] `src/Features/AI/components/AIAssistantBubble.tsx`
- Create a floating action button (FAB) in the bottom right corner (above the footer).
- Clicking the bubble will open a modern chat window UI interface.
- Add into `App.tsx` layout so it persists across routes.

#### [MODIFY] `src/Pages/EResourcesPage/EResourcesPage.tsx`
- Remove the stub and populate with the E-Resources layout.

## Verification Plan

### Manual Verification
1. I will start the Vite development server.
2. I will verify that the landing page fully renders without any red "Missing" stubs.
3. I will test the Open/Closed indicator logic against the `Asia/Manila` timezone boundary conditions.
4. I will verify that the mobile sidebar expands and scrolls smoothly without clipping.
5. I will verify the Browser Cards, Facebook Modal, and AI Bubble all open, overlay properly, and close upon user interaction.
