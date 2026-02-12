# Angular ShareReplay - Caching Patterns Demo

## Project Purpose

This project demonstrates three different caching patterns in Angular using RxJS, with a focus on `shareReplay` and effective data caching strategies. It showcases common pitfalls and best practices when caching HTTP requests.

## What You'll Learn

### 1. **Basic Caching (Manual) - ❌ Problematic**
- Simple approach using a `null` variable check
- **Problems:**
  - Subscription leaks (no unsubscribe)
  - Incorrect API response handling
  - Race conditions on multiple calls
  - Refresh button doesn't work once cached

### 2. **ShareReplay
- Uses RxJS `shareReplay(1)` operator for automatic caching
- **Benefits:**
  - No subscription leaks
  - Prevents duplicate HTTP requests
  - Shares single subscription among multiple subscribers
- **Caveat:**
  - Can cache errors permanently (solved with `retry` + `catchError`)

### 3. **BehaviorSubject + SwitchMap
- Most sophisticated approach using `BehaviorSubject` as a refresh trigger
- **Benefits:**
  - Smart refresh without resetting cache
  - Reactive pattern (RxJS idiomatic)
  - Errors are not permanently cached
  - All subscribers get updates simultaneously
- **Use case:** Production applications requiring reliable refresh capabilities

## Getting Started

### Prerequisites
- Node.js (v16+)
- Angular CLI

### Installation

```bash
# Navigate to project
cd angular-shareReplay

# Install dependencies
npm install
```

### Running the Application

```bash
# Start development server
ng serve

# Navigate to browser
http://localhost:4200
```

## How to Use

The application displays Star Wars vehicles fetched from an external API. You can test three different caching approaches:

1. **Basic Caching** - Click "Load Vehicles (Basic)" to test simple manual caching
2. **ShareReplay** - Click "Load Vehicles (ShareReplay)" to test shareReplay caching with retry
3. **BehaviorSubject** - Click "Load Vehicles (Behavior)" to load, then "Refresh Data (Behavior)" to trigger refresh

## Key Files

- [app.service.ts](src/app.service.ts) - Service with three caching implementations
- [app.ts](src/app/app.ts) - Component demonstrating all three methods
- [app.html](src/app/app.html) - UI with buttons to test each approach

## Important Concepts

### shareReplay(1) - Why Store the Observable?

```typescript
// ❌ Wrong - Creates new observable every call
return this.http.get(...).pipe(shareReplay(1)); // shareReplay ineffective

// ✅ Correct - Stores and reuses same observable
if (!this.cached$) {
  this.cached$ = this.http.get(...).pipe(shareReplay(1));
}
return this.cached$;
```

### Preventing Cached Errors

```typescript
// Use retry() before catchError() and before shareReplay()
this.http.get(...)
  .pipe(
    retry(2),
    catchError(error => {
      this.cache$ = null; // Reset on error
      return throwError(() => error);
    }),
    shareReplay(1)
  )
```

### Smart Refresh Pattern

```typescript
// BehaviorSubject triggers fresh requests
private refreshTrigger$ = new BehaviorSubject<void>(undefined);

this.refreshTrigger$.pipe(
  switchMap(() => this.http.get(...)),
  shareReplay(1)
)
```

## Testing the Patterns

1. **First call** - Makes HTTP request
2. **Second call** - Uses cached data (no new request)
3. **Refresh button** - Triggers new HTTP request
4. **Check Network tab** - See which pattern makes new requests

## References

- [RxJS shareReplay Documentation](https://rxjs.dev/api/operators/shareReplay)
- [RxJS switchMap Documentation](https://rxjs.dev/api/operators/switchMap)
- [Angular HttpClient Documentation](https://angular.io/guide/http)
