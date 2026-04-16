import { MaterialIcons } from "@expo/vector-icons";
import React, { PropsWithChildren } from "react";
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle
} from "react-native";

import { palette, priorityTokens, shadow } from "../theme";
import { AppCopy } from "../i18n";
import { Priority, RouteName, Task } from "../types";

export type MaterialIconName = React.ComponentProps<typeof MaterialIcons>["name"];

const routeItems: Array<{ route: RouteName; icon: MaterialIconName }> = [
  { route: "dashboard", icon: "radio-button-checked" },
  { route: "tasks", icon: "checklist" },
  { route: "history", icon: "history" },
  { route: "categories", icon: "folder-open" },
  { route: "settings", icon: "tune" }
];

interface PanelProps extends PropsWithChildren {
  style?: StyleProp<ViewStyle>;
}

export function Panel({ children, style }: PanelProps) {
  return <View style={[styles.panel, style]}>{children}</View>;
}

interface IconButtonProps extends Omit<PressableProps, "style"> {
  icon: MaterialIconName;
  label: string;
  tone?: "plain" | "primary" | "danger";
}

export function IconButton({ icon, label, tone = "plain", ...props }: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      {...props}
      style={({ pressed }) => [styles.iconButton, styles[`iconButton_${tone}`], pressed && styles.pressed]}
    >
      <MaterialIcons name={icon} size={22} color={tone === "primary" ? palette.onPrimary : palette.onSurface} />
    </Pressable>
  );
}

interface ButtonProps extends Omit<PressableProps, "style"> {
  label: string;
  icon?: MaterialIconName;
  loading?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  style?: StyleProp<ViewStyle>;
}

export function Button({ label, icon, loading, variant = "primary", style, disabled, ...props }: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={isDisabled}
      {...props}
      style={({ pressed }) => [styles.button, styles[`button_${variant}`], isDisabled && styles.disabled, pressed && styles.pressed, style]}
    >
      {loading ? <ActivityIndicator color={variant === "primary" ? palette.onPrimary : palette.primary} /> : null}
      {!loading && icon ? (
        <MaterialIcons name={icon} size={20} color={variant === "primary" ? palette.onPrimary : palette.primary} />
      ) : null}
      <Text style={[styles.buttonLabel, variant === "primary" ? styles.buttonLabelPrimary : styles.buttonLabelSecondary]}>{label}</Text>
    </Pressable>
  );
}

interface TopBarProps {
  title: string;
  subtitle?: string;
  backLabel?: string;
  onBack?: () => void;
  right?: React.ReactNode;
}

export function TopBar({ title, subtitle, backLabel = "Back", onBack, right }: TopBarProps) {
  return (
    <View style={styles.topBar}>
      <View style={styles.topBarSide}>
        {onBack ? <IconButton icon="arrow-back" label={backLabel} onPress={onBack} /> : <View style={styles.brandMark} />}
      </View>
      <View style={styles.topBarTitleWrap}>
        <Text style={styles.topBarTitle}>{title}</Text>
        {subtitle ? <Text style={styles.topBarSubtitle}>{subtitle}</Text> : null}
      </View>
      <View style={[styles.topBarSide, styles.topBarRight]}>{right}</View>
    </View>
  );
}

interface BottomTabsProps {
  active: RouteName;
  labels: AppCopy["tabs"];
  openTabLabel: AppCopy["a11y"]["openTab"];
  onChange: (route: RouteName) => void;
}

export function BottomTabs({ active, labels, openTabLabel, onChange }: BottomTabsProps) {
  return (
    <View style={styles.bottomTabs}>
      {routeItems.map((item) => {
        const selected = item.route === active;
        const label = labels[item.route];
        return (
          <Pressable
            key={item.route}
            accessibilityRole="tab"
            accessibilityLabel={openTabLabel(label)}
            accessibilityState={{ selected }}
            onPress={() => onChange(item.route)}
            style={({ pressed }) => [styles.tabItem, selected && styles.tabItemActive, pressed && styles.pressed]}
          >
            <MaterialIcons name={item.icon} size={22} color={selected ? palette.onPrimaryContainer : palette.onSurfaceVariant} />
            <Text style={[styles.tabLabel, selected && styles.tabLabelActive]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

interface FieldProps extends TextInputProps {
  label: string;
}

export function Field({ label, style, ...props }: FieldProps) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholderTextColor={palette.outline}
        {...props}
        style={[styles.fieldInput, props.multiline && styles.fieldInputMultiline, style]}
      />
    </View>
  );
}

export function PriorityBadge({ priority, label }: { priority: Priority; label?: string }) {
  const token = priorityTokens[priority];

  return (
    <View style={[styles.priorityBadge, { backgroundColor: token.background }]}>
      <Text style={[styles.priorityLabel, { color: token.foreground }]}>{label || token.label}</Text>
    </View>
  );
}

interface TaskCardProps {
  task: Task;
  copy?: AppCopy["taskCard"];
  labels: {
    inbox: string;
    priority: Record<Priority, string>;
  };
  openLabel?: AppCopy["a11y"]["openTask"];
  toggleLabel?: AppCopy["a11y"]["toggleTask"];
  onPress: () => void;
  onToggle: () => void;
}

export function TaskCard({ task, copy, labels, openLabel, toggleLabel, onPress, onToggle }: TaskCardProps) {
  const openTaskLabel = openLabel || ((title: string) => `Open ${title} task`);
  const toggleTaskLabel = toggleLabel || ((title: string, completed: boolean) => `Mark ${title} as ${completed ? "not completed" : "completed"}`);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={openTaskLabel(task.title)}
      onPress={onPress}
      style={({ pressed }) => [styles.taskCard, task.isCompleted && styles.taskCardComplete, pressed && styles.pressed]}
    >
      <Pressable
        accessibilityRole="checkbox"
        accessibilityLabel={toggleTaskLabel(task.title, task.isCompleted)}
        accessibilityState={{ checked: task.isCompleted }}
        onPress={onToggle}
        hitSlop={10}
        style={[styles.taskCheck, task.isCompleted && styles.taskCheckDone]}
      >
        {task.isCompleted ? <MaterialIcons name="done" size={18} color={palette.onPrimary} /> : null}
      </Pressable>
      <View style={styles.taskBody}>
        <Text numberOfLines={2} style={[styles.taskTitle, task.isCompleted && styles.taskTitleDone]}>
          {task.title}
        </Text>
        <Text style={styles.taskMeta}>
          {task.categoryName || labels.inbox} {task.dueTime ? `· ${task.dueTime}` : ""} {task.repeat === "daily" ? `· ${copy?.daily || "Every day"}` : ""}
        </Text>
      </View>
      <PriorityBadge priority={task.priority} label={labels.priority[task.priority]} />
    </Pressable>
  );
}

interface StatPillProps {
  label: string;
  value: string;
}

export function StatPill({ label, value }: StatPillProps) {
  return (
    <View style={styles.statPill}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${Math.min(Math.max(value, 0), 100)}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: "rgba(255,255,255,0.82)",
    borderColor: palette.outlineVariant,
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
    ...shadow
  },
  pressed: {
    opacity: 0.72
  },
  disabled: {
    opacity: 0.48
  },
  iconButton: {
    alignItems: "center",
    borderRadius: 16,
    height: 48,
    justifyContent: "center",
    minWidth: 48
  },
  iconButton_plain: {
    backgroundColor: palette.surfaceContainerLow
  },
  iconButton_primary: {
    backgroundColor: palette.primary
  },
  iconButton_danger: {
    backgroundColor: palette.errorContainer
  },
  button: {
    alignItems: "center",
    borderRadius: 18,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: 18
  },
  button_primary: {
    backgroundColor: palette.primary
  },
  button_secondary: {
    backgroundColor: palette.primaryContainer
  },
  button_ghost: {
    backgroundColor: palette.surfaceContainerLow
  },
  button_danger: {
    backgroundColor: palette.errorContainer
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: "800"
  },
  buttonLabelPrimary: {
    color: palette.onPrimary
  },
  buttonLabelSecondary: {
    color: palette.primary
  },
  topBar: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    paddingBottom: 16,
    paddingHorizontal: 20,
    paddingTop: 10
  },
  topBarSide: {
    alignItems: "flex-start",
    minWidth: 54
  },
  topBarRight: {
    alignItems: "flex-end"
  },
  brandMark: {
    backgroundColor: palette.primary,
    borderRadius: 16,
    height: 42,
    width: 42
  },
  topBarTitleWrap: {
    alignItems: "center",
    flex: 1
  },
  topBarTitle: {
    color: palette.onSurface,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0
  },
  topBarSubtitle: {
    color: palette.onSurfaceVariant,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2
  },
  bottomTabs: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderColor: palette.outlineVariant,
    borderRadius: 26,
    borderWidth: StyleSheet.hairlineWidth,
    bottom: 14,
    flexDirection: "row",
    gap: 4,
    left: 14,
    padding: 6,
    position: "absolute",
    right: 14,
    ...shadow
  },
  tabItem: {
    alignItems: "center",
    borderRadius: 20,
    flex: 1,
    gap: 3,
    minHeight: 56,
    justifyContent: "center"
  },
  tabItemActive: {
    backgroundColor: palette.primaryContainer
  },
  tabLabel: {
    color: palette.onSurfaceVariant,
    fontSize: 10,
    fontWeight: "800"
  },
  tabLabelActive: {
    color: palette.onPrimaryContainer
  },
  fieldWrap: {
    gap: 8
  },
  fieldLabel: {
    color: palette.onSurfaceVariant,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  fieldInput: {
    backgroundColor: palette.surfaceContainerLow,
    borderColor: palette.outlineVariant,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    color: palette.onSurface,
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: 16
  },
  fieldInputMultiline: {
    minHeight: 118,
    paddingTop: 14,
    textAlignVertical: "top"
  },
  priorityBadge: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 999,
    minWidth: 70,
    paddingHorizontal: 10,
    paddingVertical: 7
  },
  priorityLabel: {
    fontSize: 11,
    fontWeight: "900"
  },
  taskCard: {
    alignItems: "center",
    backgroundColor: palette.surfaceContainerLowest,
    borderColor: palette.outlineVariant,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 12,
    padding: 14
  },
  taskCardComplete: {
    backgroundColor: palette.surfaceContainer
  },
  taskCheck: {
    alignItems: "center",
    borderColor: palette.outline,
    borderRadius: 13,
    borderWidth: 1.5,
    height: 26,
    justifyContent: "center",
    width: 26
  },
  taskCheckDone: {
    backgroundColor: palette.primary,
    borderColor: palette.primary
  },
  taskBody: {
    flex: 1,
    minWidth: 0
  },
  taskTitle: {
    color: palette.onSurface,
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 20
  },
  taskTitleDone: {
    color: palette.onSurfaceVariant,
    textDecorationLine: "line-through"
  },
  taskMeta: {
    color: palette.onSurfaceVariant,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3
  },
  statPill: {
    backgroundColor: palette.surfaceContainerLow,
    borderRadius: 20,
    flex: 1,
    minHeight: 82,
    padding: 14
  },
  statValue: {
    color: palette.primary,
    fontSize: 24,
    fontWeight: "900"
  },
  statLabel: {
    color: palette.onSurfaceVariant,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 4
  },
  progressTrack: {
    backgroundColor: palette.surfaceContainerHighest,
    borderRadius: 999,
    height: 8,
    overflow: "hidden"
  },
  progressFill: {
    backgroundColor: palette.primary,
    borderRadius: 999,
    height: "100%"
  }
});
