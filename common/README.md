# Common - Shared Resources

Shared TypeScript resources, types, and utilities used across the frontend and backend of the On-Chain Riddle platform. This package provides type-safe data transfer objects, validation, and common utilities.

## 🛠️ Tech Stack

- **TypeScript** - Type-safe JavaScript
- **Class Validator** - Decorator-based validation
- **Class Transformer** - Object transformation and serialization
- **Reflect Metadata** - Decorator metadata support
- **UUID** - Unique identifier generation

## 🏗️ Architecture

### Project Structure

```
src/
├── abi/                    # Smart contract ABIs
│   └── onchainRiddleAbi.ts
├── decorators/             # Custom validation decorators
│   ├── Custom.ts
│   ├── CustomAsync.ts
│   ├── CustomWithObj.ts
│   └── Match.ts
├── enums/                  # Shared enumerations
│   ├── ERoleName.ts
│   ├── ERuleName.ts
│   └── EWebsocketMessageType.ts
├── injectables/            # Dependency injection tokens
│   ├── Di.ts
│   ├── UserServiceClassToken.ts
│   ├── RoleServiceClassToken.ts
│   ├── RuleServiceClassToken.ts
│   └── FileServiceClassToken.ts
└── resources/              # Data transfer objects
    ├── Resource.ts         # Base resource class
    ├── Auth/              # Authentication resources
    ├── User/              # User-related resources
    ├── Riddle/            # Riddle-related resources
    ├── Role/              # Role and permission resources
    └── Rules/             # Rule definition resources
```

## 📦 Core Components

### Base Resource Class

The `Resource` class provides the foundation for all data transfer objects:

```typescript
export default class Resource {
  // Hydrate plain objects into typed resources
  public static hydrate<T extends Resource>(from: T): T

  // Validate resources with class-validator
  public validateOrReject(validatorOptions?: ValidatorOptions): Promise<this>
  
  // Array operations
  public static hydrateArray<T extends Resource>(fromArray: T[]): T[]
  public static validateArrayOrReject<T extends Resource>(objects: T[]): Promise<void>
}
```

### Smart Contract ABI

Provides type-safe contract interaction:

```typescript
export const ONCHAIN_RIDDLE_ABI = [
  // Contract function signatures
  // Event definitions
  // View function definitions
] as const;

export type OnchainRiddleABI = typeof ONCHAIN_RIDDLE_ABI;
```

### WebSocket Message Types

Defines real-time communication events:

```typescript
export enum EWebsocketMessageType {
  RIDDLE_PUBLISHED = "RIDDLE_PUBLISHED",
  RIDDLE_SOLVED = "RIDDLE_SOLVED",
  RIDDLE_PUBLISHING = "RIDDLE_PUBLISHING",
  USER_SUBMISSION_UPDATE = "USER_SUBMISSION_UPDATE"
}
```

## 🚀 Setup & Installation

### Prerequisites

- Node.js v18+
- TypeScript knowledge
- Understanding of the overall project architecture

### 1. Install Dependencies

```bash
cd common
npm install
```

### 2. Build Package

```bash
# Build TypeScript to JavaScript
npm run build

# Output will be in dist/ directory
```

### 3. Usage in Other Packages

The common package is automatically linked when running the root `npm run postinstall`:

```json
// In backend or frontend package.json
{
  "dependencies": {
    "common": "file:../common/dist"
  }
}
```

## 📋 Resource Types

### Authentication Resources

**JwtPairResource** - JWT token pair for authentication:
```typescript
export default class JwtPairResource extends Resource {
  @Expose() public accessToken!: string;
  @Expose() public refreshToken!: string;
}
```

### User Resources

**UserJwtResource** - User data embedded in JWT:
```typescript
export default class UserJwtResource extends Resource {
  @Expose() public id!: string;
  @Expose() public address!: string;
  @Type(() => RoleResponseRessource)
  @Expose() public role!: RoleResponseRessource;
}
```

**UserPreSignRequestResource** - Pre-authentication request:
```typescript
export default class UserPreSignRequestResource extends Resource {
  @IsNotEmpty()
  @Expose() public address!: string;
}
```

**UserSignInRequestResource** - Authentication with signature:
```typescript
export default class UserSignInRequestResource extends Resource {
  @IsNotEmpty()
  @Expose() public address!: string;
  
  @IsNotEmpty()
  @Expose() public signature!: string;
}
```

### Riddle Resources

**RiddleResponseResource** - Riddle data for API responses:
```typescript
export default class RiddleResponseResource extends Resource {
  @Expose() public id!: string;
  @Expose() public question!: string;
  @Expose() public answer?: string | null;
  @Expose() public isActive!: boolean;
  @Expose() public solvedBy?: string | null;
  @Expose() public solvedAt?: Date | null;
  @Expose() public createdAt?: Date | null;
}
```

**SubmitAnswerRequestResource** - Answer submission request:
```typescript
export default class SubmitAnswerRequestResource extends Resource {
  @IsString()
  @IsNotEmpty()
  @Expose() public transactionHash!: string;
}
```

**RiddleStatsResponseResource** - Platform statistics:
```typescript
export default class RiddleStatsResponseResource extends Resource {
  @Expose() public totalRiddles!: number;
  @Expose() public solvedRiddles!: number;
  @Expose() public activeRiddleId?: string;
  @Expose() public topSolvers!: TopSolverResource[];
}
```

### Role & Permission Resources

**RoleResponseRessource** - User role with permissions:
```typescript
export default class RoleResponseRessource extends Resource {
  @IsUUID(4)
  @Expose() public id!: string;
  
  @IsNotEmpty()
  @Expose() public name!: string;
  
  @Type(() => RulesResponseRessource)
  @ValidateNested()
  @Expose() public rules!: RulesResponseRessource[];
}
```

## 🎯 Validation System

### Built-in Validators

The package uses class-validator decorators for type-safe validation:

```typescript
// Common validators
@IsNotEmpty()        // Field must not be empty
@IsString()          // Must be string type
@IsUUID(4)          // Must be valid UUID v4
@IsEmail()          // Must be valid email format
@IsOptional()       // Field is optional

// Custom validation
@IsEthereumAddress() // Custom validator for wallet addresses
@IsValidSignature()  // Custom validator for cryptographic signatures
```

### Custom Decorators

**Custom** - Synchronous custom validation:
```typescript
@Custom((value) => value.length > 5, {
  message: 'Value must be longer than 5 characters'
})
public customField!: string;
```

**CustomAsync** - Asynchronous custom validation:
```typescript
@CustomAsync(async (value) => {
  return await someAsyncValidation(value);
})
public asyncField!: string;
```

**Match** - Field matching validation:
```typescript
@Match('password', { message: 'Passwords must match' })
public confirmPassword!: string;
```

## 🔧 Dependency Injection

### Service Tokens

The package provides service tokens for dependency injection:

```typescript
// Abstract base classes for service injection
export default class UserServiceClassToken {
  public async exists(_id: string): Promise<boolean> {
    throw new Error("Must be implemented by actual service");
  }
}
```

### Dependency Injection Container

**Di.ts** - Central dependency injection manager:
```typescript
export default abstract class Di {
  private static userService: UserServiceClassToken;
  private static roleService: RoleServiceClassToken;
  
  public static getUserService() {
    if (!this.userService) throw new Error("UserService not set");
    return this.userService;
  }
  
  public static setUserService(userService: UserServiceClassToken) {
    this.userService = userService;
  }
}
```

## 🔄 Usage Examples

### Frontend Usage

```typescript
import RiddleResponseResource from 'common/resources/Riddle/RiddleResponseResource';
import { EWebsocketMessageType } from 'common/enums/EWebsocketMessageType';

// Hydrate API response
const riddle = RiddleResponseResource.hydrate<RiddleResponseResource>({
  id: '123',
  question: 'What has keys but no locks?',
  isActive: true
});

// Validate before sending
await riddle.validateOrReject();
```

### Backend Usage

```typescript
import SubmitAnswerRequestResource from 'common/resources/Riddle/SubmitAnswerRequestResource';
import { ONCHAIN_RIDDLE_ABI } from 'common/abi/onchainRiddleAbi';

// Validate incoming request
const request = SubmitAnswerRequestResource.hydrate<SubmitAnswerRequestResource>(req.body);
await request.validateOrReject();

// Use contract ABI
const contract = new ethers.Contract(address, ONCHAIN_RIDDLE_ABI, provider);
```

## 🔧 Development

### Adding New Resources

1. Create new resource class extending `Resource`:
```typescript
export default class NewResource extends Resource {
  @IsNotEmpty()
  @Expose()
  public requiredField!: string;
  
  @IsOptional()
  @Expose()
  public optionalField?: string;
}
```

2. Add validation decorators as needed
3. Export from appropriate index file
4. Rebuild package: `npm run build`

### Adding New Enums

1. Create enum file in `src/enums/`:
```typescript
export enum ENewEnum {
  VALUE_ONE = "VALUE_ONE",
  VALUE_TWO = "VALUE_TWO"
}
```

2. Export from main index
3. Use in resources with proper typing

### Custom Validators

Create custom validation decorators:
```typescript
export function IsEthereumAddress(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isEthereumAddress',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return typeof value === 'string' && /^0x[a-fA-F0-9]{40}$/.test(value);
        }
      }
    });
  };
}
```

## 📋 Available Scripts

```bash
npm run build          # Build TypeScript to JavaScript
```

## 🔍 Type Safety

### Resource Hydration

Type-safe object creation:
```typescript
// Compile-time type checking
const user = UserJwtResource.hydrate<UserJwtResource>({
  id: '123',
  address: '0x1234...5678',
  role: { /* role object */ }
});

// TypeScript will catch missing or incorrect fields
```

### Validation Integration

Automatic validation with decorators:
```typescript
try {
  await resource.validateOrReject();
  // Resource is guaranteed to be valid
} catch (errors) {
  // Handle validation errors
  console.log('Validation failed:', errors);
}
```

## 🚀 Distribution

### Build Output

After running `npm run build`, the `dist/` directory contains:
- Compiled JavaScript files
- TypeScript declaration files (.d.ts)
- Source maps for debugging

### Package Linking

The common package is automatically linked to backend and frontend:
```json
{
  "dependencies": {
    "common": "file:../common/dist"
  }
}
```

### Import Paths

Use consistent import paths across projects:
```typescript
// Correct imports
import RiddleResponseResource from 'common/resources/Riddle/RiddleResponseResource';
import { EWebsocketMessageType } from 'common/enums/EWebsocketMessageType';
import { ONCHAIN_RIDDLE_ABI } from 'common/abi/onchainRiddleAbi';
```

## 🔧 Troubleshooting

### Common Issues

1. **Build Errors**
   - Ensure all dependencies are installed: `npm install`
   - Check TypeScript version compatibility
   - Verify decorator metadata is enabled

2. **Import Errors**
   - Rebuild common package: `npm run build`
   - Check import paths are correct
   - Verify package is properly linked

3. **Validation Errors**
   - Check decorator imports
   - Ensure reflect-metadata is imported
   - Verify validation logic in custom decorators

### Debug Commands

```bash
# Check build output
ls -la dist/

# Verify TypeScript compilation
npx tsc --noEmit

# Check package linking
npm ls common  # Run from backend or frontend
```

## 🏗️ Architecture Benefits

### Type Safety
- Shared interfaces ensure consistency
- Compile-time error checking
- IntelliSense support across projects

### Validation
- Centralized validation logic
- Reusable validation decorators
- Runtime type checking

### Maintainability
- Single source of truth for data structures
- Easy to update shared types
- Consistent API contracts

### Code Reuse
- Shared utilities and helpers
- Common business logic
- Standardized error handling