# Currency Converter

A small currency converter built with React, TypeScript, and Vite. It loads currencies from CurrencyBeacon and updates the converted amount when the user changes the amount or currencies.

## Setup

Install the dependencies:

```bash
npm install
```

Start the app:

```bash
npm run dev
```

## API key

Create a free CurrencyBeacon account and copy your API token.

Create a `.env` file in the project root and add:

```env
VITE_CURRENCYBEACON_API_KEY=your_api_key_here
```

Restart the development server after creating or changing `.env`.

## Decisions and assumptions

- Currency options come from the CurrencyBeacon currencies endpoint.
- Conversion uses the CurrencyBeacon convert endpoint.
- Conversion starts after a short delay when the amount or selected currencies change.
- The API key is stored in `.env` and is not committed to the repository.
- This is a frontend take-home project, so the API key can still be seen in browser requests.

## Checks

Run linting:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```
