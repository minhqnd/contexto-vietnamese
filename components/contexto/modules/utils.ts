// Function to get color and width based on rank
export const getBarStyle = (rank: number) => {
  let color = ""
  let width = 0

  // Calculate width based on rank - modified linear scale for better visibility
  // Rank 1 = 100%, but create more visible differences for low ranks
  const maxRank = 50000
  const minWidth = 1 // minimum width percentage to ensure visibility

  if (rank === 1) {
    width = 100 // Secret word gets full width
  } else {
    // Modified scale: more spacing between low ranks
    // Use square root to create more distinction for lower ranks
    const normalizedRank = (rank - 1) / (maxRank - 1) // 0 to 1
    const scaledRank = Math.sqrt(normalizedRank) // Apply square root for better low-rank spacing
    width = 95 - (scaledRank * 94) // Scale from 95% down to 1%
    width = Math.max(minWidth, width)
  }

  // Set colors based on rank ranges
  if (rank === 1) {
    color = "bg-emerald-400 dark:bg-emerald-600"
  } else if (rank <= 10) {
    color = "bg-teal-400 dark:bg-teal-500"
  } else if (rank <= 50) {
    color = "bg-teal-300 dark:bg-cyan-500"
  } else if (rank <= 100) {
    color = "bg-teal-200 dark:bg-sky-500"
  } else if (rank <= 300) {
    color = "bg-orange-300 dark:bg-blue-500"
  } else if (rank <= 500) {
    color = "bg-yellow-300 dark:bg-indigo-500"
  } else if (rank <= 1000) {
    color = "bg-yellow-200 dark:bg-violet-500"
  } else if (rank <= 3000) {
    color = "bg-red-400 dark:bg-purple-500"
  } else if (rank <= 5000) {
    color = "bg-red-300 dark:bg-fuchsia-500"
  } else {
    color = "bg-red-200 dark:bg-pink-500"
  }

  return { color, width: Math.round(width) }
}

// Format completion time
export const formatCompletionTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (minutes > 0) {
    return `${minutes}:${remainingSeconds}`
  } else {
    return `${remainingSeconds} giây`
  }
}