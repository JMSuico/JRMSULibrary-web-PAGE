# AI Frontend Design Patterns — Detection Checklist
### Top 100 Major + Top 50 Minor Patterns (UI, Color, Typography, Layout, Motion, Copy)

This is a "tells" list — the visual habits that make a site/app instantly readable as "made by an AI tool" (v0, Lovable, Bolt, Cursor, Framer AI, generic ChatGPT/Claude output) rather than designed with intent. Use it the same way you use the writing-patterns list: scan a build, flag anything you matched, and replace it with a choice that's actually derived from the subject matter, not the default.

---

## SECTION A — COLOR (Major #1–20)

1. Indigo/violet-to-blue gradient as the primary brand color (#6366F1 → #3B82F6 family) used with zero justification from the subject
2. Purple-to-pink gradient text on headlines ("AI startup gradient")
3. Default Tailwind palette used unmodified (`blue-500`, `indigo-600`, `gray-50/900`) instead of a custom token system
4. Warm cream background (~#F4F1EA) + high-contrast serif + terracotta accent ("editorial AI" look)
5. Near-black background (#0A0A0A) with a single bright acid-green or vermilion accent
6. Glassmorphism: translucent white/10% panels with backdrop-blur, used decoratively rather than functionally
7. Neon/glow accent colors on a dark background with no narrative reason
8. Gradient buttons (blue→purple) as the default CTA treatment
9. Soft pastel "SaaS landing page" palette: lavender, mint, baby blue, all at low saturation
10. Pure black (#000000) or pure white (#FFFFFF) text/background instead of off-black/off-white
11. Same accent color used for links, buttons, icons, and highlights — no hierarchy of emphasis
12. Random rainbow gradients on icon backgrounds (each feature card a different gradient)
13. Color used to decorate rather than encode meaning (no semantic mapping to status/category/data)
14. Dark mode that's just light mode with colors inverted, no separate contrast tuning
15. Overuse of `gray-400`/`gray-500` for "secondary text" everywhere, flattening hierarchy
16. Accent gradient applied to borders ("gradient border" cards) as a default flourish
17. Drop shadows tinted the same hue as the brand color on every card (the generic "colored shadow")
18. Success/error colors that are pure CSS-named green/red (`#00FF00`, `#FF0000`) instead of a tuned semantic palette
19. Hero section background: full-bleed gradient mesh/blob in brand colors, used on every page regardless of content
20. No real dark/light brand identity — palette could be swapped onto any other product unchanged

## SECTION B — TYPOGRAPHY (Major #21–40)

21. Inter as the only typeface, used for both display and body with no pairing
22. Poppins or Montserrat for headlines — the default "modern SaaS" display face
23. System font stack used as a lazy fallback ("looks fine, didn't choose it")
24. Identical font weight (400/600) used everywhere; no real type scale
25. Oversized hero headline (72px+) with a generic subheadline directly beneath it, both centered
26. Title Case Used For Every Heading Regardless Of Voice
27. No optical sizing — same letterspacing/line-height applied at every scale
28. Gradient text fill on headlines as a default emphasis device
29. Emoji used inside headings as a substitute for an icon or for tone (🚀 ✨ 🎯)
30. Monospace font slapped onto anything "technical-sounding" with no real connection to code
31. Centered text blocks used as the default for everything, including long paragraphs
32. Font sizes following exact Tailwind defaults (text-sm/base/lg/xl/2xl) with no custom scale
33. All-caps "eyebrow" label above every heading regardless of whether it adds information
34. Identical body line-height (1.5) never tuned to the face or measure
35. No distinct "voice" typeface for quotes/testimonials — same body face reused
36. Bold used as the only tool for emphasis (no italics, no color, no size shift)
37. Justified or perfectly centered long-form text blocks, hurting readability
38. Heading font sizes that don't follow a coherent ratio/scale, just "looks about right"
39. Letter-spacing tightened on headlines uniformly without regard to the face's natural metrics
40. Default placeholder/system fallback used for non-Latin or code text instead of a deliberate utility face

## SECTION C — LAYOUT & COMPOSITION (Major #41–65)

41. Hero: centered headline + subheadline + two pill buttons ("Get Started" / "Learn More") — the single most common AI hero template
42. Three-column feature grid: icon in colored rounded square, bold mini-heading, one-sentence description, repeated 3–6 times
43. Numbered steps (01 / 02 / 03) used decoratively when the content isn't actually sequential
44. Bento-grid layout applied to content that has no real size/priority hierarchy to justify it
45. "Trusted by" logo strip directly under the hero, often with placeholder/fake logos
46. Testimonial carousel with circular avatar, name, title, 2-line quote, repeated in identical cards
47. Pricing table: 3 tiers, middle one highlighted/scaled up with a "Most Popular" badge
48. Stats row: 3–4 big numbers with small labels underneath, used as a generic credibility device
49. Footer with 4–5 evenly spaced columns of links regardless of how much content actually exists
50. Sticky nav bar with logo left, links center, CTA button right — zero variation from the universal template
51. Symmetric, perfectly balanced whitespace on every section with no rhythm or surprise
52. Section order: Hero → Logos → Features → Stats → Testimonials → Pricing → FAQ → CTA → Footer, applied regardless of product
53. Every section the same height/padding rhythm, no visual pacing
54. FAQ accordion as a default closing section even when there are no actual frequent questions
55. Split-screen hero: copy on left, generic illustration/mockup on right, every single time
56. Cards arranged in a uniform grid with identical dimensions even when content varies wildly in length
57. No content-driven asymmetry — every layout could be reflowed for any other brief unchanged
58. Dashboard mockups inside hero sections that show fake, generic data (no relation to the real product)
59. Single full-width CTA banner with gradient background right before the footer, every time
60. Mobile nav defaults to hamburger + slide-out drawer with no consideration of whether it fits the content
61. "Above the fold" crammed with headline + subhead + CTA + hero image, leaving nothing distinctive for scroll
62. Sidebar layout with icon + label nav items, default spacing, no information architecture specific to the app
63. Empty/loading states using a generic illustration + "Nothing here yet" with no voice
64. Modal dialogs centered with identical rounded-corner card styling regardless of urgency/content
65. Breadcrumbs, tabs, and table styling all using the same out-of-the-box component look with no adaptation

## SECTION D — UI COMPONENTS (Major #66–85)

66. Rounded-2xl (16px+) applied to literally every element — cards, buttons, inputs, images, modals
67. Soft, low-opacity drop shadow on every card as the default depth cue (`shadow-md`/`shadow-lg` untouched)
68. Icon-in-colored-rounded-square as the default feature marker (Lucide/Heroicons, unstyled)
69. Pill-shaped badges used everywhere for tags, statuses, and labels with no differentiation
70. Buttons all the same shape/radius/weight — primary and secondary distinguished only by color fill
71. Default shadcn/ui component styling left completely unthemed
72. Icon-only buttons with a generic icon library (Lucide/Feather) and no custom iconography
73. Avatar stack (overlapping circles) used as a generic "social proof" device
74. Skeleton loaders that are just gray rounded rectangles, untailored to actual content shape
75. Toggle/switch components using the exact default browser-framework styling
76. Form inputs with identical rounded border + focus ring in the brand accent color, no distinct states
77. Tooltips that are plain dark rectangles with white text, default positioning
78. Progress bars/steppers using default fill animation with no relationship to the actual process
79. Cards with a thin 1px border + shadow + rounded corner "just because," not because the content needs containment
80. Notification/toast components in the exact default position (top-right) and style every time
81. Dropdown menus styled with no distinction from the framework's out-of-the-box look
82. Search bar with a generic magnifying-glass icon and placeholder "Search..." with no product voice
83. Generic "upgrade" or "pro" badges using a gold/yellow gradient by default
84. Chips/tags using identical pill shape and a single accent color regardless of category
85. Default table styling: alternating row stripes, header in gray-100, no adaptation to data type

## SECTION E — MOTION & INTERACTION (Major #86–93)

86. Fade-in-on-scroll applied uniformly to every section, regardless of whether it serves the content
87. Floating/bobbing decorative shapes in the background with no connection to the subject
88. Hover scale (1.05) applied identically to every card/button as the only micro-interaction
89. Animated gradient backgrounds that shift slowly and continuously for no functional reason
90. Parallax scrolling applied to hero imagery by default, regardless of whether depth adds meaning
91. Confetti/particle burst on success states as a generic "delight" cliché
92. Page-load stagger animation (elements fading up in sequence) used as a default opener every time
93. Excess motion overall — more animation present than the interface actually needs, signaling "look what I can do" rather than serving usability

## SECTION F — IMAGERY & ICONOGRAPHY (Major #94–100)

94. Generic 3D blob/gradient-mesh illustrations used as filler hero art
95. Abstract isometric illustrations of "people working at laptops" with no connection to the actual product
96. Stock photography of diverse smiling professionals in a generic open office
97. AI-generated hero images with the telltale soft-focus, overly symmetric, slightly uncanny quality
98. Icon set mixed from multiple libraries with inconsistent stroke widths and corner styles
99. Decorative grid/dot/noise texture overlays added "for texture" with no relation to the brand
100. Mockup devices (laptop/phone frames) used to display screenshots by default instead of a more native presentation

---

## SECTION G — MINOR PATTERNS (Top 50)

### Color & Surface (101–112)
101. Gradient used on a single button as the only colorful thing on an otherwise monochrome page
102. Tinted neutral grays that lean slightly blue/purple instead of true neutral
103. Identical opacity values (50%, 70%, 90%) reused everywhere for "secondary" states
104. Brand color reused at 10% opacity as a section background tint, applied reflexively
105. Border colors that are just a lighter shade of the text color, never custom-tuned
106. Focus rings always the exact brand accent at full saturation, never adapted to context
107. Hover states implemented only as a slight darken/lighten, never a structural change
108. Disabled states rendered only as 40% opacity gray, with no other visual treatment
109. Link color defaulting to framework blue even inside a custom brand palette
110. Section backgrounds alternating white/gray-50 with no other variation down the page
111. Overlay scrims on images always pure black at a fixed opacity, never color-matched
112. Chart colors taken straight from a default categorical palette (Tailwind/Recharts defaults) with no brand tie-in

### Typography Detail (113–122)
113. Identical paragraph width (max-w-2xl) used everywhere regardless of content type
114. Quotation marks rendered as straight quotes instead of typographic ones
115. No small-caps, oldstyle figures, or other typographic refinement anywhere
116. Numerals in headings always default tabular figures, never styled distinctly
117. Italic used only for the word "the" in marketing copy ("the smarter way to...")
118. Identical heading-to-body spacing ratio reused on every section
119. No custom favicon/wordmark treatment — default framework or generic logotype
120. Subheadlines always exactly one sentence, same length, same tone, every section
121. CTA button text limited to 2 words max, almost always a verb + noun ("Get Started," "Try Free")
122. Microcopy under inputs always gray, always italic, never adapted to context

### Layout Detail (123–134)
123. Section padding locked to the same vertical rhythm (py-20/py-24) without variation
124. Container max-width identical across every page (max-w-7xl) regardless of content density
125. Logo always top-left, never integrated into the layout in a more bespoke way
126. Footer "Company / Product / Resources / Legal" column labels used verbatim
127. Newsletter signup bar bolted onto the footer by default, unrelated to actual product need
128. Social icons row at the exact same size/spacing in literally every footer
129. "Back to top" arrow button in the bottom-right corner as an unexamined default
130. Cookie banner styled with zero brand consideration, full default framework look
131. 404 page using a generic illustration + "Page not found" with no product voice
132. Onboarding flow always exactly 3–4 steps with a progress dots indicator, regardless of actual complexity

### Motion/Interaction Detail (133–140)
133. Button press feedback limited to a slight opacity dip, nothing tactile or distinctive
134. Page transitions always a generic crossfade, never considered against the content
135. Loading spinners using the default circular spinner with no brand shape
136. Cursor remains the default system arrow/pointer everywhere, no custom cursor consideration even where it would help
137. Scroll-snap applied reflexively to carousels without checking if it actually improves the interaction
138. Image hover always a generic zoom-in, regardless of whether zoom reveals anything useful
139. Accordion expand/collapse using the default browser easing curve, untouched
140. Notification badges always a red dot/number in the same corner, no exceptions

### Copy & Microcopy tells (141–150)
141. "Unlock the power of..." or "Supercharge your..." as an opening headline pattern
142. "Whether you're a [persona A] or a [persona B]..." sentence structure used to manufacture breadth
143. "Seamlessly integrate" / "effortlessly" used as filler intensifiers with no specific claim behind them
144. Em-dash-heavy marketing copy mimicking a punchy, AI-default rhythm
145. Listicle-style feature headers ("Fast. Simple. Powerful.") with no connection to actual differentiators
146. Generic FAQ questions ("How does it work?" "Is it secure?") with boilerplate, non-specific answers
147. CTA copy always paired with a vague reassurance line ("No credit card required") regardless of relevance
148. Feature descriptions always exactly one sentence, same syntactic shape, repeated across every card
149. Testimonial quotes that are generically positive with no specific, checkable detail
150. Closing CTA section headline restates the hero headline almost verbatim, with no new information

---

## How to use this against your own work

For your research system frontend (Django + React) or any UI you ship:

1. **Screenshot the page, scan top to bottom against Sections A–F.** Flag anything that's a direct match.
2. **For every flagged item, ask: "is this here because of a real decision about this product, or because it's the default?"** If you can't answer in one sentence, it's a default — change it.
3. **Spend your "boldness" in one place** (per the design-lead approach): pick one signature element tied to your actual subject (the library system, the QR/reservation flow, the coin's own geometry/material language if you ever bring 3D into a web context) and keep everything else disciplined around it, rather than scattering gradients/glows/animations everywhere.
4. **Re-check after building**, not just during planning — AI patterns creep back in during implementation even when the plan avoided them.

Want me to run this checklist against an actual screenshot or codebase of your library system's UI?
