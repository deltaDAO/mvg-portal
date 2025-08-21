# Feat/Stage Credential Flow Analysis

## Overview

This document provides a comprehensive analysis of how the credential checking flow works in the `feat/stage` branch, specifically focusing on the asset interaction flow where users check credentials and then proceed to Download/Compute actions.

## Key Components

### 1. SsiWallet Context (`src/@context/SsiWallet.tsx`)

#### State Management

- `verifierSessionCache`: Record<string, string> - Stores session IDs for verified credentials
- `sessionToken`: SsiWalletSession - Current wallet session
- `selectedWallet`: SsiWalletDesc - Currently selected SSI wallet
- `cachedCredentials`: SsiVerifiableCredential[] - Cached credentials from wallet

#### Key Functions

```typescript
// Lookup functions for verifier session IDs
lookupVerifierSessionId(did: string, serviceId: string): string
lookupVerifierSessionIdSkip(did: string, serviceId: string): string

// Cache verifier session after successful verification
cacheVerifierSessionId(
  did: string,
  serviceId: string,
  sessionId: string,
  skipCheck?: boolean
): void

// Clear all cached sessions
clearVerifierSessionCache(): void
```

#### Storage Strategy

- Uses localStorage with key `'verifierSessionId'`
- Session keys format: `${did}_${serviceId}` and `${did}_${serviceId}_skip`
- Automatically loads cached sessions on context initialization

### 2. AssetActionCheckCredentials Component (`src/components/Asset/AssetActions/CheckCredentials/index.tsx`)

#### State Management

```typescript
const [checkCredentialState, setCheckCredentialState] =
  useState<CheckCredentialState>(CheckCredentialState.Stop)
const [requiredCredentials, setRequiredCredentials] = useState<string[]>([])
const [exchangeStateData, setExchangeStateData] = useState<ExchangeStateData>(
  newExchangeStateData()
)
const [showVpDialog, setShowVpDialog] = useState<boolean>(false)
const [showDidDialog, setShowDidDialog] = useState<boolean>(false)
```

#### Credential Exchange Flow States

1. **Stop**: Initial state, button shows "Check Credentials"
2. **StartCredentialExchange**: Initiates credential presentation request
3. **ReadDids**: Reads available DIDs from wallet
4. **ResolveCredentials**: Resolves and validates credentials
5. **AbortSelection**: User cancels credential selection

#### Key Flow Logic

##### StartCredentialExchange Case (Lines 108-190)

```typescript
case CheckCredentialState.StartCredentialExchange: {
  const presentationResult = await requestCredentialPresentation(
    asset, accountId, service.id
  )

  // Check if credentials already cached and valid
  if (presentationResult.openid4vc?.redirectUri?.includes('success')) {
    const { id } = extractURLSearchParams(
      presentationResult.openid4vc.redirectUri
    )
    cacheVerifierSessionId(asset.id, service.id, id, true)
    break // Exit flow, credentials already verified
  }

  // Continue with new credential verification flow
  exchangeStateData.openid4vp = presentationResult.openid4vc
  exchangeStateData.poliyServerData = presentationResult.policyServerData

  const searchParams = extractURLSearchParams(exchangeStateData.openid4vp)
  const { state } = searchParams
  exchangeStateData.sessionId = state

  const presentationDefinition = await getPd(state)
  const resultRequiredCredentials = presentationDefinition.input_descriptors.map(
    credential => credential.id
  )
  setRequiredCredentials(resultRequiredCredentials)

  // Check for cached credentials
  const resultCachedCredentials = ssiWalletCache.lookupCredentials(
    asset.id, resultRequiredCredentials
  )
  setCachedCredentials(resultCachedCredentials)

  if (resultRequiredCredentials.length > resultCachedCredentials.length) {
    // Need to get more credentials from wallet
    exchangeStateData.verifiableCredentials =
      await matchCredentialForPresentationDefinition(
        selectedWallet?.id,
        presentationDefinition,
        sessionToken.token
      )

    const cachedCredentialsIds = resultCachedCredentials.map(
      credential => credential.id
    )

    exchangeStateData.verifiableCredentials =
      exchangeStateData.verifiableCredentials.filter(
        credential => !cachedCredentialsIds.includes(credential.id)
      )

    if (exchangeStateData.verifiableCredentials.length > 0) {
      setShowVpDialog(true) // Show credential selection dialog
    } else {
      toast.info('No more credentials found in your ssi wallet')
      setCheckCredentialState(CheckCredentialState.ReadDids)
    }
  } else {
    // All required credentials are cached
    exchangeStateData.selectedCredentials =
      exchangeStateData.verifiableCredentials.map(
        credential => credential.parsedDocument.id
      )
    setCheckCredentialState(CheckCredentialState.ReadDids)
  }

  setExchangeStateData(exchangeStateData)
  break
}
```

##### ReadDids Case (Lines 191-210)

```typescript
case CheckCredentialState.ReadDids: {
  let selectedCredentials =
    exchangeStateData.verifiableCredentials.filter((credential) =>
      exchangeStateData.selectedCredentials.includes(
        credential.parsedDocument.id
      )
    )

  selectedCredentials = [...selectedCredentials, ...cachedCredentials]
  exchangeStateData.selectedCredentials = selectedCredentials.map(
    (credential) => credential.id
  )

  if (selectedCredentials.length === 0) {
    toast.error('You must select at least one credential to present')
    setCheckCredentialState(CheckCredentialState.Stop)
    break
  }

  ssiWalletCache.cacheCredentials(asset.id, selectedCredentials)
  setCachedCredentials(selectedCredentials)

  exchangeStateData.dids = await getWalletDids(
    selectedWallet.id,
    sessionToken.token
  )

  exchangeStateData.selectedDid =
    exchangeStateData.dids.length > 0
      ? exchangeStateData.dids[0].did
      : ''

  setShowDidDialog(true)
  setExchangeStateData(exchangeStateData)
  break
}
```

##### ResolveCredentials Case (Lines 211-285)

```typescript
case CheckCredentialState.ResolveCredentials: {
  const resolvedPresentationRequest = await resolvePresentationRequest(
    selectedWallet?.id,
    exchangeStateData.openid4vp,
    sessionToken.token
  )

  try {
    const result = await usePresentationRequest(
      selectedWallet?.id,
      exchangeStateData.selectedDid,
      resolvedPresentationRequest,
      exchangeStateData.selectedCredentials,
      sessionToken.token
    )

    if ('errorMessage' in result || result.redirectUri.includes('error')) {
      toast.error('Validation was not successful as use presentation')
      handleResetWalletCache()
    } else {
      // SUCCESS: Cache the session ID
      cacheVerifierSessionId(
        asset.id,
        service.id,
        exchangeStateData.sessionId
      )
    }
  } catch (error) {
    handleResetWalletCache()
    toast.error('Validation was not successful')
  }

  // CRITICAL: Reset state and return to Stop
  setExchangeStateData(newExchangeStateData())
  setCheckCredentialState(CheckCredentialState.Stop)
  break
}
```

### 3. AssetActionCheckCredentialsAlgo Component (`src/components/Asset/AssetActions/CheckCredentials/checkCredentialsAlgo.tsx`)

#### Similar Structure to Main Component

- Same state management and flow states
- Uses `sendPresentationRequest` instead of `usePresentationRequest`
- Specifically for algorithm credential verification

#### Key Differences in ResolveCredentials Case

```typescript
case CheckCredentialState.ResolveCredentials: {
  const resolvedPresentationRequest = await resolvePresentationRequest(
    selectedWallet?.id,
    exchangeStateData.openid4vp,
    sessionToken.token
  )

  try {
    const result = await sendPresentationRequest(
      selectedWallet?.id,
      exchangeStateData.selectedDid,
      resolvedPresentationRequest,
      exchangeStateData.selectedCredentials,
      sessionToken.token
    )

    if ('errorMessage' in result || result.redirectUri.includes('error')) {
      toast.error('Validation was not successful as use presentation')
      handleResetWalletCache()
    } else {
      // SUCCESS: Cache the session ID
      cacheVerifierSessionId(
        asset.id,
        service.id,
        exchangeStateData.sessionId
      )
    }
  } catch (error) {
    handleResetWalletCache()
    toast.error('Validation was not successful')
  }

  // CRITICAL: Reset state and return to Stop
  setExchangeStateData({
    ...exchangeStateData,
    ...newExchangeStateData()
  })
  setCheckCredentialState(CheckCredentialState.Stop)
  break
}
```

### 4. Download Component Integration (`src/components/Asset/AssetActions/Download/index.tsx`)

#### Conditional Rendering Logic (Lines 475-485)

```typescript
{
  !isFullPriceLoading &&
    !isOwner &&
    (appConfig.ssiEnabled ? (
      <>
        {verifierSessionCache &&
        lookupVerifierSessionId(asset.id, service.id) ? (
          <>
            <AssetActionBuy asset={asset} />
            <Field
              component={Input}
              name="termsAndConditions"
              type="checkbox"
            />
            <Field
              component={Input}
              name="acceptPublishingLicense"
              type="checkbox"
            />
          </>
        ) : (
          <AssetActionCheckCredentials asset={asset} service={service} />
        )}
      </>
    ) : (
      <>
        <AssetActionBuy asset={asset} />
        <Field component={Input} name="termsAndConditions" type="checkbox" />
        <Field
          component={Input}
          name="acceptPublishingLicense"
          type="checkbox"
        />
      </>
    ))
}
```

#### Session Validation in Form Submit (Lines 250-270)

```typescript
async function handleFormSubmit(values: any) {
  try {
    const skip = lookupVerifierSessionIdSkip(asset.id, service.id)
    if (appConfig.ssiEnabled && !skip) {
      const result = await checkVerifierSessionId(
        lookupVerifierSessionId(asset.id, service.id)
      )
      if (!result.success) {
        toast.error('Invalid session')
        return
      }
    }

    // Continue with download/order logic
    const dataServiceParams = parseConsumerParameterValues(
      values?.dataServiceParams,
      service.consumerParameters
    )
    await handleOrderOrDownload(dataServiceParams)
  } catch (error) {
    toast.error(error.message)
    LoggerInstance.error(error)
  }
}
```

### 5. Compute Component Integration (`src/components/Asset/AssetActions/Compute/index.tsx`)

#### Conditional Rendering Logic (Lines 640-650)

```typescript
{
  appConfig.ssiEnabled ? (
    <>
      {verifierSessionCache && lookupVerifierSessionId(asset.id, service.id) ? (
        <CredentialDialogProvider>
          <FormStartComputeDataset {...props} />
        </CredentialDialogProvider>
      ) : (
        <AssetActionCheckCredentials asset={asset} service={service} />
      )}
    </>
  ) : (
    <CredentialDialogProvider>
      <FormStartComputeDataset {...props} />
    </CredentialDialogProvider>
  )
}
```

#### Session Validation in Form Submit (Lines 528-573)

```typescript
const onSubmit = async (values: ComputeDatasetForm) => {
  try {
    const skip = lookupVerifierSessionIdSkip(asset.id, service.id)
    if (appConfig.ssiEnabled && !skip) {
      const result = await checkVerifierSessionId(
        lookupVerifierSessionId(asset.id, service.id)
      )
      if (!result.success) {
        toast.error('Invalid session')
        return
      }
    }

    // Continue with compute job logic
    await startJob(userCustomParameters)
  } catch (error) {
    toast.error(error.message)
    LoggerInstance.error(error)
  }
}
```

### 6. Algorithm Credentials in Compute (`src/components/Asset/AssetActions/Compute/FormComputeDataset.tsx`)

#### Algorithm Credential Check (Lines 601-631)

```typescript
{
  appConfig.ssiEnabled && selectedAlgorithmAsset ? (
    verifierSessionCache &&
    lookupVerifierSessionId(
      `${selectedAlgorithmAsset?.id}`,
      selectedAlgorithmAsset?.credentialSubject?.services?.[serviceIndex]?.id
    ) ? (
      <PurchaseButton />
    ) : (
      <div style={{ marginTop: '60px', marginLeft: '10px' }}>
        <AssetActionCheckCredentialsAlgo
          asset={selectedAlgorithmAsset}
          service={
            selectedAlgorithmAsset?.credentialSubject?.services?.[serviceIndex]
          }
        />
      </div>
    )
  ) : (
    <PurchaseButton />
  )
}
```

## Critical Flow Points

### 1. Session Caching

- **When**: After successful credential verification in `ResolveCredentials` state
- **Where**: `cacheVerifierSessionId(asset.id, service.id, exchangeStateData.sessionId)`
- **Storage**: localStorage with key `'verifierSessionId'`

### 2. Session Lookup

- **When**: Before showing Download/Compute buttons
- **Where**: `lookupVerifierSessionId(asset.id, service.id)`
- **Result**: Returns session ID if exists, undefined if not

### 3. Conditional Rendering

- **Condition**: `verifierSessionCache && lookupVerifierSessionId(asset.id, service.id)`
- **True**: Show Download/Compute button
- **False**: Show "Check Credentials" button

### 4. Session Validation

- **When**: Before executing Download/Compute actions
- **Where**: `checkVerifierSessionId(lookupVerifierSessionId(asset.id, service.id))`
- **Purpose**: Verify session is still valid on server side

### 5. State Reset After Success

- **CRITICAL**: After successful credential verification, the component resets to `CheckCredentialState.Stop`
- **Why**: This triggers a re-render and allows the parent component to check for the cached session

## Configuration

### App Config (`app.config.cjs`)

```javascript
ssiEnabled: true // Must be enabled for credential flow
```

## Error Handling

### Common Error Scenarios

1. **No credentials found**: `toast.info('No more credentials found in your ssi wallet')`
2. **Verification failed**: `toast.error('Validation was not successful')`
3. **Invalid session**: `toast.error('Invalid session')`
4. **No DIDs found**: `toast.error('No DIDs found in your wallet')`
5. **No credentials selected**: `toast.error('You must select at least one credential to present')`

### Error Recovery

- `handleResetWalletCache()`: Clears all cached data and resets state
- `setExchangeStateData(newExchangeStateData())`: Resets exchange state
- `setCheckCredentialState(CheckCredentialState.Stop)`: Returns to initial state

## Debug Points

### Console Logging

- `LoggerInstance.error(error)` for credential verification errors
- `LoggerInstance.error(error)` for form submission errors
- `console.log(error)` in algorithm component

### State Transitions

- Track `checkCredentialState` changes
- Monitor `verifierSessionCache` updates
- Check localStorage for session persistence

### Key State Reset Points

1. **After successful verification**: `setCheckCredentialState(CheckCredentialState.Stop)`
2. **After errors**: `handleResetWalletCache()` + state reset
3. **After abort**: `setCheckCredentialState(CheckCredentialState.Stop)`

## Key Dependencies

### External Functions

- `requestCredentialPresentation()`: Initiates credential presentation
- `getPd()`: Gets presentation definition
- `matchCredentialForPresentationDefinition()`: Matches credentials
- `getWalletDids()`: Reads DIDs from wallet
- `resolvePresentationRequest()`: Resolves presentation request
- `usePresentationRequest()`: Uses presentation request (main flow)
- `sendPresentationRequest()`: Sends presentation request (algorithm flow)
- `checkVerifierSessionId()`: Validates session on server

### Context Dependencies

- `useSsiWallet()`: Provides wallet context
- `useAccount()`: Provides account information
- `useAsset()`: Provides asset information

## Migration Notes

When implementing this flow in other branches:

1. **Ensure SsiWallet context is properly initialized**
2. **Verify localStorage persistence works**
3. **Check appConfig.ssiEnabled is true**
4. **Implement all conditional rendering logic**
5. **Add session validation before actions**
6. **Handle all error states with appropriate toasts**
7. **Test both main and algorithm credential flows**
8. **CRITICAL: Ensure state reset after successful verification**
9. **CRITICAL: Verify session caching happens before state reset**

## Potential Issues in Your Branch

Based on the analysis, the most likely issues in your branch are:

1. **Missing state reset**: After successful verification, the component might not be resetting to `CheckCredentialState.Stop`
2. **Session caching timing**: The session might not be cached before the state reset
3. **Conditional rendering logic**: The parent components might not be checking for cached sessions correctly
4. **Context initialization**: The SsiWallet context might not be properly initialized
5. **localStorage persistence**: The session might not be persisting to localStorage correctly

## Exact Conditional Rendering Logic

### Download Component (Lines 477-485)

```typescript
{
  !isFullPriceLoading &&
    !isOwner &&
    (appConfig.ssiEnabled ? (
      <>
        {verifierSessionCache &&
        lookupVerifierSessionId(asset.id, service.id) ? (
          <>
            <AssetActionBuy asset={asset} />
            <Field
              component={Input}
              name="termsAndConditions"
              type="checkbox"
            />
            <Field
              component={Input}
              name="acceptPublishingLicense"
              type="checkbox"
            />
          </>
        ) : (
          <AssetActionCheckCredentials asset={asset} service={service} />
        )}
      </>
    ) : (
      <>
        <AssetActionBuy asset={asset} />
        <Field component={Input} name="termsAndConditions" type="checkbox" />
        <Field
          component={Input}
          name="acceptPublishingLicense"
          type="checkbox"
        />
      </>
    ))
}
```

### Compute Component (Lines 647-650)

```typescript
{
  appConfig.ssiEnabled ? (
    <>
      {verifierSessionCache && lookupVerifierSessionId(asset.id, service.id) ? (
        <CredentialDialogProvider>
          <FormStartComputeDataset {...props} />
        </CredentialDialogProvider>
      ) : (
        <AssetActionCheckCredentials asset={asset} service={service} />
      )}
    </>
  ) : (
    <CredentialDialogProvider>
      <FormStartComputeDataset {...props} />
    </CredentialDialogProvider>
  )
}
```

### Algorithm Credentials in Compute (Lines 603-631)

```typescript
{
  appConfig.ssiEnabled && selectedAlgorithmAsset ? (
    verifierSessionCache &&
    lookupVerifierSessionId(
      `${selectedAlgorithmAsset?.id}`,
      selectedAlgorithmAsset?.credentialSubject?.services?.[serviceIndex]?.id
    ) ? (
      <PurchaseButton />
    ) : (
      <div style={{ marginTop: '60px', marginLeft: '10px' }}>
        <AssetActionCheckCredentialsAlgo
          asset={selectedAlgorithmAsset}
          service={
            selectedAlgorithmAsset?.credentialSubject?.services?.[serviceIndex]
          }
        />
      </div>
    )
  ) : (
    <PurchaseButton />
  )
}
```

## Complete Flow Summary

### 1. Initial State

- User sees "Check Credentials" button
- `checkCredentialState` is `Stop`
- No cached session exists

### 2. User Clicks "Check Credentials"

- `checkCredentialState` changes to `StartCredentialExchange`
- Component initiates credential presentation request

### 3. Credential Verification Process

- **StartCredentialExchange**: Request credentials, check cache, show dialogs if needed
- **ReadDids**: Read DIDs from wallet, show DID selection if multiple
- **ResolveCredentials**: Validate credentials with server

### 4. Success Path

- Credentials verified successfully
- `cacheVerifierSessionId()` called to store session
- `setCheckCredentialState(CheckCredentialState.Stop)` resets component
- Component re-renders

### 5. Parent Component Re-render

- Parent (Download/Compute) checks: `verifierSessionCache && lookupVerifierSessionId(asset.id, service.id)`
- If true: Shows Download/Compute button
- If false: Shows "Check Credentials" button

### 6. User Action

- User clicks Download/Compute button
- `handleFormSubmit()` validates session with server
- If valid: Proceeds with action
- If invalid: Shows error and requires re-verification

## Critical Implementation Details

### State Management

- **Component State**: `checkCredentialState` controls the flow
- **Context State**: `verifierSessionCache` stores verified sessions
- **localStorage**: Persists sessions across page reloads

### Error Handling

- **Network Errors**: Reset wallet cache and show error toast
- **Validation Errors**: Reset state and show specific error message
- **Session Errors**: Clear session and require re-verification

### Performance Considerations

- **Session Caching**: Avoids re-verification for same asset/service
- **State Reset**: Ensures clean state after verification
- **Conditional Rendering**: Only shows relevant components

## Migration Checklist

When implementing this flow in your branch, ensure:

### 1. Context Setup

- [ ] SsiWallet context properly initialized
- [ ] `verifierSessionCache` state available
- [ ] `lookupVerifierSessionId` function working
- [ ] `cacheVerifierSessionId` function working

### 2. Component Implementation

- [ ] `AssetActionCheckCredentials` component with all states
- [ ] `AssetActionCheckCredentialsAlgo` component for algorithms
- [ ] Proper state management and transitions
- [ ] Error handling and recovery

### 3. Parent Component Integration

- [ ] Conditional rendering logic in Download component
- [ ] Conditional rendering logic in Compute component
- [ ] Session validation before actions
- [ ] Proper error handling

### 4. Configuration

- [ ] `appConfig.ssiEnabled` set to `true`
- [ ] All required dependencies available
- [ ] localStorage persistence working

### 5. Testing

- [ ] Credential verification flow works
- [ ] Session caching works
- [ ] Parent component re-renders correctly
- [ ] Error scenarios handled properly
- [ ] Algorithm credentials work separately

## Debugging Your Branch

If the Download/Compute button doesn't appear after credential verification:

1. **Check Console**: Look for errors in credential verification
2. **Check localStorage**: Verify session is cached with key `'verifierSessionId'`
3. **Check Context**: Ensure `verifierSessionCache` is updated
4. **Check Conditional Logic**: Verify parent component conditional rendering
5. **Check State Reset**: Ensure component resets to `Stop` state after success

The most common issues are:

- Missing state reset after successful verification
- Session not cached before state reset
- Parent component not checking for cached session correctly
- Context not properly initialized or updated

## Configuration Details

### App Configuration (`app.config.cjs`)

```javascript
// SSI Configuration
ssiEnabled: process.env.NEXT_PUBLIC_SSI_ENABLED
  ? process.env.NEXT_PUBLIC_SSI_ENABLED === 'true'
  : false,
ssiWalletApi: process.env.NEXT_PUBLIC_SSI_WALLET_API || 'https://wallet.demo.walt.id',
ssiDefaultPolicyUrl: process.env.NEXT_PUBLIC_SSI_DEFAULT_POLICIES_URL ||
  'https://raw.githubusercontent.com/OceanProtocolEnterprise/policy-server/refs/heads/main/default-verification-policies',

// Provider Configuration
customProviderUrl: process.env.NEXT_PUBLIC_PROVIDER_URL,
opaServer: process.env.NEXT_PUBLIC_OPA_SERVER_URL,
```

### Environment Variables Required

- `NEXT_PUBLIC_SSI_ENABLED`: Must be 'true' to enable SSI functionality
- `NEXT_PUBLIC_SSI_WALLET_API`: SSI wallet API endpoint
- `NEXT_PUBLIC_PROVIDER_URL`: Provider URL for policy server communication
- `NEXT_PUBLIC_OPA_SERVER_URL`: OPA server URL for policy evaluation

### Next.js Configuration (`next.config.js`)

```javascript
async rewrites() {
  const walletApiBase = process.env.NEXT_PUBLIC_SSI_WALLET_API || 'https://wallet.demo.walt.id'
  const providerUrl = process.env.NEXT_PUBLIC_PROVIDER_URL

  const routes = [
    {
      source: '/ssi/:path*',
      destination: `${walletApiBase}/:path*`
    },
    {
      source: '/provider/:path*',
      destination: `${providerUrl}/:path*`
    }
  ]
  return routes
}
```

## Policy Server Integration

### Policy Server Functions (`src/@utils/wallet/policyServer.ts`)

#### `requestCredentialPresentation()`

```typescript
export async function requestCredentialPresentation(
  asset: Asset,
  consumerAddress: string,
  serviceId: string
): Promise<{
  success: boolean
  openid4vc: string
  policyServerData: PolicyServerInitiateActionData
}>
```

- **Purpose**: Initiates credential presentation request with policy server
- **Parameters**: Asset, consumer address, service ID
- **Returns**: OpenID4VC URL and policy server data
- **Endpoint**: `${customProviderUrl}/api/services/PolicyServerPassthrough`

#### `checkVerifierSessionId()`

```typescript
export async function checkVerifierSessionId(
  sessionId: string
): Promise<PolicyServerResponse>
```

- **Purpose**: Validates session ID with policy server
- **Parameters**: Session ID from cached verification
- **Returns**: Policy server response indicating session validity
- **Endpoint**: `/provider/api/services/PolicyServerPassthrough`

#### `getPd()`

```typescript
export async function getPd(
  sessionId: string
): Promise<PolicyServerPresentationDefinition>
```

- **Purpose**: Retrieves presentation definition from policy server
- **Parameters**: Session ID
- **Returns**: Presentation definition with required credentials
- **Endpoint**: `${customProviderUrl}/api/services/PolicyServerPassthrough`

### Policy Server Actions (`src/@types/PolicyServer.ts`)

```typescript
export enum PolicyServerActions {
  INITIATE = 'initiate',
  GET_PD = 'getPD',
  CHECK_SESSION_ID = 'checkSessionId',
  PRESENTATION_REQUEST = 'presentationRequest',
  DOWNLOAD = 'download',
  PASSTHROUGH = 'passthrough'
}
```

## useCredentials Hook

### Hook Implementation (`src/@hooks/useCredentials.ts`)

```typescript
export function useCredentialDialogState() {
  const [checkCredentialState, setCheckCredentialState] =
    useState<CheckCredentialState>(CheckCredentialState.Stop)
  const [requiredCredentials, setRequiredCredentials] = useState<string[]>([])
  const [exchangeStateData, setExchangeStateData] = useState<ExchangeStateData>(
    newExchangeStateData()
  )
  const [showVpDialog, setShowVpDialog] = useState<boolean>(false)
  const [showDidDialog, setShowDidDialog] = useState<boolean>(false)

  return {
    checkCredentialState,
    setCheckCredentialState,
    requiredCredentials,
    setRequiredCredentials,
    exchangeStateData,
    setExchangeStateData,
    showVpDialog,
    setShowVpDialog,
    showDidDialog,
    setShowDidDialog
  }
}
```

### CredentialDialogProvider (`src/components/Asset/AssetActions/Compute/CredentialDialogProvider.tsx`)

```typescript
export function CredentialDialogProvider({ children }) {
  const dialogState = useCredentialDialogState()
  return (
    <CredentialDialogContext.Provider value={dialogState}>
      {children}
    </CredentialDialogContext.Provider>
  )
}
```

## SSI Wallet Integration

### Wallet Connection Flow

1. **Auto-connection**: When user connects wallet and SSI is enabled
2. **API Override**: User can override SSI wallet API URL
3. **Session Management**: Session token stored in localStorage
4. **Wallet Selection**: User selects SSI wallet and signing key

### Wallet Manager Components

- `SsiWalletManager`: Main wallet management component
- `SsiApiModal`: Modal for API URL configuration
- `SsiWallet`: Wallet selection and management UI

## Credential Policy Parsing

### Policy Parsing Function (`src/components/Publish/_utils.ts`)

```typescript
function parseCredentialPolicies(credentials: any) {
  if (!credentials) return

  // Parse credential policies for asset and services
  // This ensures policies are properly formatted for SSI verification
}
```

### Policy Types Supported

1. **Static Policy**: Simple policy name
2. **Parameterized Policy**: Policy with arguments
3. **Custom URL Policy**: Policy from external URL
4. **Custom Policy**: Custom Rego policy rules

## Error Handling and Recovery

### Comprehensive Error Scenarios

1. **Network Errors**: Policy server communication failures
2. **Wallet Errors**: SSI wallet connection issues
3. **Credential Errors**: Missing or invalid credentials
4. **Session Errors**: Expired or invalid sessions
5. **Validation Errors**: Credential verification failures

### Error Recovery Strategies

- **Cache Clearing**: `handleResetWalletCache()` clears all cached data
- **State Reset**: Components reset to initial state
- **User Feedback**: Toast notifications for all error types
- **Graceful Degradation**: Fallback to non-SSI flow when possible

## Performance Optimizations

### Caching Strategy

- **Credential Caching**: Credentials cached per asset/service
- **Session Caching**: Verification sessions cached in localStorage
- **Policy Caching**: Default policies loaded once
- **State Persistence**: Critical state persisted across page reloads

### Lazy Loading

- **Component Loading**: Credential components loaded only when needed
- **Policy Loading**: Policies loaded on-demand
- **Dialog Loading**: Selection dialogs rendered conditionally

## Security Considerations

### Session Security

- **Session Validation**: All sessions validated with policy server
- **Session Expiry**: Sessions can expire and require re-verification
- **Skip Mechanism**: Some sessions can skip validation (for testing)

### Credential Security

- **Credential Validation**: All credentials validated against policies
- **DID Verification**: DIDs verified with SSI wallet
- **Policy Enforcement**: Strict policy enforcement on server side

## Testing and Debugging

### Debug Features

- **Console Logging**: Comprehensive error logging
- **State Tracking**: All state transitions logged
- **Network Monitoring**: Policy server communication logged
- **Cache Inspection**: localStorage state can be inspected

### Testing Scenarios

1. **Happy Path**: Successful credential verification
2. **Error Paths**: Various error conditions
3. **Edge Cases**: Missing credentials, network failures
4. **Integration**: End-to-end flow testing

## Integration Points

### Asset Context Integration

- **Credential Parsing**: Asset context parses credential policies
- **State Management**: Asset state includes SSI verification status
- **Error Handling**: Asset errors include SSI-related issues

### User Preferences Integration

- **SSI Module**: User can enable/disable SSI module
- **API Configuration**: User can configure SSI wallet API
- **Cache Management**: User can clear SSI cache

### Form Integration

- **Publishing Forms**: SSI policies integrated into publishing workflow
- **Edit Forms**: SSI policies can be edited for existing assets
- **Validation**: SSI policy validation in forms

## Migration and Compatibility

### Backward Compatibility

- **Non-SSI Assets**: Assets without SSI policies work normally
- **Disabled SSI**: When SSI is disabled, normal flow works
- **Missing Credentials**: Graceful handling of missing credentials

### Forward Compatibility

- **New Policy Types**: Support for future policy types
- **Enhanced Validation**: Room for enhanced validation logic
- **Additional Credentials**: Support for additional credential types

## Complete Implementation Checklist

### 1. Environment Setup

- [ ] `NEXT_PUBLIC_SSI_ENABLED=true` in environment
- [ ] `NEXT_PUBLIC_SSI_WALLET_API` configured
- [ ] `NEXT_PUBLIC_PROVIDER_URL` configured
- [ ] `NEXT_PUBLIC_OPA_SERVER_URL` configured (if needed)

### 2. Context Providers

- [ ] `SsiWalletProvider` in app hierarchy
- [ ] `CredentialDialogProvider` for compute flows
- [ ] All required contexts properly initialized

### 3. Component Implementation

- [ ] `AssetActionCheckCredentials` with all states
- [ ] `AssetActionCheckCredentialsAlgo` for algorithms
- [ ] Proper state management and transitions
- [ ] Error handling and recovery

### 4. Parent Component Integration

- [ ] Conditional rendering in Download component
- [ ] Conditional rendering in Compute component
- [ ] Session validation before actions
- [ ] Proper error handling

### 5. Policy Server Integration

- [ ] `requestCredentialPresentation` working
- [ ] `checkVerifierSessionId` working
- [ ] `getPd` working
- [ ] Error handling for policy server calls

### 6. SSI Wallet Integration

- [ ] Wallet connection working
- [ ] Credential selection working
- [ ] DID selection working
- [ ] Session management working

### 7. Caching and Persistence

- [ ] localStorage persistence working
- [ ] Session caching working
- [ ] Credential caching working
- [ ] State persistence working

### 8. Error Handling

- [ ] Network error handling
- [ ] Wallet error handling
- [ ] Credential error handling
- [ ] Session error handling
- [ ] User feedback for all errors

### 9. Testing

- [ ] Happy path testing
- [ ] Error path testing
- [ ] Edge case testing
- [ ] Integration testing
- [ ] Performance testing

### 10. Documentation

- [ ] Code documentation
- [ ] User documentation
- [ ] API documentation
- [ ] Troubleshooting guide

## Final Notes

This analysis covers the complete implementation of the SSI credential verification flow in the `feat/stage` branch. The key to success is ensuring that all components work together seamlessly:

1. **Configuration**: All environment variables and app config must be correct
2. **Context**: SsiWallet context must be properly initialized and available
3. **Components**: All credential components must implement the complete state flow
4. **Integration**: Parent components must check for cached sessions correctly
5. **Error Handling**: All error scenarios must be handled gracefully
6. **Testing**: The complete flow must be tested end-to-end

The most common issues in implementation are:

- Missing or incorrect environment configuration
- Incomplete state management in credential components
- Missing conditional rendering logic in parent components
- Improper error handling that breaks the flow
- Missing session validation before actions

When implementing this in your branch, use this analysis as a comprehensive checklist to ensure nothing is missed.
