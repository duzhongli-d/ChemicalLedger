# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

<!-- TAGS: Added | Changed | Deprecated | Removed | Fixed | Security -->

## [0.2.0] - 2026-05-13

### Added
  - feat(admin/ledgers): add POST endpoint and create page for admin ledger creation
  - feat(research): add learning guide and PPT generation views
  - feat(research): improve Studio Panel UX with context-aware sources badge
  - feat(research): increase Studio Panel width from 420px to 520px
  - feat(admin): add research notebooks management page
  - feat(admin): add research notebooks sidebar item
  - feat(research): add inline citations, source preview cards, and interactive mind map
  - feat(contact): sync contact page with admin settings via public API
  - feat(web): add admin settings page with SMTP and contact config
  - feat(web): add Settings menu in admin sidebar
  - feat(web): add template download button in ImportModal
  - feat(web): show login modal on /research page for unauthenticated users
  - feat(web): redesign LoginModal to match login page style
  - feat(web): reorder login toggle to show Email before Username
  - feat(web): show instrument-specific descriptions on About page instruments
  - feat(web): add dark mode support to About page components
  - feat(web): enhance HeroSection metrics display with i18n labels
  - feat(api): register public_annual_summaries router refactor(web): replace TeamShowcase SVG animations with images
  - feat(web): replace hero hardcoded stats with API-driven data
  - feat(web): add i18n keys for hero metrics
  - feat(web): add Footer component to contact page
  - feat(web): link InstrumentGallery "view all" to technical tab
  - feat(admin): add annual summary data management feature
  - feat(admin): add contact submissions management
  - feat(admin/dashboard): redesign with industrial lab aesthetic
  - feat(admin): add operation logs timeline to ledger detail page
  - feat(admin): add ledger view and edit pages
  - feat(web): redesign ledger view and edit pages with industrial lab aesthetic
  - feat(admin): implement server-side pagination for /admin/ledgers
  - feat(web): add open date feature to /ledgers page
  - feat(web): add API error feedback to LedgerDataTable
  - feat(web): replace LedgersTopBar with Header on /ledgers page
  - feat(web): enhance /verify skill and add /preflight skill
  - feat(web): upgrade contact page hero with layered design
  - feat(web): add standalone /about page with tabbed sections
  - feat(web): update nav to point /contact instead of /#contact
  - feat(web): add /contact page
  - feat(web): add ContactForm component
  - feat(web): add QuickInfoPanel component
  - feat: add ContactInfoCards component
  - feat(web): add contactApi.submit to api client
  - feat(i18n): add contact page translations
  - feat: add hero banner image carousel with crossfade auto-play
  - feat: add i18n translations for ledgers page
  - feat: add login protection props to LedgerDataTable
  - feat: add LoginModal component for authentication
  - feat: add LedgersTopBar component for public ledgers page
  - feat: add '返回首页' link to admin sidebar for easy navigation
  - feat: implement professional admin backend dashboard
  - feat: create admin dashboard page with stats cards
  - feat: add admin ledgers page and audit log page
  - feat: add full CRUD to admin users page
  - feat: add inline editing for category management page
  - feat: create Admin layout and sidebar components
  - feat: redesign login page with email authentication support
  - feat: migrate auth from localStorage to HttpOnly cookies
  - feat: update color scheme to orange primary with teal accent
  - feat: redesign homepage with professional tech-clean aesthetic
  - feat: implement scroll-hide header and expand instrument gallery to 14
  - feat: redesign homepage with precision-lab aesthetic
  - feat: add Playwright E2E test suite with login, dashboard, create and archive journeys
  - feat: add missing frontend pages and route protection
  - feat: scaffold QC platform monorepo
  - feat(admin/ledgers): add POST endpoint and create page for admin ledger creation
  - feat(research): add learning guide and PPT generation views
  - feat(research): implement NotebookLM background processing for sources
  - feat(research): add inline citations, source preview cards, and interactive mind map
  - feat(research): add ResearchSource model with column name mapping fix
  - feat(contact): sync contact page with admin settings via public API
  - feat(api): add admin settings API endpoints
  - feat(api): add SystemSettings schemas
  - feat(api): add SystemSetting model
  - feat(api): add system_settings table for SMTP and contact config
  - feat(api): add script to create expiry test data for dashboard verification
  - feat(api): register public_annual_summaries router refactor(web): replace TeamShowcase SVG animations with images
  - feat(api): add public by-category annual summaries endpoint
  - feat(api): add PublicAnnualSummaryByCategoryResponse schema
  - feat(admin): add annual summary data management feature
  - feat(admin): add contact submissions management
  - feat(admin): add operation logs timeline to ledger detail page
  - feat(admin): implement server-side pagination for /admin/ledgers
  - feat(api): add contact_submissions table migration
  - feat(api): add contact submission endpoint
  - feat(api): add send_contact_email to notification service
  - feat(api): add ContactSubmission model
  - feat: add admin password update script
  - feat: implement professional admin backend dashboard
  - feat: implement ledger management API endpoints
  - feat: implement user management API with CRUD and Excel/CSV import
  - feat: implement admin dashboard stats and trends API
  - feat: implement category management API (PATCH/DELETE)
  - feat: implement audit log list API endpoint
  - feat: create admin router skeleton with 5 sub-routers
  - feat: add AuditService for audit logging in admin operations
  - feat: add AuditLog, UserUpdate, CategoryUpdate, BatchArchiveRequest schemas
  - feat: add AuditLog and DailyStats SQLAlchemy models
  - feat: add audit_logs and daily_stats tables migration
  - feat: redesign login page with email authentication support
  - feat: migrate auth from localStorage to HttpOnly cookies
  - feat: scaffold QC platform monorepo

### Changed
  - refactor(admin): unify button styles across all admin pages
  - refactor(admin/ledgers): update expiry info button label and info box content
  - refactor(ledger): make cert_expiry_date optional, use SOP expiry directly when blank
  - refactor(ledgers): integrate category filter into SearchCreateBar
  - refactor(admin/ledgers): group category dropdown by level1 using optgroup
  - refactor: unify create ledger page styling with edit page
  - test(e2e): add PPT outline tests and fix studio-generate tests
  - test(e2e): add studio generate function tests
  - refactor(admin): optimize research-notebooks page styling
  - refactor(web): remove /research from middleware protected paths
  - refactor(web): update About page milestones to QC platform progression
  - refactor(web): redesign StatCard to Clinical Minimal style
  - refactor(web): simplify admin dashboard header to text-only style
  - refactor(web): redesign TechMetrics cards with prominent numbers and subdued units
  - refactor(web): extract PlatformEntryCard to eliminate duplicate card markup
  - refactor(about): unify TeamExpertiseTab with PlatformStoryTab visual layout
  - refactor(admin): fix sidebar active route matching and remove dead code
  - refactor(admin): elevate sidebar with gradient dark theme and blue glow effects
  - refactor(admin): unify contact page theme with blue accent color
  - refactor(admin): unify admin pages with light theme and consistent UI
  - refactor(admin): redesign dashboard with blue-primary theme
  - refactor(admin): unify dashboard design with annual-summary light theme
  - chore: update company address from Suzhou to Shanghai
  - refactor(admin/ledgers): use categoryApi.list() for filter dropdown
  - refactor(web): split expiring tab into 3细粒度 categories
  - refactor(web): align /admin/ledgers columns with /ledgers table
  - docs(web): add project-specific rules to CLAUDE.md
  - refactor: redesign BrandLogo with molecular aesthetic and update InstrumentGallery styling
  - chore: sync missing components from main branch
  - refactor(ledgers): replace sidebar/header with topbar and login modal
  - refactor: unify homepage to light theme with modern typography
  - test: admin categories, ledgers, and audit-log E2E tests
  - test: admin dashboard page E2E tests
  - test: admin users page E2E tests
  - test: fix error message regex in login E2E test
  - test: add frontend E2E login tests with UI behavior validation
  - refactor: simplify and quality improvements
  - refactor(alembic): clean up migration files
  - refactor(ledger): make cert_expiry_date optional, use SOP expiry directly when blank
  - test(research): add background_processor unit tests
  - merge: unify alembic migration branches
  - test: add backend login API tests
  - refactor: simplify and quality improvements

## [Unreleased]
