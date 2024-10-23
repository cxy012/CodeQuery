const languageToExtension: { [key: string]: string[] } = {
  python: [".py"],
  r: [".r", ".R"],
  javascript: [".js", ".mjs", ".jsx"],
  typescript: ["tsx", ".ts"],
  go: [".go"],
  rust: [".rs"],
  java: [".java"],
  ruby: [".rb"],
  php: [".php"],
  ocaml: [".ml"],
  scala: [".scala"],
  objc: [".m"],
  perl: [".pl"],
  shell: [".sh", ".bash"],
  "c++": [".cpp", ".cc"],
  c: [".c"],
  html: [".html"],
  css: [".css"],
  kotlin: [".kt"],
  yaml: [".yaml"],
  sql: [".sql"],
  json: [".json"],
  hack: [".hack"],
  haskell: [".hs"],
  erlang: [".erl"],
  cmake: [".cmake"],
};

export function getExtensionByLanguage(language: string) {
  const lower = language.toLowerCase();
  if (lower in languageToExtension) {
    return languageToExtension[lower];
  }
  return [];
}

export function getFileExtension(filePath: string) {
  // Extract the file name from the path
  const fileName = filePath.split("/").pop();

  if (!fileName) {
    return undefined;
  }

  // Extract the file extension from the file name
  const extension = fileName.includes(".")
    ? "." + fileName.split(".").pop()
    : undefined;

  return extension;
}

export const LANGUAGE_MAP: { [extension: string]: string } = {
  ".js": "javascript",
  ".jsx": "javascript",
  ".ts": "typescript",
  ".tsx": "typescript",
  ".py": "python",
  ".java": "java",
  ".c": "c",
  ".cpp": "cpp",
  ".cc": "cpp",
  ".cxx": "cpp",
  ".h": "cpp", // Header files can be C or C++, Monaco defaults to C++
  ".hpp": "cpp",
  ".cs": "csharp",
  ".cl": "commonlisp",
  ".php": "php",
  ".rb": "ruby",
  ".go": "go",
  ".gomod": "gomod",
  ".rust": "rust",
  ".rs": "rust",
  ".html": "html",
  ".htm": "html",
  ".css": "css",
  ".scss": "scss",
  ".sass": "sass",
  ".less": "less",
  ".json": "json",
  ".jsdoc": "jsdoc",
  ".xml": "xml",
  ".md": "markdown",
  ".sh": "shell",
  ".bash": "shell",
  ".bat": "bat",
  ".cmd": "bat",
  ".sql": "sql",
  ".pl": "perl",
  ".pm": "perl",
  ".r": "r",
  ".swift": "swift",
  ".kt": "kotlin",
  ".kts": "kotlin",
  ".dart": "dart",
  ".lua": "lua",
  ".yaml": "yaml",
  ".yml": "yaml",
  ".ini": "ini",
  ".cfg": "ini",
  ".conf": "ini",
  ".toml": "toml",
  ".properties": "properties",
  ".log": "log",
  ".txt": "plaintext",
  ".mdx": "markdown",
  ".vue": "html", // Vue files can be handled as HTML in Monaco for basic use cases
  ".groovy": "groovy",
  ".gradle": "groovy",
  ".ps1": "powershell",
  ".psm1": "powershell",
  ".zsh": "shell",
  ".fish": "shell",
  ".scala": "scala",
  ".sc": "scala",
  ".ex": "elixir",
  ".exs": "elixir",
  ".erl": "erlang",
  ".hrl": "erlang",
  ".el": "elisp",
  ".m": "objective-c",
  ".mm": "objective-cpp", // Objective-C++
  ".pyc": "python", // Compiled Python files won't display well but are identified as Python
  ".coffee": "coffeescript",
  ".litcoffee": "coffeescript",
  ".coffee.md": "coffeescript",
  ".clj": "clojure",
  ".cljs": "clojure",
  ".cljc": "clojure",
  ".edn": "clojure",
  ".hx": "haxe",
  ".nim": "nim",
  ".nimble": "nim",
  ".pas": "pascal",
  ".pp": "pascal",
  ".lpr": "pascal",
  ".d": "d",
  ".di": "d",
  ".fs": "fsharp",
  ".fsi": "fsharp",
  ".fsx": "fsharp",
  ".fsscript": "fsharp",
  ".vbs": "vb",
  ".vb": "vb",
  ".asm": "asm",
  ".s": "asm",
  ".lisp": "lisp",
  ".lsp": "lisp",
  ".scm": "scheme",
  ".ss": "scheme",
  ".rkt": "racket",
  ".ml": "ocaml",
  ".mli": "ocaml",
  ".sml": "sml",
  ".jl": "julia",
  ".tex": "latex",
  ".sty": "latex",
  ".cls": "latex",
  ".mk": "make",
  ".dockerfile": "dockerfile",
};
