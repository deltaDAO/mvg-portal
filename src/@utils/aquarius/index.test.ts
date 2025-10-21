import { generateBaseQuery, getWhitelistShould } from '.'
import {
  SortDirectionOptions,
  SortTermOptions
} from '../../@types/aquarius/SearchQuery'

const defaultBaseQueryReturn: SearchQuery = {
  from: 0,
  query: {
    bool: {
      filter: [
        { terms: { chainId: [1, 3] } },
        { terms: { _index: ['v510', 'v510'] } }, // v510 is double because two chains are selected
        { term: { 'purgatory.state': false } },
        {
          bool: {
            must_not: [
              { term: { 'nft.state': 5 } },
              { term: { 'price.type': 'pool' } }
            ]
          }
        },
        {
          terms: { 'metadata.tags.keyword': ['agrospai', 'udl', 'agrifoodtef'] }
        }
      ]
    }
  },
  size: 1000
}

// add whitelist filtering
if (getWhitelistShould()?.length > 0) {
  const whitelistQuery = {
    bool: {
      should: [...getWhitelistShould()],
      minimum_should_match: 1
    }
  }
  Object.hasOwn(defaultBaseQueryReturn.query.bool, 'must')
    ? defaultBaseQueryReturn.query.bool.must.push(whitelistQuery)
    : (defaultBaseQueryReturn.query.bool.must = [whitelistQuery])
}
describe('@utils/aquarius', () => {
  test('generateBaseQuery', () => {
    const result = generateBaseQuery({ chainIds: [1, 3] })
    expect(result.from).toBe(0)
    expect(result.size).toBe(1000)
    expect(result.query.bool.filter).toEqual(
      expect.arrayContaining(defaultBaseQueryReturn.query.bool.filter)
    )
  })

  test('generateBaseQuery aggs are passed through', () => {
    const aggsResult = generateBaseQuery({
      chainIds: [1, 3],
      aggs: 'hello world'
    })
    expect(aggsResult.aggs).toBe('hello world')
    expect(aggsResult.query.bool.filter).toEqual(
      expect.arrayContaining(defaultBaseQueryReturn.query.bool.filter)
    )
  })

  test('generateBaseQuery sortOptions are passed through', () => {
    const sortResult = generateBaseQuery({
      chainIds: [1, 3],
      sortOptions: {
        sortBy: SortTermOptions.Created,
        sortDirection: SortDirectionOptions.Ascending
      }
    })
    expect(sortResult.sort).toEqual({ 'nft.created': 'asc' })
    expect(sortResult.query.bool.filter).toEqual(
      expect.arrayContaining(defaultBaseQueryReturn.query.bool.filter)
    )
  })
})
