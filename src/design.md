Design System Plan

Colors:
- Primary: #00A8FF (Bright blue for buttons and accents)
- Primary Hover: #0086CC
- Background Accent: #F9D64E (Warm yellow from reference) or gradient variation
- Surface: #FFFFFF
- Text Primary: #1A1A1A
- Text Muted: #5A5A5A
- Border: #E5E5E5
- Error: #D64545
- Success: #2EAD5F

Font:
- Use a friendly rounded sans-serif: 'Nunito', 'Inter', 'system-ui'.

Radii & Elevation:
- Card radius: 20px
- Button radius: 28px (pill)
- Input radius: 12px
- Shadow soft: 0 4px 12px rgba(0,0,0,0.08)
- Shadow card: 0 8px 24px rgba(0,0,0,0.08)

Spacing Scale (px): 4, 8, 12, 16, 24, 32, 48

Components:
- Button: sizes (md), variants (primary, ghost), full-width, loading state.
- TextInput: label optional, error state, full-width.
- AuthCard: wraps form, provides heading, optional subtitle, back button.
- AuthLayout: split or centered layout with brand area (bird mascot, tagline) and form area. On larger screens show side-by-side; mobile stack.

Flow Enhancements:
1. Entry screen shows brand ("Family Hub" placeholder) with primary actions Sign Up / Login.
2. Login screen with back button to entry, fields (Email, Password), forgot link, secondary navigation to Sign Up.
3. Signup with fields (Email, Username, Password, Confirm Password).
4. Forgot Password and Reset Password use same visual card.

Accessibility:
- Maintain 4.5:1 contrast for text on backgrounds.
- Focus outlines: 0 0 0 3px rgba(0,168,255,0.4).

Animations:
- Button press: transform: translateY(1px).
- Card fade in: opacity 0->1 & slight upward motion.

Next: implement global CSS variables & components.
