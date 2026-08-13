# DESIGN_SYSTEM.md: EcoFlow AI

## 1. Introduction

The EcoFlow AI Design System serves as the single source of truth for all visual and interactive elements of the EcoFlow AI platform. Its purpose is to ensure consistency, efficiency, and a high-quality user experience across all touchpoints. By providing a standardized set of guidelines, components, and principles, this system empowers designers and developers to build a cohesive, intuitive, and impactful product that aligns with EcoFlow AI's mission of sustainability and innovation.

This document outlines the foundational elements of the EcoFlow AI brand and user interface, fostering a unified aesthetic and functional approach that reflects our commitment to environmental stewardship and intelligent decision support.

## 2. Design Principles

Our design principles are the guiding philosophy behind every decision made within the EcoFlow AI platform. They are rooted in our core mission and target user needs.

### 2.1. Eco-Friendly & Sustainable
The visual language and interactions should evoke a sense of nature, growth, and responsibility. We aim for designs that are clean, uncluttered, and reflect the sustainable practices EcoFlow AI promotes.

### 2.2. Educational & Empowering
The platform is designed to guide and educate users. Interfaces should be clear, provide helpful context, and empower users to make informed decisions about their eco-enzyme journey and product optimization.

### 2.3. Intuitive & Accessible
Simplicity and ease of use are paramount. The design must be intuitive for users of all technical proficiencies, from household practitioners to UMKM operators. Adherence to WCAG 2.1 AA standards ensures inclusivity for diverse user needs.

### 2.4. Trustworthy & Data-Driven
As an AI-powered platform, trust is critical. The design should convey reliability and accuracy, especially in presenting AI recommendations and business analyses. Data visualizations should be clear, concise, and actionable.

### 2.5. Adaptive & Responsive
The platform must seamlessly adapt to various devices and screen sizes, providing a consistent and optimal experience whether on a mobile phone or a desktop browser.

## 3. Brand Identity

### 3.1. Logo
The EcoFlow AI logo combines elements of nature and technology. It features a stylized leaf icon subtly integrated with a circuit board or data flow pattern, symbolizing the fusion of ecological processes with artificial intelligence. The primary color of the logo is a vibrant green, representing growth and sustainability.

### 3.2. Typography

EcoFlow AI utilizes a clean, modern, and highly readable typeface family to ensure clarity and accessibility across all content.

#### 3.2.1. Primary Typeface: Inter
Inter is chosen for its excellent legibility, wide range of weights, and optimized design for digital screens. It will be used for all body text, labels, and most UI elements.

| Usage | Font Weight | Size (Desktop) | Size (Mobile) | Line Height |
|:---|:---|:---|:---|:---|
| **Display H1** | Bold (700) | 48px | 36px | 1.2 |
| **Display H2** | Bold (700) | 36px | 28px | 1.25 |
| **Heading H3** | Semibold (600) | 24px | 20px | 1.3 |
| **Heading H4** | Semibold (600) | 20px | 18px | 1.4 |
| **Body Large** | Regular (400) | 18px | 16px | 1.5 |
| **Body Regular** | Regular (400) | 16px | 14px | 1.5 |
| **Body Small** | Regular (400) | 14px | 12px | 1.6 |
| **Caption** | Medium (500) | 12px | 10px | 1.6 |

### 3.3. Color Palette

The EcoFlow AI color palette is inspired by nature, emphasizing greens, blues, and earthy tones, complemented by functional and semantic colors for feedback and actions.

#### 3.3.1. Primary Colors

| Name | Hex Code | Usage |
|:---|:---|:---|
| **Eco Green** | `#34A853` | Primary brand color, calls to action, success states |
| **Deep Ocean** | `#1A434E` | Primary text, backgrounds, navigation elements |
| **Sky Blue** | `#4285F4` | Secondary brand color, interactive elements, links |

#### 3.3.2. Neutral Colors

| Name | Hex Code | Usage |
|:---|:---|:---|
| **Charcoal Grey** | `#2C3E50` | Headings, strong text |
| **Medium Grey** | `#7F8C8D` | Secondary text, borders, icons |
| **Light Grey** | `#ECF0F1` | Backgrounds, disabled states, dividers |
| **White** | `#FFFFFF` | Backgrounds, text on dark elements |

#### 3.3.3. Semantic Colors

| Name | Hex Code | Usage |
|:---|:---|:---|
| **Success Green** | `#2ECC71` | Positive feedback, successful actions |
| **Warning Yellow** | `#F39C12` | Cautionary messages, pending states |
| **Error Red** | `#E74C3C` | Error messages, destructive actions |
| **Info Blue** | `#3498DB` | Informational messages, tips |

## 4. UI Components

EcoFlow AI leverages Chakra UI as its foundational component library, ensuring a robust, accessible, and customizable set of UI elements. All components will adhere to the defined brand identity and design principles.

### 4.1. Buttons
Buttons are critical for user interaction. They should be clearly distinguishable and indicate their primary action.

| Type | State | Description |
|:---|:---|:---|
| **Primary** | Default, Hover, Active, Disabled | Main calls to action (e.g., "Start Fermentation", "Save Changes") |
| **Secondary** | Default, Hover, Active, Disabled | Less prominent actions, often complementary to primary |
| **Outline** | Default, Hover, Active, Disabled | Alternative actions, often used for navigation or filters |
| **Ghost** | Default, Hover, Active, Disabled | Minimal styling, used for subtle actions or within tables |
| **Icon Button** | Default, Hover, Active, Disabled | Actions represented solely by an icon (e.g., "Edit", "Delete") |

### 4.2. Forms & Inputs
Forms are essential for data entry. Inputs should be clear, provide immediate feedback, and be easy to use.

| Element | Description |
|:---|:---|
| **Text Input** | Standard text fields for short-form data. Clear labels, placeholder text, and validation states. |
| **Textarea** | Multi-line text input for longer descriptions (e.g., fermentation log notes). |
| **Select Dropdown** | For predefined options. Should be accessible and clearly indicate selected value. |
| **Radio Buttons** | For mutually exclusive choices. Grouped with clear labels. |
| **Checkboxes** | For multiple selections or binary options. |
| **Sliders** | For selecting a value within a range (e.g., aroma intensity). |
| **File Upload** | For image uploads (e.g., fermentation log photos). Clear drag-and-drop areas or button. |
| **Date Picker** | For selecting dates (e.g., fermentation start date). |
| **Form Validation** | Real-time feedback for errors (e.g., required fields, invalid formats). |

### 4.3. Navigation
Navigation elements guide users through the platform. They should be consistent and predictable.

| Element | Description |
|:---|:---|
| **Top Navigation Bar** | Global navigation, logo, user profile, notifications. |
| **Side Navigation (Drawer)** | Primary feature navigation, accessible on mobile via hamburger menu. |
| **Breadcrumbs** | Indicate current location within the hierarchy. |
| **Tabs** | For switching between different views within a section. |
| **Pagination** | For navigating through lists of items. |

### 4.4. Data Display
Presenting information clearly is crucial for educational and analytical purposes.

| Element | Description |
|:---|:---|
| **Cards** | Group related information visually. Used for fermentation batches, product recommendations. |
| **Tables** | For structured data display (e.g., business analysis reports, historical logs). Responsive design is critical. |
| **Badges/Tags** | Small labels for status, categories (e.g., "Normal", "Caution", "UMKM"). |
| **Progress Indicators** | Visual feedback for ongoing processes (e.g., fermentation progress bar, loading spinners). |
| **Charts & Graphs** | For visualizing data (e.g., waste diverted, profit projections). Simple, clear, and interactive. |

### 4.5. Feedback & Communication
Providing clear feedback to users is essential for a good experience.

| Element | Description |
|:---|:---|:---|
| **Alerts/Toasts** | Non-intrusive messages for success, error, warning, or info. |
| **Modals/Dialogs** | For critical actions, confirmations, or detailed information that requires user attention. |
| **Tooltips** | Small, contextual hints on hover for UI elements. |
| **Empty States** | Thoughtful designs for when there is no data to display, guiding users on next steps. |

## 5. Iconography

Icons are used to visually represent actions, features, or concepts, enhancing usability and reducing cognitive load.

### 5.1. Style
Icons should be simple, line-based, and consistent in weight and style. They should be easily recognizable and scalable without loss of clarity. We will primarily use a curated set from a reputable icon library (e.g., Feather Icons, Material Icons) to maintain consistency.

### 5.2. Usage
- **Clarity:** Icons must be accompanied by text labels where their meaning is not universally clear.
- **Size:** Standard sizes for icons are 16px, 20px, and 24px, with larger sizes for specific display purposes.
- **Color:** Icons typically use `Medium Grey` (`#7F8C8D`) for neutral states and `Eco Green` (`#34A853`) or `Sky Blue` (`#4285F4`) for interactive or active states. Semantic colors are used for status icons.

## 6. Imagery & Illustrations

Imagery and illustrations play a vital role in conveying the EcoFlow AI brand and enhancing the user experience.

### 6.1. Style & Tone
- **Photography:** High-quality, authentic images of eco-enzyme production, sustainable practices, and natural elements. Avoid stock photos that feel generic or inauthentic.
- **Illustrations:** Custom illustrations should be friendly, approachable, and align with the eco-friendly aesthetic. They can be used to simplify complex concepts or add personality to empty states and onboarding flows.
- **Color Palette:** Imagery should complement the primary color palette, featuring natural greens, blues, and warm earthy tones.

### 6.2. Usage
- **Contextual:** Images should always be relevant to the content and provide value to the user.
- **Educational:** Visuals can be used to explain steps in the Adaptive Roadmap or highlight key benefits.
- **Inspirational:** Images can inspire users by showcasing the positive impact of eco-enzyme production.
- **Accessibility:** All images must have appropriate alt text for screen readers.

## 7. Accessibility

EcoFlow AI is committed to providing an inclusive experience for all users, adhering to WCAG 2.1 AA standards.

### 7.1. Key Considerations
- **Color Contrast:** Ensure sufficient contrast ratios for text and interactive elements against their backgrounds.
- **Keyboard Navigation:** All interactive elements must be navigable and operable via keyboard.
- **Screen Reader Support:** Implement proper ARIA attributes and semantic HTML to ensure screen readers can interpret content correctly.
- **Focus Management:** Clear visual focus indicators for interactive elements.
- **Text Alternatives:** Provide alt text for images and transcripts/captions for multimedia.
- **Scalable Text:** Users should be able to resize text without loss of functionality or content.
- **Form Labels:** All form inputs must have associated, visible labels.
- **Error Identification:** Clear and descriptive error messages that are programmatically associated with their respective fields.

## 8. Content & Tone of Voice

The language used within EcoFlow AI is as important as its visual design in building trust and guiding users.

### 8.1. Tone
- **Supportive & Encouraging:** Guide users through processes with a positive and helpful tone.
- **Clear & Concise:** Avoid jargon. Use simple, direct language that is easy to understand for a broad audience.
- **Educational:** Explain concepts and provide context where necessary, especially for AI recommendations and technical terms.
- **Empathetic:** Acknowledge potential challenges (e.g., fermentation failures) and offer constructive solutions.
- **Action-Oriented:** Use active voice and clear calls to action.

### 8.2. Language
- **Primary Language:** Bahasa Indonesia for initial launch, with clear plans for English in v1.1.
- **Consistency:** Maintain consistent terminology across the platform (e.g., "Fermentation Batch," "Eco-Enzyme," "Product Derivative").
- **Microcopy:** Pay attention to small pieces of text (button labels, error messages, tooltips) to ensure they are helpful and on-brand.

## 9. Responsive Design

EcoFlow AI is designed to be fully responsive, providing an optimal viewing and interaction experience across a wide range of devices.

### 9.1. Breakpoints
We follow standard responsive breakpoints, primarily focusing on mobile-first design principles.

| Device Type | Min Width | Max Width |
|:---|:---|:---|
| **Mobile** | 0px | 576px |
| **Tablet** | 577px | 992px |
| **Desktop** | 993px | 1440px |
| **Large Desktop** | 1441px | Up |

### 9.2. Layouts
- **Fluid Grids:** Content adjusts to fill available space.
- **Flexible Images:** Images scale proportionally.
- **Adaptive Components:** UI components (e.g., navigation, tables) transform or reflow to fit smaller screens.
- **Touch-Friendly:** Ensure sufficient tap targets and spacing for touch interactions on mobile devices.

## 10. Motion & Animation

Motion and animation are used purposefully to enhance the user experience, provide feedback, and guide attention, rather than for purely decorative purposes.

### 10.1. Principles
- **Subtle:** Animations should be smooth and subtle, avoiding distractions.
- **Functional:** Used to indicate state changes, provide feedback on interactions, or transition between views.
- **Performance:** Animations must be performant and not hinder the overall responsiveness of the application.

### 10.2. Examples
- **Loading States:** Spinners or skeleton screens to indicate data fetching.
- **Transitions:** Smooth transitions between pages or modal openings/closings.
- **Feedback:** Subtle bounces or color changes on button clicks.
- **Progress:** Animated progress bars for fermentation tracking.