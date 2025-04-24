import {
  CustomPolicy,
  CustomUrlPolicy,
  ParameterizedPolicy,
  PolicyArgument,
  PolicyRule,
  PolicyRuleLeftValuePrefix,
  PolicyRuleRightValuePrefix,
  PolicyType,
  StaticPolicy
} from './types'

function readProperties(data: any): PolicyArgument[] {
  const args: PolicyArgument[] = []
  Object.keys(data || {}).forEach((key) => {
    args.push({
      name: key,
      value: data[key]
    })
  })
  return args
}

function parseLine(line: string): PolicyRule {
  let elements = line.split(' ')
  elements = elements.filter((element) => element?.length > 0)

  if (elements.length !== 3) {
    return
  }

  return {
    leftValue: elements[0].replace(PolicyRuleLeftValuePrefix, ''),
    operator: elements[1],
    rightValue: elements[2].replace(PolicyRuleRightValuePrefix, '')
  }
}

function readRules(policy: string): PolicyRule[] {
  const policies: string[] = policy.split('\n')
  const rules: PolicyRule[] = []
  let startReading = false
  for (const line of policies) {
    if (line.replaceAll(' ', '').includes('allowif{')) {
      startReading = true
      continue
    }
    if (line.replaceAll(' ', '').includes('}')) {
      startReading = false
    }

    if (startReading) {
      rules.push(parseLine(line))
    }
  }

  return rules
}

function convertToBracketNotation(key: string): string {
  // eslint-disable-next-line no-useless-escape
  const regex = /^([^\[]+)\["(.+)"\]$/
  const match = key.match(regex)

  if (match) {
    const outer = match[1]
    const inner = match[2]
    return `input.parameter["${outer}"]["${inner}"]`
  }

  return `input.parameter["${key}"]` // fallback if only 1 level
}

function generateRules(arg: any, policy: string): PolicyRule[] {
  const parsedRules = readRules(policy)
  console.log(parsedRules)
  const rules: PolicyRule[] = []

  for (const key of Object.keys(arg)) {
    const value = arg[key]
    const bracketNotation = convertToBracketNotation(key)
    const matchingRule = parsedRules.find(
      (rule) =>
        rule.rightValue === `lower(${bracketNotation})` ||
        rule.rightValue === bracketNotation
    )

    if (matchingRule) {
      rules.push({
        leftValue: key,
        operator: matchingRule.operator,
        rightValue: value
      })
    }
  }

  return rules
}

function isDynamicPolicy(data: any): boolean {
  return (
    'policy' in data &&
    typeof data.policy === 'string' &&
    data.policy === 'dynamic'
  )
}

function hasPolicyUrlRule(args: any): boolean {
  return (
    'rules' in args &&
    typeof args.rules === 'object' &&
    'policy_url' in args.rules &&
    typeof args.rules.policy_url === 'string'
  )
}

function hasRegoRule(args: any): boolean {
  return (
    'rules' in args &&
    typeof args.rules === 'object' &&
    'rego' in args.rules &&
    typeof args.rules.rego === 'string'
  )
}

function hasArguments(args: any) {
  return 'argument' in args && typeof args.argument === 'object'
}

export function convertToPolicyType(data: any, type?: string): PolicyType {
  if (!data) {
    return
  }

  if (typeof data === 'string') {
    return {
      type: 'staticPolicy',
      name: data
    } as StaticPolicy
  }

  if ('args' in data && Array.isArray(data.args)) {
    return {
      type: 'parameterizedPolicy',
      policy: data.policy,
      args: data.args
    } as ParameterizedPolicy
  }

  if (
    isDynamicPolicy(data) &&
    hasPolicyUrlRule(data.args) &&
    hasArguments(data.args)
  ) {
    return {
      type: 'customUrlPolicy',
      name: data.args.policy_name,
      policyUrl: data.args.rules.policy_url,
      arguments: readProperties(data.args.argument)
    } as CustomUrlPolicy
  }

  if (
    isDynamicPolicy(data) &&
    hasRegoRule(data.args) &&
    hasArguments(data.args)
  ) {
    return {
      type: 'customPolicy',
      name: data.args.policy_name,
      rules:
        type === 'edit'
          ? generateRules(data.args.argument, data.args.rules.rego)
          : readRules(data.args.rules.rego),
      arguments: readProperties(data.args.argument)
    } as CustomPolicy
  }

  throw new Error(
    `Type is not convertible to PolicyType: ${JSON.stringify(data)}`
  )
}
