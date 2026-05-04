# AGENTS.md

## Project overview

This project is a web application for family weekly meal planning.

The application helps a household generate a weekly menu for multiple people, with:
- one shared family menu;
- different portions for each person;
- small individual additions when needed;
- weekly grocery list;
- printable reports;
- nutritional dashboard.

The app is only an organizational and indicative support tool. It is not a medical, clinical, or dietetic tool.

## Tech stack

Use the following stack unless explicitly instructed otherwise:

- Next.js with App Router
- TypeScript
- PostgreSQL
- Prisma ORM
- Tailwind CSS
- React components
- Server Actions or API routes where appropriate
- Stripe for subscriptions
- PDF generation for printable reports

## General development rules

- Keep the code simple and readable.
- Use TypeScript types everywhere.
- Do not hardcode business logic inside UI components.
- Keep meal generation logic in dedicated service files.
- Keep nutritional calculation logic in dedicated utility/service files.
- Keep database models aligned with `/docs/data-model.md`.
- If a data model changes, update `/docs/data-model.md`.
- If generation logic changes, update `/docs/menu-generation-algorithm.md`.
- Do not introduce unnecessary libraries.
- Prefer explicit, maintainable code over clever abstractions.

## Product rules

The application must follow these functional rules:

- The system generates one family menu.
- Each person receives different portions.
- No full meal substitutions between family members.
- Individual adaptations may only be:
  - different quantities;
  - small additions, such as egg, yogurt, bread, fruit.
- Lunch and dinner must always include a side dish.
- Side dishes must be specific and quantified.
- Do not output generic “vegetables”.
- Fruit and vegetables must respect seasonality by week number.
- The recipe database is created and managed by the administrator.
- Users cannot create recipes in V1.
- The first recipe database should contain around 50 simple family recipes.
- The recipe format must be standardized and easy to extend.

## Disclaimer rule

Always make clear in the UI and printed reports that the application provides only indicative organizational support.

The app:
- does not provide medical advice;
- does not replace a nutritionist, doctor, or dietitian;
- does not manage diseases, allergies, or clinical conditions;
- uses estimated nutritional values.

## Subscription model

The app should support:

- Free plan:
  - limited preview;
  - no complete printable output;
  - limited access to weekly menu generation.

- Premium plan:
  - full weekly menu;
  - grocery list;
  - nutritional dashboard;
  - printable PDFs;
  - saved history.

- Payment options:
  - monthly subscription;
  - annual subscription with discount.

## Development priority

Build the MVP in this order:

1. Data model
2. Recipe and ingredient seed data
3. Household and person setup
4. Weekly settings
5. Menu generation algorithm
6. Grocery list generation
7. Nutritional dashboard
8. Printable exports
9. Subscription limits
10. UI polish

## Testing guidance

Where possible, write pure functions for:

- calorie estimation;
- macro target calculation;
- recipe filtering;
- portion scaling;
- grocery list aggregation;
- seasonality filtering.

These functions should be easy to test independently.
