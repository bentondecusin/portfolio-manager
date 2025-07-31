# Enhanced Transaction API Documentation

## Overview

The enhanced transaction API provides a robust system for handling buy and sell transactions with automatic balance checking, balance deduction, and proper database transaction management.

## Features

### 1. Balance Validation

- **Buy Transactions**: Automatically checks if sufficient cash balance exists before processing
- **Sell Transactions**: Validates that sufficient holdings exist for the specified symbol

### 2. Automatic Balance Management

- **Buy Transactions**: Deducts the total transaction amount from USD cash holdings
- **Sell Transactions**: Adds the sale proceeds back to USD cash holdings

### 3. Database Transaction Safety

- All operations are wrapped in database transactions
- Automatic rollback on any error
- Ensures data consistency across all related tables

### 4. Automatic Data Handling

- **Transaction Time**: Automatically sets the current timestamp
- **Ticker Names**: Automatically retrieves company names from the asset table or uses fallback mappings

## API Endpoint

### POST `/api/transactions`

Creates a new transaction with enhanced validation and balance management.

#### Request Body

```json
{
  "symbol": "AAPL",
  "txnType": "buy",
  "quantity": 10,
  "price": 150.0
}
```

#### Required Fields

- `symbol` (string): Stock symbol (e.g., "AAPL", "MSFT")
- `txnType` (string): Transaction type - "buy" or "sell" (case insensitive)
- `quantity` (number): Number of shares to trade (must be positive)
- `price` (number): Price per share (must be positive)

#### Response Format

**Success Response (200)**

```json
{
  "success": true,
  "message": "Transaction completed successfully. buy 10 shares of AAPL at $150.00",
  "transactionId": 123,
  "data": {
    "id": 123,
    "symbol": "AAPL",
    "tickName": "Apple Inc.",
    "txnType": "buy",
    "quantity": 10,
    "price": 150.0,
    "txnTs": "2025-01-15 14:30:00"
  }
}
```

**Error Responses**

**Insufficient Balance (400)**

```json
{
  "error": "Insufficient cash balance. Required: $1500.00, Available: $500.00",
  "type": "INSUFFICIENT_BALANCE"
}
```

**Insufficient Holdings (400)**

```json
{
  "error": "Insufficient holdings to sell. Required: 50, Available: 25",
  "type": "INSUFFICIENT_HOLDINGS"
}
```

**Invalid Transaction Type (400)**

```json
{
  "error": "Invalid transaction type. Must be \"buy\" or \"sell\""
}
```

**Missing Fields (400)**

```json
{
  "error": "Missing required fields. Please provide symbol, txnType, quantity, and price"
}
```

**Invalid Values (400)**

```json
{
  "error": "Quantity and price must be positive numbers"
}
```

## Implementation Details

### Database Transaction Flow

1. **Begin Transaction**: Starts a database transaction
2. **Validation Phase**:
   - For buy: Check cash balance
   - For sell: Check holdings availability
3. **Balance Operations**:
   - For buy: Deduct cash from USD holdings
   - For sell: Add cash to USD holdings
4. **Main Transaction**: Insert the primary transaction record
5. **Commit**: If all operations succeed, commit the transaction
6. **Rollback**: If any operation fails, rollback all changes

### Ticker Name Resolution

The system automatically resolves ticker names using the following priority:

1. **Asset Table**: Look up the symbol in the `asset` table
2. **Fallback Mapping**: Use predefined mappings for common symbols
3. **Symbol Fallback**: Use the symbol itself if no mapping exists

### Common Symbol Mappings

```javascript
{
  'AAPL': 'Apple Inc.',
  'MSFT': 'Microsoft Corporation',
  'GOOGL': 'Alphabet Inc.',
  'AMZN': 'Amazon.com Inc.',
  'TSLA': 'Tesla Inc.',
  'NVDA': 'NVIDIA Corporation',
  'META': 'Meta Platforms Inc.',
  'NFLX': 'Netflix Inc.',
  'JPM': 'JPMorgan Chase & Co.',
  'KO': 'Coca-Cola Company',
  'USD': 'US Dollar'
}
```

## Error Handling

### Transaction-Specific Errors

- **INSUFFICIENT_BALANCE**: Not enough cash for buy transaction
- **INSUFFICIENT_HOLDINGS**: Not enough shares for sell transaction

### Validation Errors

- **Missing required fields**
- **Invalid transaction type**
- **Non-positive quantity or price**

### System Errors

- **Database connection issues**
- **Transaction rollback failures**
- **Internal server errors**

## Testing

Use the provided test script to verify the API functionality:

```bash
cd BACKEND
node test_transaction_api.js
```

The test script covers:

- Insufficient balance scenarios
- Insufficient holdings scenarios
- Invalid transaction types
- Missing required fields
- Valid transaction structures

## Integration with Frontend

The frontend trade application should:

1. **Send Required Fields**: Only send `symbol`, `txnType`, `quantity`, and `price`
2. **Handle Success**: Display success message and transaction details
3. **Handle Errors**: Show appropriate error messages based on error type
4. **Refresh Data**: Update portfolio and balance displays after successful transactions

## Security Considerations

- All database operations use parameterized queries to prevent SQL injection
- Input validation occurs before any database operations
- Database transactions ensure data consistency
- Error messages don't expose sensitive system information

## Performance Notes

- Database transactions are used to ensure ACID properties
- Connection pooling is utilized for efficient database connections
- Ticker name resolution includes caching through asset table lookups
- All operations are optimized for minimal database round trips
