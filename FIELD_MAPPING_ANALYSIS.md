# Registration Form Field Mapping Analysis

## Frontend vs Backend Field Comparison

### ✅ Matching Fields

| Frontend Field | Backend Field | Type Match | Notes |
|---------------|---------------|------------|-------|
| firstName | firstName | ✅ | text → text |
| lastName | lastName | ✅ | text → text |
| email | email | ✅ | email → email |
| phone | phone | ✅ | text → text |
| dateOfBirth | dateOfBirth | ✅ | string → date |
| gender | gender | ✅ | enum → select |
| country | country | ✅ | string → select |
| nationality | nationality | ✅ | string → select |
| city | city | ✅ | string → text |
| address | address | ✅ | string → textarea |
| organization | organization | ✅ | string → text |
| organizationPosition | organizationPosition | ✅ | string → text |
| isInternational | isInternational | ✅ | boolean → checkbox |
| passportNumber | passportNumber | ✅ | string → text |
| passportExpiry | passportExpiry | ✅ | string → date |
| passportIssuingCountry | passportIssuingCountry | ✅ | string → select |
| passportScan | passportScan | ✅ | File → upload |
| visaRequired | visaRequired | ✅ | boolean → checkbox |
| visaStatus | visaStatus | ✅ | enum → select |
| visaApplicationDate | visaApplicationDate | ✅ | string → date |
| visaNumber | visaNumber | ✅ | string → text |
| visaInvitationLetterRequired | visaInvitationLetterRequired | ✅ | boolean → checkbox |
| nationalIdNumber | nationalIdNumber | ✅ | string → text |
| nationalIdType | nationalIdType | ✅ | enum → select |
| emergencyContactName | emergencyContactName | ✅ | string → text |
| emergencyContactRelationship | emergencyContactRelationship | ✅ | enum → select |
| emergencyContactPhone | emergencyContactPhone | ✅ | string → text |
| emergencyContactEmail | emergencyContactEmail | ✅ | email → email |
| emergencyContactAddress | emergencyContactAddress | ✅ | string → textarea |
| emergencyContactCountry | emergencyContactCountry | ✅ | string → select |
| emergencyContactCity | emergencyContactCity | ✅ | string → text |
| emergencyContactPostalCode | emergencyContactPostalCode | ✅ | string → text |
| arrivalDate | arrivalDate | ✅ | string → date |
| departureDate | departureDate | ✅ | string → date |
| flightNumber | flightNumber | ✅ | string → text |
| travelInsuranceProvider | travelInsuranceProvider | ✅ | string → text |
| travelInsurancePolicyNumber | travelInsurancePolicyNumber | ✅ | string → text |
| travelInsuranceExpiry | travelInsuranceExpiry | ✅ | string → date |
| accommodationRequired | accommodationRequired | ✅ | boolean → checkbox |
| accommodationPreferences | accommodationPreferences | ✅ | string → textarea |
| hasHealthInsurance | hasHealthInsurance | ✅ | boolean → checkbox |
| insuranceProvider | insuranceProvider | ✅ | string → text |
| insurancePolicyNumber | insurancePolicyNumber | ✅ | string → text |
| medicalConditions | medicalConditions | ✅ | string → textarea |
| bloodType | bloodType | ✅ | enum → select |
| category | category | ✅ | enum → select |
| dietaryRestrictions | dietaryRestrictions | ⚠️ | array → select (hasMany) |
| accessibilityNeeds | accessibilityNeeds | ✅ | string → textarea |
| tshirtSize | tshirtSize | ✅ | enum → select |

### ⚠️ Potential Issues

#### 1. **dietaryRestrictions Array Handling**
- **Frontend**: Sends as array `['vegetarian', 'vegan']` via `formData.append(key, item)` for each item
- **Backend API**: Expects array but current logic may not handle multiple FormData entries correctly
- **Issue**: The API checks for `key.includes('[]')` but frontend doesn't append `[]` to the key
- **Fix Needed**: Update API to handle multiple entries with same key name

#### 2. **Boolean Conversion**
- **Frontend**: Sends booleans as strings `'true'`/`'false'` in FormData
- **Backend API**: Converts string booleans to actual booleans ✅ (Already fixed)
- **Status**: ✅ Fixed in recent commit

#### 3. **Date Format**
- **Frontend**: Sends dates as strings (ISO format from date input)
- **Backend**: Expects date type
- **Status**: ✅ Should work (Payload handles string to date conversion)

#### 4. **Passport Scan File Upload**
- **Frontend**: Sends as File object
- **Backend**: Handles File upload separately
- **Status**: ✅ Fixed in recent commit (File to Buffer conversion)

### 🔍 Missing Fields (Backend Only - Not User-Filled)

These fields are auto-generated or admin-only:
- `registrationId` - Auto-generated
- `status` - Defaults to 'pending', not user-filled
- `paymentStatus` - Defaults to 'pending', not user-filled
- `securityCheckStatus` - Admin only
- `securityCheckNotes` - Admin only
- `notes` - Admin only
- `deletedAt` - Admin only
- `createdAt` - Auto-generated
- `updatedAt` - Auto-generated

### 📋 Required Field Comparison

#### Frontend Required:
- firstName ✅
- lastName ✅
- email ✅
- phone ✅
- dateOfBirth ✅
- gender ✅
- country ✅
- nationality ✅
- city ✅
- address ✅
- organization ✅
- category ✅
- emergencyContactName ✅
- emergencyContactRelationship ✅
- emergencyContactPhone ✅
- emergencyContactEmail ✅
- emergencyContactAddress ✅
- emergencyContactCountry ✅
- emergencyContactCity ✅
- passportNumber (if international) ✅
- passportExpiry (if international) ✅
- passportIssuingCountry (if international) ✅
- passportScan (if international) ✅

#### Backend Required:
- firstName ✅
- lastName ✅
- email ✅
- phone ✅
- dateOfBirth ✅
- gender ✅
- country ✅
- nationality ✅
- city ✅
- address ✅
- organization ✅
- category ✅
- emergencyContactName ✅
- emergencyContactRelationship ✅
- emergencyContactPhone ✅
- emergencyContactEmail ✅
- emergencyContactAddress ✅
- emergencyContactCountry ✅
- emergencyContactCity ✅
- passportNumber (if international) ✅
- passportExpiry (if international) ✅
- passportIssuingCountry (if international) ✅
- passportScan (if international) ✅

**Status**: ✅ All required fields match!

### 🐛 Known Issues to Fix

1. **dietaryRestrictions Array**: Need to fix API to handle multiple FormData entries with same key
2. **FormData Array Handling**: Current logic may overwrite values instead of creating arrays



