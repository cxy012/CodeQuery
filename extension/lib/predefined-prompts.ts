const predefinedPrompts = [
  {
    label: "Explain Code",
    text: "Explain what the selected code does in simple terms under given code context if provided. Assume the audience is a beginner programmer who has just learned the language features and basic syntax."
  },
  {
    label: "Optimize Code",
    text: "Suggest possible optimizations for the selected code under given code context to improve performance or readability. Include any unnecessary operations or possible refactoring ideas."
  },
  {
    label: "Complexity Analysis",
    text: "Explain the time and space complexity of the selected code under given code context. Describe how it scales with input size and any potential performance bottlenecks."
  },
  {
    label: "Refactor Code",
    text: "Provide refactoring suggestions for the selected code under given code context to improve the structure and readability without changing its functionality."
  }
]

export default predefinedPrompts
