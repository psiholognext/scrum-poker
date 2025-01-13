// Utility functions for calculating poker statistics
export function calculateStatistics(votes: (string | null | undefined)[]) {
  // Filter out null/undefined votes and convert to numbers (except '?' values)
  const numericVotes = votes
    .filter((v): v is string => v !== null && v !== undefined)
    .filter(v => v !== '?')
    .map(v => v === '½' ? 0.5 : parseFloat(v))

  // Calculate mode (most common value)
  const voteCount = votes
    .filter((v): v is string => v !== null && v !== undefined)
    .reduce((acc, curr) => {
      acc[curr] = (acc[curr] || 0) + 1
      return acc
    }, {} as Record<string, number>)

  const mode = Object.entries(voteCount)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || null

  // Calculate average (excluding '?' values)
  const average = numericVotes.length
    ? (numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length).toFixed(1)
    : null

  return {
    mode,
    average,
    distribution: voteCount
  }
}

