# AlgorithmComputeWizard Debugging Session

## Problem Description

The "Buy Compute Job" button in the `@AlgorithmComputeWizard/` component was initially disabled due to validation issues. After fixing the validation schema, the button is now enabled, but form submission fails when attempting to start the compute job.

## Wizard Types Overview

### AlgorithmComputeWizard

- **Purpose**: For running algorithms against datasets
- **Main Asset**: Algorithm (user selects datasets to run against it)
- **Flow**: Algorithm → Dataset Selection → Services → Compute Environment → Review
- **Key Difference**: `values.algorithm` is `null`, `values.dataset` contains selected dataset IDs

### ComputeWizard (Dataset-based)

- **Purpose**: For running datasets with algorithms
- **Main Asset**: Dataset (user selects algorithm to run against it)
- **Flow**: Dataset → Algorithm Selection → Services → Compute Environment → Review
- **Key Difference**: `values.algorithm` contains selected algorithm, `values.dataset` contains main dataset

### DatasetComputeWizard

- **Purpose**: For dataset-specific compute operations
- **Main Asset**: Dataset
- **Flow**: Similar to ComputeWizard but dataset-focused

## Wizard Architecture

### Step Flow (AlgorithmComputeWizard)

1. **Step 1**: Select Dataset - User chooses datasets to run against the algorithm
2. **Step 2**: Select Services - User selects services for chosen datasets
3. **Step 3**: Select Algorithm - Algorithm is pre-selected (main asset)
4. **Step 4**: Configure Environment - User sets compute resources (CPU, RAM, disk, duration)
5. **Step 5**: Preview Services - Review selected datasets and services
6. **Step 6**: Review - Final review with "Buy Compute Job" button

### Form Structure

- **Formik Context**: Manages form state across all steps
- **Step Navigation**: Controlled by `values.user.stepCurrent`
- **Data Persistence**: Form values persist between steps
- **Validation**: Yup schema validates each step completion

### State Management

- **Local State**: Component-specific state (e.g., `selectedDatasetAsset`, `selectedComputeEnv`)
- **Form State**: Formik-managed state (`values.*`)
- **Global State**: Application state (e.g., `isOrdering`, `isOrdered`)

## Initial Investigation

### Console Logs Analysis

- **Initial Issue**: Button showed `isDisabled: true` due to validation schema problems
- **Current Status**: Button is now enabled (`isDisabled: false`) after fixing validation
- **New Issue**: Form submission fails when button is clicked due to undefined state variables
- **Form Data**: All required fields are populated and validation passes (`isValid: true`)

### Key Findings

#### 1. Form Validation Issues ✅ **FIXED**

- **Location**: `src/components/AlgorithmComputeWizard/_validation.ts`
- **Problem**: Line 11 had contradictory validation: `algorithm: Yup.object().nullable().required('Algorithm is required')`
- **Impact**: This caused `isValid: false` even when form was complete
- **Fix Applied**: Changed to validate `dataset` array instead of `algorithm` object
- **Result**: Button is now enabled and clickable

#### 2. Data Flow Problems

- **SelectDataset Component**: Was setting `setFieldValue('datasets', ...)` (plural) instead of `setFieldValue('dataset', ...)` (singular)
- **Data Structure Mismatch**: Setting full dataset objects instead of IDs (strings)
- **Impact**: App gets stuck on step 2, form doesn't progress

#### 3. State Management Issues

- **selectedDatasetAsset**: Remains empty even when `values.dataset` has IDs
- **selectedComputeEnv**: Undefined when form submission is attempted
- **selectedResources**: Undefined when form submission is attempted

#### 4. onSubmit Function Problems

- **Location**: `src/components/AlgorithmComputeWizard/index.tsx`
- **Issue**: Checking for `selectedComputeEnv` and `selectedResources` (undefined state variables) instead of using form values
- **Current Check**:
  ```typescript
  if (!selectedComputeEnv || !selectedResources) {
    // Error: "Please configure the compute environment resources before proceeding."
  }
  ```
- **Should Check**:
  ```typescript
  if (
    !values.computeEnv ||
    !values.cpu ||
    !values.ram ||
    !values.disk ||
    !values.jobDuration
  ) {
    // Use actual form values
  }
  ```

## Files Modified

### 1. `src/components/AlgorithmComputeWizard/Steps.tsx`

- Removed duplicate props (`totalPrices`, `isRequestingPrice`)
- Added missing props (`providerFeeAmount`, `validUntil`)
- Cleaned up verbose console logs

### 2. `src/components/AlgorithmComputeWizard/SelectDataset/index.tsx`

- Fixed field name from `datasets` to `dataset`
- Changed data structure from full objects to IDs
- Added debugging logs for dataset fetching

### 3. `src/components/AlgorithmComputeWizard/PreviewSelectedServices/index.tsx`

- Corrected references from `values.datasets` to `values.dataset`

### 4. `src/components/AlgorithmComputeWizard/SelectServices/index.tsx`

- Corrected references from `values.datasets` to `values.dataset`

### 5. `src/components/AlgorithmComputeWizard/Review/index.tsx`

- Added detailed debugging logs to `PurchaseButton`
- Identified missing `onClick` prop in `ButtonBuy`

### 6. `src/components/AlgorithmComputeWizard/index.tsx`

- Declared `providerFeeAmount` and `validUntil` as state variables
- Updated `initPriceAndFees` error handling
- Added null checks for `initResult` in `startJob`
- Cleaned up verbose console logs
- Modified conditional rendering for credential verification

## Attempted Solutions

### 1. DatasetSyncEffect Component

- **Purpose**: Sync `values.dataset` (IDs) with `selectedDatasetAsset` (AssetExtended objects)
- **Implementation**: Used `getAsset()` then `getAlgorithmDatasetsForComputeSelection()`
- **Result**: Removed - determined to be unnecessary overcomplication
- **Reason**: User compared with `feat/stage` branch and found it wasn't needed

### 2. Git Branch Comparison

- **Action**: Checked out `feat/stage` branch to compare implementation
- **Finding**: `AlgorithmComputeWizard` is a new feature not present in `feat/stage`
- **Result**: Reverted changes and returned to debugging original issue

## Current Status

### What's Working

- Form navigation through all steps
- Dataset selection and service selection
- Compute environment configuration
- Form validation (after fixing field names)
- **Button is now enabled** - validation schema fix resolved the disabled state

### What's Broken

- **Form Submission Fails**: Button click results in "Please configure the compute environment resources before proceeding" error
- **State Variable Issue**: `selectedComputeEnv` and `selectedResources` remain undefined
- **Data Flow Disconnect**: Form has data but component ignores it and checks empty state variables
- **Current Error**: Console shows "Compute environment validation failed: selectedComputeEnv: undefined selectedResources: undefined" when onSubmit runs

### Pending Fixes

1. **Validation Schema**: Update `_validation.ts` to require `dataset` array instead of `algorithm` object
2. **onSubmit Function**: Use form values directly instead of undefined state variables

## Error Messages Encountered

### 1. Linter Errors

```
No duplicate props allowed
Cannot find name 'totalPrices'
Cannot find name 'isRequestingPrice'
```

### 2. Runtime Errors

```
Cannot destructure property 'datasetResponses' of '(intermediate value)' as it is undefined
Cannot read properties of undefined (reading 'service')
Cannot read properties of undefined (reading '0')
```

### 3. User-Facing Errors

```
"Please configure the compute environment resources before proceeding."
"Please complete all required fields."
"Invalid session"
```

### 4. Current Runtime Error (Latest)

```
"Compute environment validation failed:"
"selectedComputeEnv: undefined"
"selectedResources: undefined"
```

**Context**: This error occurs in the `onSubmit` function when the button is clicked. The form has all the data (`values.computeEnv`, `values.cpu`, `values.ram`, etc.) but the function checks undefined state variables instead of using the form values.

## Next Steps

### Immediate

1. **✅ Validation Schema**: Fixed - Button is now enabled
2. **❌ onSubmit Function**: Still needed - Update to use form values directly instead of undefined state variables

### Investigation Needed

1. Understand why `selectedComputeEnv` and `selectedResources` are undefined
2. Verify data flow from form values to component state
3. Test button functionality after fixes

## Key Insights

1. **Form vs State Mismatch**: The form collects data correctly, but the component relies on separate state variables that aren't being populated
2. **Validation Contradiction**: Yup schema has `nullable().required()` which is contradictory
3. **Data Structure Inconsistency**: Different components expect different data formats (objects vs IDs)
4. **Over-Engineering**: Some solutions (like `DatasetSyncEffect`) were unnecessary and made things worse

## Data Flow Analysis (Latest Discovery)

### **Correct Data Flow by Wizard Type**

#### **ComputeWizard (Dataset-based)**

- **Main Asset**: Dataset
- **Data Flow**:
  - `values.algorithm` = Selected algorithm object (from algorithm selection step)
  - `values.dataset` = Main dataset ID (the asset being computed on)
  - `selectedAlgorithmAsset` = State variable containing selected algorithm
  - `selectedDatasetAsset` = State variable containing main dataset
- **Validation**: `algorithm: Yup.object().nullable().required('Algorithm is required')` ✅ **CORRECT**

#### **AlgorithmComputeWizard**

- **Main Asset**: Algorithm
- **Data Flow**:
  - `values.algorithm` = `null` (because algorithm IS the main asset)
  - `values.dataset` = Array of selected dataset IDs (e.g., `["did1|service1", "did2|service2"]`)
  - `selectedAlgorithmAsset` = State variable (should be `asset` - the main algorithm)
  - `selectedDatasetAsset` = State variable (should contain resolved dataset objects)
- **Validation**: `dataset: Yup.array().min(1, 'At least one dataset is required')` ✅ **CORRECT**

#### **DatasetComputeWizard**

- **Main Asset**: Dataset
- **Data Flow**: Similar to ComputeWizard

### **Root Cause of State Variable Issues**

The `AlgorithmComputeWizard` is missing the logic to populate these state variables:

- `selectedComputeEnv` = `undefined`
- `selectedResources` = `undefined`

**Why They're Undefined**: The component expects these to be populated from the compute environment configuration step, but they're not being set.

**What Should Happen**:

1. **Step 4 (Configure Environment)**: User sets CPU, RAM, disk, duration
2. **Form Values**: `values.computeEnv`, `values.cpu`, `values.ram`, `values.disk`, `values.jobDuration` get populated ✅
3. **State Variables**: `selectedComputeEnv` and `selectedResources` should get populated from form values ❌ **NOT HAPPENING**
4. **onSubmit**: Should use either form values OR state variables, but currently checks state variables that are undefined

**The Real Problem**: The `AlgorithmComputeWizard` is missing the logic to populate `selectedComputeEnv` and `selectedResources` from the form values during the compute environment configuration step. The working `ComputeWizard` has this logic, but `AlgorithmComputeWizard` doesn't.

## Files to Monitor

- `src/components/AlgorithmComputeWizard/_validation.ts` - Validation schema
- `src/components/AlgorithmComputeWizard/index.tsx` - Main component and onSubmit
- `src/components/AlgorithmComputeWizard/Review/index.tsx` - Purchase button
- `src/components/AlgorithmComputeWizard/SelectDataset/index.tsx` - Dataset selection

## AI Assistant Context & Knowledge Limitations

### **What I Know (Based on Code Analysis)**

- **File Structure**: I can see the component hierarchy and file organization
- **Code Logic**: I can read and analyze the actual implementation code
- **Data Flow**: I can trace how data moves between components and functions
- **Validation Schemas**: I can see the Yup validation rules and identify contradictions
- **State Management**: I can identify where state variables are declared and used
- **Error Messages**: I can see runtime errors and understand their causes

### **What I DON'T Know (Context Gaps)**

- **Business Logic**: I don't understand the domain-specific requirements for compute jobs
- **API Contracts**: I don't know the expected data formats for external services
- **User Workflows**: I don't understand the intended user experience or business processes
- **Performance Requirements**: I don't know about scalability or performance constraints
- **Testing Strategy**: I don't know what tests exist or how the code is validated
- **Deployment Context**: I don't know about environment-specific configurations

### **My Investigation Approach**

1. **Code-First**: I examine actual implementation rather than making assumptions
2. **Pattern Recognition**: I compare working vs. broken components to identify differences
3. **Error Analysis**: I trace error messages back to their root causes in the code
4. **Data Flow Mapping**: I follow how data moves through the system to find disconnects

### **Confidence Levels**

- **High Confidence**: File structure, code logic, validation schemas, error causes
- **Medium Confidence**: Data flow patterns, state management approaches
- **Low Confidence**: Business requirements, user experience design, performance implications

### **Limitations**

- I cannot run the code or see runtime behavior
- I cannot access external documentation or API specifications
- I cannot see the broader system architecture or integration points
- I make recommendations based on code analysis, not business knowledge

## Timeline of Debugging Session

### **Session Progression**

- **Session Start**: Initial "Buy Compute Job" button issue reported
- **Phase 1**: Console log analysis and form validation investigation
- **Phase 2**: Discovery of validation schema contradiction (`nullable().required()`)
- **Phase 3**: Data flow analysis and field name mismatches (`datasets` vs `dataset`)
- **Phase 4**: State variable investigation (`selectedComputeEnv`, `selectedResources`)
- **Phase 5**: Git branch comparison with `feat/stage` (revealed new feature status)
- **Phase 6**: Data flow analysis and architectural mismatch identification

### **Key Breakthroughs**

- **Validation Schema Issue**: Line 11 in `_validation.ts` had contradictory logic
- **Field Name Mismatch**: `SelectDataset` was setting `datasets` instead of `dataset`
- **State Variable Problem**: `onSubmit` checking undefined state variables instead of form values
- **Architectural Mismatch**: Component copied from working wizards but not properly adapted

### **Failed Attempts**

- **DatasetSyncEffect Component**: Over-engineered solution that was unnecessary
- **Git Branch Comparison**: Attempted to understand base implementation but found new feature
- **State Variable Population**: Tried to fix undefined variables without understanding root cause

### **Current Status**

- **Working**: Form navigation, dataset selection, service selection, compute environment configuration
- **Broken**: "Buy Compute Job" button disabled, form submission fails
- **Pending**: Validation schema fix, onSubmit function update

## Technical Deep-Dive

### **Formik Integration**

- **Form Management**: Uses Formik for multi-step form with persistent state
- **Step Navigation**: Controlled by `values.user.stepCurrent` (1-6)
- **Data Persistence**: Form values persist between steps using Formik context
- **Validation**: Yup schema validates each step completion before allowing progression

### **State Synchronization Issues**

- **Formik Values**: `values.dataset`, `values.computeEnv`, `values.cpu`, etc. (working correctly)
- **Component State**: `selectedDatasetAsset`, `selectedComputeEnv`, `selectedResources` (not populated)
- **Disconnect**: Component ignores form data and looks for empty state variables
- **Root Cause**: Missing logic to sync form values with component state

### **Credential Verification (SSI Wallet)**

- **Integration Point**: `useSsiWallet` context for verifier session management
- **Flow Impact**: Credentials must be verified before compute job submission
- **Conditional Rendering**: Shows "Credentials Required" message if verification fails
- **Session Management**: Uses `lookupVerifierSessionId` and `checkVerifierSessionId`

### **Compute Environment Logic**

- **Resource Configuration**: CPU, RAM, disk, job duration set by user in Step 4
- **Environment Selection**: User chooses from available compute environments
- **Resource Validation**: Checks if selected resources are within environment limits
- **Missing Implementation**: Logic to populate `selectedComputeEnv` and `selectedResources` from form values

## Comparison with Working Wizards

### **Side-by-Side Analysis**

| Aspect              | ComputeWizard                 | AlgorithmComputeWizard                                |
| ------------------- | ----------------------------- | ----------------------------------------------------- |
| **Main Asset**      | Dataset                       | Algorithm                                             |
| **Algorithm Field** | `values.algorithm` (selected) | `values.algorithm` (null)                             |
| **Dataset Field**   | `values.dataset` (main asset) | `values.dataset` (selected IDs)                       |
| **Validation**      | `algorithm` required          | `dataset` array required                              |
| **State Variables** | Properly populated            | Undefined (`selectedComputeEnv`, `selectedResources`) |
| **onSubmit Logic**  | Uses populated state          | Checks undefined state variables                      |

### **Code Patterns**

- **Copied Elements**: Form structure, step navigation, basic validation
- **Modified Elements**: Asset type handling, dataset selection logic
- **Missing Elements**: State variable population logic, compute environment synchronization

### **Missing Implementations**

- **State Population**: Logic to set `selectedComputeEnv` from `values.computeEnv`
- **Resource Mapping**: Logic to map form values to `selectedResources` object
- **Environment Sync**: Mechanism to keep state variables in sync with form values

## Error Resolution Strategy

### **Immediate Fixes (High Priority)**

1. **Validation Schema Update**: Change `algorithm` requirement to `dataset` array validation
2. **onSubmit Function Fix**: Use form values directly instead of undefined state variables
3. **State Variable Population**: Add logic to populate state from form values

### **Long-term Solutions (Medium Priority)**

1. **State Management Refactor**: Eliminate redundant state variables, rely on Formik values
2. **Data Flow Architecture**: Establish clear data flow patterns across all wizard types
3. **Component Consistency**: Ensure all wizards follow the same architectural patterns

### **Testing Approach**

1. **Unit Testing**: Test individual component functions with mock data
2. **Integration Testing**: Test complete wizard flow from start to submission
3. **Regression Testing**: Ensure fixes don't break other wizard types
4. **User Acceptance**: Test with actual user workflows and data

### **Rollback Plan**

1. **Git Stash**: Save current changes before applying fixes
2. **Incremental Changes**: Apply fixes one at a time to isolate issues
3. **Quick Revert**: Use `git checkout` to return to working state if needed
4. **Backup Branch**: Create feature branch for experimental fixes

## Code Quality Issues

### **Technical Debt**

- **Copy-Paste Development**: AlgorithmComputeWizard copied from ComputeWizard without proper adaptation
- **Incomplete Refactoring**: Business logic changes without corresponding technical updates
- **State Duplication**: Formik state and React state serving the same purpose
- **Validation Inconsistency**: Different validation rules for similar data structures

### **Architecture Patterns**

- **Separation of Concerns**: Form logic mixed with business logic in components
- **State Management**: Multiple state management approaches (Formik + React state)
- **Data Flow**: Unclear data flow patterns between components
- **Error Handling**: Inconsistent error handling across wizard types

### **Error Handling Improvements**

- **Input Validation**: Better validation of user inputs before processing
- **Graceful Degradation**: Handle missing data without crashing
- **User Feedback**: Clear error messages explaining what went wrong
- **Recovery Mechanisms**: Allow users to fix issues and retry

## Lessons Learned

### **Debugging Techniques That Worked**

1. **Console Log Analysis**: Identifying disabled button state and validation issues
2. **Code Comparison**: Comparing working vs. broken components to find differences
3. **Data Flow Tracing**: Following data through the system to find disconnects
4. **Incremental Testing**: Making small changes and testing each one

### **Debugging Techniques That Didn't Work**

1. **Assumption-Based Fixes**: Guessing solutions without understanding the code
2. **Over-Engineering**: Adding complex solutions for simple problems
3. **Copy-Paste Solutions**: Applying fixes from different contexts without adaptation
4. **Rapid Changes**: Making multiple changes without testing individual fixes

### **Common Pitfalls Identified**

1. **Copy-Paste Development**: Copying working code without understanding its context
2. **Incomplete Refactoring**: Changing business logic without updating technical implementation
3. **State Management Confusion**: Mixing different state management approaches
4. **Validation Schema Mismatch**: Using validation rules from different data models

### **Best Practices for Future Development**

1. **Understand Before Copying**: Analyze code structure before copying from other components
2. **Consistent Architecture**: Use the same patterns across similar components
3. **State Management**: Choose one approach and stick with it consistently
4. **Validation Design**: Design validation schemas that match the actual data flow
5. **Incremental Development**: Make small, testable changes rather than large refactors
6. **Documentation**: Document data flow and state management patterns for future reference
