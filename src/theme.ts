export const palette = {
  surfaceTint: "#3f618c",
  inverseSurface: "#0b0f11",
  inversePrimary: "#aacbfd",
  primary: "#3f618c",
  primaryDim: "#32557f",
  primaryContainer: "#aacbfd",
  primaryFixed: "#aacbfd",
  primaryFixedDim: "#9cbeee",
  onPrimary: "#f8f8ff",
  onPrimaryContainer: "#1f436d",
  onPrimaryFixed: "#022f58",
  onPrimaryFixedVariant: "#2a4c76",
  secondary: "#4b626e",
  secondaryDim: "#3f5661",
  secondaryContainer: "#cde6f4",
  secondaryFixed: "#cde6f4",
  secondaryFixedDim: "#bfd8e5",
  onSecondary: "#f2faff",
  onSecondaryContainer: "#3e5560",
  onSecondaryFixed: "#2b424d",
  onSecondaryFixedVariant: "#475f6a",
  tertiary: "#5c6400",
  tertiaryDim: "#505800",
  tertiaryContainer: "#e4f265",
  tertiaryFixed: "#e4f265",
  tertiaryFixedDim: "#d6e359",
  onTertiary: "#f8ffae",
  onTertiaryContainer: "#525a00",
  onTertiaryFixed: "#414700",
  onTertiaryFixedVariant: "#5c6400",
  error: "#a83836",
  errorDim: "#67040d",
  errorContainer: "#fa746f",
  onError: "#fff7f6",
  onErrorContainer: "#6e0a12",
  surface: "#f7f9fc",
  surfaceBright: "#f7f9fc",
  surfaceDim: "#d4dbe1",
  surfaceVariant: "#dce3e9",
  surfaceContainer: "#e9eef3",
  surfaceContainerLow: "#f0f4f8",
  surfaceContainerHigh: "#e3e9ee",
  surfaceContainerHighest: "#dce3e9",
  surfaceContainerLowest: "#ffffff",
  onSurface: "#2c3338",
  onSurfaceVariant: "#596065",
  onBackground: "#2c3338",
  background: "#f7f9fc",
  outline: "#747c81",
  outlineVariant: "#abb3b9",
  inverseOnSurface: "#9a9da0",
  white: "#ffffff"
} as const;

export const priorityTokens = {
  high: {
    label: "High",
    background: palette.errorContainer,
    foreground: palette.onErrorContainer
  },
  medium: {
    label: "Medium",
    background: palette.secondaryContainer,
    foreground: palette.onSecondaryContainer
  },
  low: {
    label: "Low",
    background: palette.surfaceVariant,
    foreground: palette.onSurfaceVariant
  }
} as const;

export const shadow = {
  shadowColor: "#1f436d",
  shadowOffset: { width: 0, height: 18 },
  shadowOpacity: 0.08,
  shadowRadius: 28,
  elevation: 5
} as const;
