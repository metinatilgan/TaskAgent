import { MaterialIcons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";

import { BottomTabs, Button, Field, IconButton, MaterialIconName, Panel, PriorityBadge, ProgressBar, StatPill, TaskCard, TopBar } from "../components/ui";
import { legalLinks } from "../config/legal";
import { useAuth } from "../context/AuthContext";
import { useTaskAgent } from "../context/TaskContext";
import { AppCopy, getCopy } from "../i18n";
import { palette, shadow } from "../theme";
import { Category, Priority, RouteName, Subtask, Task, TaskDraft, TaskHistoryEntry } from "../types";

const todayIso = () => {
  const value = new Date();
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const dayNumber = () => new Date().getDate().toString().padStart(2, "0");
const readableDate = (value: string | null, copy: AppCopy) => (value ? value.split("-").reverse().join(".") : copy.common.noDate);
const createId = () => Math.random().toString(36).slice(2, 10);

const openLegalLink = async (url: string, copy: AppCopy) => {
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert(copy.legal.linkErrorTitle, copy.legal.linkErrorBody);
  }
};

const showRestorePurchasesNotice = (copy: AppCopy) => {
  Alert.alert(copy.legal.restoreTitle, copy.legal.restoreBody);
};

const showPurchaseSetupNotice = (copy: AppCopy) => {
  Alert.alert(copy.legal.purchaseSetupTitle, copy.legal.purchaseSetupBody);
};

export function RootNavigator() {
  const { user, loading } = useAuth();
  const { profile } = useTaskAgent();
  const copy = getCopy(profile.language);
  const [route, setRoute] = useState<RouteName>("dashboard");
  const [taskEditor, setTaskEditor] = useState<{ mode: "new" } | { mode: "edit"; taskId: string } | null>(null);

  if (loading) {
    return <SplashScreen />;
  }

  if (!user) {
    return <AuthScreen copy={copy} />;
  }

  if (taskEditor) {
    return (
      <TaskEditorScreen
        copy={copy}
        taskId={taskEditor.mode === "edit" ? taskEditor.taskId : null}
        onClose={() => setTaskEditor(null)}
        onCreated={(taskId) => setTaskEditor({ mode: "edit", taskId })}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <TopBar
        title="TaskAgent"
        subtitle={profile.jobTitle || copy.topBar.focusArea}
        right={<IconButton icon="add" label={copy.topBar.newTask} tone="primary" onPress={() => setTaskEditor({ mode: "new" })} />}
      />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {route === "dashboard" ? <DashboardScreen copy={copy} onOpenTask={(taskId) => setTaskEditor({ mode: "edit", taskId })} /> : null}
        {route === "tasks" ? (
          <TasksScreen copy={copy} onOpenTask={(taskId) => setTaskEditor({ mode: "edit", taskId })} onNewTask={() => setTaskEditor({ mode: "new" })} />
        ) : null}
        {route === "history" ? <HistoryScreen copy={copy} /> : null}
        {route === "categories" ? <CategoriesScreen copy={copy} /> : null}
        {route === "premium" ? <PremiumScreen copy={copy} /> : null}
        {route === "settings" ? <SettingsScreen copy={copy} onOpenPremium={() => setRoute("premium")} /> : null}
      </ScrollView>
      <BottomTabs active={route === "premium" ? "settings" : route} labels={copy.tabs} openTabLabel={copy.a11y.openTab} onChange={setRoute} />
    </SafeAreaView>
  );
}

function SplashScreen() {
  return (
    <SafeAreaView style={[styles.safe, styles.centered]}>
      <View style={styles.brandBadge}>
        <Text style={styles.brandBadgeText}>TA</Text>
      </View>
      <ActivityIndicator color={palette.primary} size="large" />
    </SafeAreaView>
  );
}

function AuthScreen({ copy }: { copy: AppCopy }) {
  const { error, isFirebaseReady, sendPasswordReset, signInDemo, signInWithEmail, signUpWithEmail, clearError } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    clearError();
    setAuthMessage(null);
    setSubmitting(true);
    try {
      if (mode === "login") {
        await signInWithEmail(email || "demo@taskagent.app", password || "demo-pass");
      } else {
        await signUpWithEmail(email || "demo@taskagent.app", password || "demo-pass", fullName || "TaskAgent Demo");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resetPassword = async () => {
    clearError();
    setAuthMessage(null);

    if (!email.trim()) {
      setAuthMessage(copy.auth.resetNeedsEmail);
      return;
    }

    setSubmitting(true);
    try {
      await sendPasswordReset(email);
      setAuthMessage(copy.auth.resetSent);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.authWrap}>
        <Panel style={styles.authPanel}>
          <View style={styles.brandBadge}>
            <Text style={styles.brandBadgeText}>TA</Text>
          </View>
          <Text style={styles.authTitle}>{mode === "login" ? copy.auth.loginTitle : copy.auth.signupTitle}</Text>
          <Text style={styles.authSubtitle}>{mode === "login" ? copy.auth.loginSubtitle : copy.auth.signupSubtitle}</Text>

          {!isFirebaseReady ? (
            <View style={styles.notice}>
              <MaterialIcons name="info-outline" size={18} color={palette.primary} />
              <Text style={styles.noticeText}>{copy.auth.firebaseNotice}</Text>
            </View>
          ) : null}

          {mode === "signup" ? <Field label={copy.auth.fullName} value={fullName} onChangeText={setFullName} autoCapitalize="words" /> : null}
          <Field label={copy.auth.email} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <Field label={copy.auth.password} value={password} onChangeText={setPassword} secureTextEntry />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {authMessage ? <Text style={styles.successText}>{authMessage}</Text> : null}

          <Button label={mode === "login" ? copy.auth.loginButton : copy.auth.signupButton} icon="arrow-forward" loading={submitting} onPress={submit} />
          {mode === "login" ? <Button label={copy.auth.forgotPassword} icon="lock-reset" variant="ghost" onPress={resetPassword} /> : null}
          <Button label={copy.auth.demoButton} icon="visibility" variant="secondary" onPress={signInDemo} />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={mode === "login" ? copy.a11y.switchToSignup : copy.a11y.switchToLogin}
            onPress={() => {
              clearError();
              setAuthMessage(null);
              setMode(mode === "login" ? "signup" : "login");
            }}
          >
            <Text style={styles.authLink}>{mode === "login" ? copy.auth.signupLink : copy.auth.loginLink}</Text>
          </Pressable>
        </Panel>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function DashboardScreen({ copy, onOpenTask }: { copy: AppCopy; onOpenTask: (taskId: string) => void }) {
  const { categories, profile, tasks, toggleTask } = useTaskAgent();
  const todayTasks = tasks.filter((task) => task.dueDate === todayIso());
  const completed = tasks.filter((task) => task.isCompleted).length;
  const total = Math.max(tasks.length, 1);
  const progress = Math.round((completed / total) * 100);
  const firstName = profile.fullName.split(" ")[0] || "there";

  return (
    <View style={styles.stack}>
      <View>
        <Text style={styles.eyebrow}>{copy.dashboard.eyebrow}</Text>
        <Text style={styles.heroTitle}>{copy.dashboard.hello(firstName)}</Text>
        <Text style={styles.heroSubtitle}>{copy.dashboard.subtitle}</Text>
      </View>

      <Panel style={styles.heroPanel}>
        <Text style={styles.decorNumber}>{dayNumber()}</Text>
        <View style={styles.heroPanelTop}>
          <View>
            <Text style={styles.panelLabel}>{copy.dashboard.focusFlow}</Text>
            <Text style={styles.progressNumber}>{progress}%</Text>
          </View>
          <View style={styles.progressMedallion}>
            <MaterialIcons name="bolt" size={28} color={palette.primary} />
          </View>
        </View>
        <ProgressBar value={progress} />
        <View style={styles.statRow}>
          <StatPill label={copy.common.completed} value={`${completed}/${tasks.length}`} />
          <StatPill label={copy.dashboard.openTaskLabel} value={`${tasks.filter((task) => !task.isCompleted).length}`} />
        </View>
      </Panel>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{copy.dashboard.todayFocus}</Text>
        <Text style={styles.sectionHint}>{copy.dashboard.taskCount(todayTasks.length)}</Text>
      </View>
      <View style={styles.stackSmall}>
        {todayTasks.slice(0, 4).map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            copy={copy.taskCard}
            labels={{ inbox: copy.common.inbox, priority: copy.priority }}
            openLabel={copy.a11y.openTask}
            toggleLabel={copy.a11y.toggleTask}
            onPress={() => onOpenTask(task.id)}
            onToggle={() => toggleTask(task.id)}
          />
        ))}
        {!todayTasks.length ? <EmptyState title={copy.dashboard.noTodayTitle} body={copy.dashboard.noTodayBody} /> : null}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{copy.dashboard.quickAreas}</Text>
      </View>
      <View style={styles.categoryGrid}>
        {categories.map((category) => (
          <CategoryTile key={category.id} copy={copy} category={category} tasks={tasks} />
        ))}
      </View>
    </View>
  );
}

function TasksScreen({ copy, onOpenTask, onNewTask }: { copy: AppCopy; onOpenTask: (taskId: string) => void; onNewTask: () => void }) {
  const { tasks, toggleTask } = useTaskAgent();
  const [query, setQuery] = useState("");
  const filtered = tasks.filter((task) => task.title.toLocaleLowerCase("tr-TR").includes(query.toLocaleLowerCase("tr-TR")));
  const openTasks = tasks.filter((task) => !task.isCompleted).length;

  return (
    <View style={styles.stack}>
      <View style={styles.rowBetween}>
        <View style={styles.flex}>
          <Text style={styles.eyebrow}>{copy.tasks.eyebrow}</Text>
          <Text style={styles.heroTitle}>{copy.tasks.title}</Text>
        </View>
        <Button label={copy.tasks.newButton} icon="add" style={styles.compactButton} onPress={onNewTask} />
      </View>

      <Panel style={styles.searchPanel}>
        <MaterialIcons name="search" size={22} color={palette.onSurfaceVariant} />
        <TextInput
          accessibilityLabel={copy.a11y.searchTasks}
          placeholder={copy.tasks.searchPlaceholder}
          placeholderTextColor={palette.outline}
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
        />
      </Panel>

      <Panel>
        <Text style={styles.panelLabel}>{copy.tasks.progress}</Text>
        <Text style={styles.momentumText}>{copy.tasks.openRemaining(openTasks)}</Text>
        <ProgressBar value={tasks.length ? ((tasks.length - openTasks) / tasks.length) * 100 : 0} />
      </Panel>

      <View style={styles.stackSmall}>
        {filtered.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            copy={copy.taskCard}
            labels={{ inbox: copy.common.inbox, priority: copy.priority }}
            openLabel={copy.a11y.openTask}
            toggleLabel={copy.a11y.toggleTask}
            onPress={() => onOpenTask(task.id)}
            onToggle={() => toggleTask(task.id)}
          />
        ))}
        {!filtered.length ? <EmptyState title={copy.tasks.noMatchTitle} body={copy.tasks.noMatchBody} /> : null}
      </View>
    </View>
  );
}

type HistoryListItem = TaskHistoryEntry & {
  notes: string;
};

const historyItemsFromTasks = (tasks: Task[], copy: AppCopy): HistoryListItem[] => {
  const today = todayIso();
  const entries = tasks.flatMap<HistoryListItem>((task) =>
    task.completionHistory.map((entry) => ({
      ...entry,
      taskTitle: entry.taskTitle || task.title,
      categoryName: entry.categoryName || task.categoryName,
      notes: entry.repeat === "daily" ? copy.history.dailyNote : copy.history.oneTimeNote
    }))
  );

  tasks.forEach((task) => {
    const date = task.dueDate || today;
    const alreadyListed = entries.some((entry) => entry.taskId === task.id && entry.date === date);
    const shouldShow = task.isCompleted || date < today;

    if (shouldShow && !alreadyListed) {
      entries.push({
        id: `history-visible-${task.id}-${date}`,
        taskId: task.id,
        taskTitle: task.title,
        categoryName: task.categoryName,
        date,
        completed: task.isCompleted,
        completedAt: task.isCompleted ? task.updatedAt : null,
        repeat: task.repeat,
        notes: task.repeat === "daily" ? copy.history.dailyNote : copy.history.oneTimeNote
      });
    }
  });

  return entries.sort((left, right) => {
    const dateCompare = right.date.localeCompare(left.date);
    return dateCompare || left.taskTitle.localeCompare(right.taskTitle, "tr-TR");
  });
};

function HistoryScreen({ copy }: { copy: AppCopy }) {
  const { tasks } = useTaskAgent();
  const historyItems = useMemo(() => historyItemsFromTasks(tasks, copy), [copy, tasks]);
  const completed = historyItems.filter((item) => item.completed).length;
  const missed = historyItems.length - completed;

  return (
    <View style={styles.stack}>
      <View>
        <Text style={styles.eyebrow}>{copy.history.eyebrow}</Text>
        <Text style={styles.heroTitle}>{copy.history.title}</Text>
        <Text style={styles.heroSubtitle}>{copy.history.subtitle}</Text>
      </View>

      <View style={styles.statRow}>
        <StatPill label={copy.history.completedLabel} value={`${completed}`} />
        <StatPill label={copy.history.missedLabel} value={`${missed}`} />
      </View>

      <View style={styles.stackSmall}>
        {historyItems.map((item) => (
          <Panel key={item.id} style={styles.historyRow}>
            <View style={[styles.historyStatus, item.completed ? styles.historyStatusDone : styles.historyStatusMissed]}>
              <MaterialIcons name={item.completed ? "done" : "close"} size={18} color={item.completed ? palette.onPrimary : palette.onErrorContainer} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.historyTitle}>{item.taskTitle}</Text>
              <Text style={styles.historyMeta}>
                {readableDate(item.date, copy)} · {item.categoryName || copy.common.inbox} · {item.notes}
              </Text>
            </View>
            <Text style={[styles.historyBadge, item.completed ? styles.historyBadgeDone : styles.historyBadgeMissed]}>
              {item.completed ? copy.common.completed : copy.common.missed}
            </Text>
          </Panel>
        ))}
        {!historyItems.length ? <EmptyState title={copy.history.emptyTitle} body={copy.history.emptyBody} /> : null}
      </View>
    </View>
  );
}

function CategoriesScreen({ copy }: { copy: AppCopy }) {
  const { addCategory, categories, tasks } = useTaskAgent();
  const [name, setName] = useState("");

  const submit = async () => {
    await addCategory(name);
    setName("");
  };

  return (
    <View style={styles.stack}>
      <View>
        <Text style={styles.eyebrow}>{copy.categories.eyebrow}</Text>
        <Text style={styles.heroTitle}>{copy.categories.title}</Text>
        <Text style={styles.heroSubtitle}>{copy.categories.subtitle}</Text>
      </View>

      <View style={styles.categoryGrid}>
        {categories.map((category) => (
          <CategoryTile key={category.id} copy={copy} category={category} tasks={tasks} />
        ))}
      </View>

      <Panel style={styles.stackSmall}>
        <Text style={styles.sectionTitle}>{copy.categories.addTitle}</Text>
        <Field label={copy.categories.nameLabel} value={name} onChangeText={setName} />
        <Button label={copy.categories.createButton} icon="create-new-folder" onPress={submit} />
      </Panel>
    </View>
  );
}

function PremiumScreen({ copy }: { copy: AppCopy }) {
  const { profile } = useTaskAgent();
  const premiumPlans = [
    {
      key: "monthly",
      ...copy.premium.plans.monthly
    },
    {
      key: "yearly",
      ...copy.premium.plans.yearly
    }
  ] as const;

  return (
    <View style={styles.stack}>
      <View>
        <Text style={styles.eyebrow}>{copy.premium.eyebrow}</Text>
        <Text style={styles.heroTitle}>{copy.premium.heroTitle}</Text>
        <Text style={styles.heroSubtitle}>{copy.premium.subtitle}</Text>
      </View>

      <Panel style={styles.premiumHero}>
        <MaterialIcons name="auto-awesome" size={30} color={palette.onTertiaryContainer} />
        <Text style={styles.sectionTitle}>{copy.premium.choosePlan}</Text>
        <Text style={styles.settingBody}>{copy.premium.summary}</Text>

        <View style={styles.planGrid}>
          {premiumPlans.map((plan) => {
            const selected = profile.isPremium && profile.premiumPlan === plan.key;

            return (
              <Pressable
                key={plan.key}
                accessibilityRole="button"
                accessibilityLabel={copy.a11y.selectPremiumPlan(plan.title)}
                accessibilityState={{ selected }}
                onPress={() => showPurchaseSetupNotice(copy)}
                style={({ pressed }) => [styles.planOption, selected && styles.planOptionActive, pressed && styles.pressed]}
              >
                <View style={styles.flex}>
                  <Text style={styles.planTitle}>{plan.title}</Text>
                  <Text style={styles.planDetail}>{plan.detail}</Text>
                </View>
                <View style={styles.planPriceWrap}>
                  <Text style={styles.premiumPrice}>{plan.price}</Text>
                  <Text style={[styles.planBadge, selected && styles.planBadgeActive]}>{selected ? copy.premium.activeBadge : plan.badge}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </Panel>

      <Panel style={styles.stackSmall}>
        <Text style={styles.sectionTitle}>{copy.premium.disclosureTitle}</Text>
        <Text style={styles.settingBody}>{copy.premium.disclosureBody}</Text>
        <Button label={copy.legal.restorePurchases} icon="restore" variant="ghost" onPress={() => showRestorePurchasesNotice(copy)} />
        <Button label={copy.legal.manageSubscription} icon="settings" variant="ghost" onPress={() => openLegalLink(legalLinks.manageSubscriptions, copy)} />
        <View style={styles.legalLinkRow}>
          <Button label={copy.legal.termsOfUse} icon="article" variant="secondary" style={styles.legalButton} onPress={() => openLegalLink(legalLinks.terms, copy)} />
          <Button label={copy.legal.privacyPolicy} icon="privacy-tip" variant="secondary" style={styles.legalButton} onPress={() => openLegalLink(legalLinks.privacy, copy)} />
        </View>
        <Button label={copy.legal.subscriptionTerms} icon="workspace-premium" variant="secondary" onPress={() => openLegalLink(legalLinks.subscriptionTerms, copy)} />
      </Panel>

      <View style={styles.featureGrid}>
        <FeatureTile icon="all-inclusive" title={copy.premium.features[0].title} body={copy.premium.features[0].body} />
        <FeatureTile icon="cloud-done" title={copy.premium.features[1].title} body={copy.premium.features[1].body} />
        <FeatureTile icon="insights" title={copy.premium.features[2].title} body={copy.premium.features[2].body} />
        <FeatureTile icon="support-agent" title={copy.premium.features[3].title} body={copy.premium.features[3].body} />
      </View>
    </View>
  );
}

function SettingsScreen({ copy, onOpenPremium }: { copy: AppCopy; onOpenPremium: () => void }) {
  const { signOut } = useAuth();
  const { profile, updateProfile, uploadProfileAvatar } = useTaskAgent();
  const [fullName, setFullName] = useState(profile.fullName);
  const [jobTitle, setJobTitle] = useState(profile.jobTitle);

  const pickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      mediaTypes: ["images"],
      quality: 0.82
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      await uploadProfileAvatar({
        uri: asset.uri,
        name: asset.fileName || `avatar-${Date.now()}.jpg`,
        mimeType: asset.mimeType || "image/jpeg",
        size: asset.fileSize
      });
    }
  };

  return (
    <View style={styles.stack}>
      <View style={styles.profileHeader}>
        <Pressable accessibilityRole="button" accessibilityLabel={copy.a11y.editAvatar} onPress={pickAvatar} style={styles.avatarPressable}>
          {profile.avatarUrl ? <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImage} /> : <Text style={styles.avatarText}>{profile.fullName.slice(0, 2).toUpperCase()}</Text>}
          <View style={styles.avatarEditBadge}>
            <MaterialIcons name="edit" size={16} color={palette.onPrimary} />
          </View>
        </Pressable>
        <Text style={styles.heroTitle}>{profile.fullName}</Text>
        <Text style={styles.heroSubtitle}>{profile.email}</Text>
      </View>

      <Panel style={styles.stackSmall}>
        <Field label={copy.settings.fullName} value={fullName} onChangeText={setFullName} />
        <Field label={copy.settings.jobTitle} value={jobTitle} onChangeText={setJobTitle} />
        <Button label={copy.settings.saveProfile} icon="save" onPress={() => updateProfile({ fullName, jobTitle })} />
      </Panel>

      <Panel style={styles.stackSmall}>
        <View style={styles.rowBetween}>
          <View style={styles.flex}>
            <Text style={styles.sectionTitle}>{copy.common.premium}</Text>
            <Text style={styles.settingBody}>
              {profile.isPremium ? copy.settings.premiumActive : copy.settings.premiumInactive}
            </Text>
          </View>
          <MaterialIcons name="workspace-premium" size={26} color={palette.primary} />
        </View>
        <Button label={profile.isPremium ? copy.settings.openPremium : copy.settings.upgradePremium} icon="workspace-premium" onPress={onOpenPremium} />
      </Panel>

      <Panel style={styles.stackSmall}>
        <SettingRow
          title={copy.settings.notifications}
          body={copy.settings.notificationsBody}
          value={profile.pushNotifications}
          onValueChange={(pushNotifications) => updateProfile({ pushNotifications })}
        />
        <SettingRow title={copy.settings.darkMode} body={copy.settings.darkModeBody} value={profile.darkMode} onValueChange={(darkMode) => updateProfile({ darkMode })} />
        <View style={styles.languageRow}>
          <Button label={copy.settings.english} variant={profile.language === "en" ? "primary" : "ghost"} onPress={() => updateProfile({ language: "en" })} />
          <Button label={copy.settings.turkish} variant={profile.language === "tr" ? "primary" : "ghost"} onPress={() => updateProfile({ language: "tr" })} />
        </View>
      </Panel>

      <Panel style={styles.stackSmall}>
        <Text style={styles.sectionTitle}>{copy.legal.title}</Text>
        <Button label={copy.legal.privacyPolicy} icon="privacy-tip" variant="ghost" onPress={() => openLegalLink(legalLinks.privacy, copy)} />
        <Button label={copy.legal.termsOfUse} icon="article" variant="ghost" onPress={() => openLegalLink(legalLinks.terms, copy)} />
        <Button label={copy.legal.subscriptionTerms} icon="workspace-premium" variant="ghost" onPress={() => openLegalLink(legalLinks.subscriptionTerms, copy)} />
        <Button label={copy.legal.support} icon="support-agent" variant="ghost" onPress={() => openLegalLink(legalLinks.support, copy)} />
        <Button label={copy.legal.accountDeletion} icon="delete-forever" variant="danger" onPress={() => openLegalLink(legalLinks.accountDeletion, copy)} />
      </Panel>

      <Button label={copy.settings.logout} icon="logout" variant="danger" onPress={signOut} />
    </View>
  );
}

function TaskEditorScreen({
  copy,
  taskId,
  onClose,
  onCreated
}: {
  copy: AppCopy;
  taskId: string | null;
  onClose: () => void;
  onCreated: (taskId: string) => void;
}) {
  const { addTask, addTaskAttachment, categories, deleteTask, removeTaskAttachment, tasks, updateTask } = useTaskAgent();
  const existing = taskId ? tasks.find((task) => task.id === taskId) : null;
  const [subtaskTitle, setSubtaskTitle] = useState("");
  const [draft, setDraft] = useState<TaskDraft>(() => {
    const fallbackCategory = categories[0];
    return existing
      ? {
          categoryId: existing.categoryId,
          categoryName: existing.categoryName,
          title: existing.title,
          notes: existing.notes,
          priority: existing.priority,
          isCompleted: existing.isCompleted,
          dueDate: existing.dueDate,
          dueTime: existing.dueTime,
          reminderTime: existing.reminderTime,
          repeat: existing.repeat,
          lastDailyRefresh: existing.lastDailyRefresh,
          subtasks: existing.subtasks,
          attachments: existing.attachments,
          completionHistory: existing.completionHistory
        }
      : {
          categoryId: fallbackCategory?.id || null,
          categoryName: fallbackCategory?.name || null,
          title: "",
          notes: "",
          priority: "medium",
          isCompleted: false,
          dueDate: todayIso(),
          dueTime: "09:00",
          reminderTime: null,
          repeat: "none",
          lastDailyRefresh: null,
          subtasks: [],
          attachments: [],
          completionHistory: []
        };
  });

  const save = async () => {
    const selectedCategory = categories.find((category) => category.id === draft.categoryId);
    const payload = {
      ...draft,
      categoryName: selectedCategory?.name || draft.categoryName || null,
      title: draft.title.trim() || copy.editor.untitledTask,
      dueDate: draft.repeat === "daily" ? draft.dueDate || todayIso() : draft.dueDate,
      lastDailyRefresh: draft.repeat === "daily" ? draft.lastDailyRefresh || draft.dueDate || todayIso() : null
    };

    if (existing) {
      await updateTask(existing.id, payload);
      onClose();
    } else {
      const id = await addTask(payload);
      onCreated(id);
    }
  };

  const remove = async () => {
    if (existing) {
      await deleteTask(existing.id);
    }
    onClose();
  };

  const addSubtask = () => {
    const title = subtaskTitle.trim();
    if (!title) {
      return;
    }

    const next: Subtask = {
      id: `subtask-${createId()}`,
      title,
      isCompleted: false,
      sortOrder: draft.subtasks?.length || 0,
      createdAt: new Date().toISOString()
    };
    setDraft((current) => ({ ...current, subtasks: [...(current.subtasks || []), next] }));
    setSubtaskTitle("");
  };

  const pickAttachment = async () => {
    if (!existing) {
      return;
    }

    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      type: "*/*"
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      await addTaskAttachment(existing.id, {
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType,
        size: asset.size
      });
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <TopBar
        title={existing ? copy.editor.editTitle : copy.editor.newTitle}
        subtitle="TaskAgent"
        backLabel={copy.common.back}
        onBack={onClose}
        right={existing ? <IconButton icon="delete-outline" label={copy.a11y.deleteTask} tone="danger" onPress={remove} /> : null}
      />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.editorContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.eyebrow}>{existing ? copy.editor.editEyebrow : copy.editor.draftEyebrow}</Text>
          <Field label={copy.editor.taskName} value={draft.title} onChangeText={(title) => setDraft((current) => ({ ...current, title }))} placeholder={copy.editor.taskPlaceholder} />
          <Field
            label={copy.editor.notes}
            value={draft.notes}
            onChangeText={(notes) => setDraft((current) => ({ ...current, notes }))}
            placeholder={copy.editor.notesPlaceholder}
            multiline
          />

          <Panel style={styles.stackSmall}>
            <Text style={styles.sectionTitle}>{copy.editor.priority}</Text>
            <View style={styles.optionRow}>
              {(["high", "medium", "low"] as Priority[]).map((priority) => (
                <Pressable
                  key={priority}
                  accessibilityRole="button"
                  accessibilityLabel={copy.priority[priority]}
                  onPress={() => setDraft((current) => ({ ...current, priority }))}
                  style={[styles.priorityOption, draft.priority === priority && styles.priorityOptionActive]}
                >
                  <PriorityBadge priority={priority} label={copy.priority[priority]} />
                </Pressable>
              ))}
            </View>
          </Panel>

          <Panel style={styles.stackSmall}>
            <Text style={styles.sectionTitle}>{copy.editor.category}</Text>
            <View style={styles.chipWrap}>
              {categories.map((category) => (
                <Pressable
                  key={category.id}
                  accessibilityRole="button"
                  accessibilityLabel={copy.a11y.selectCategory(category.name)}
                  onPress={() => setDraft((current) => ({ ...current, categoryId: category.id, categoryName: category.name }))}
                  style={[styles.categoryChip, draft.categoryId === category.id && styles.categoryChipActive]}
                >
                  <MaterialIcons name={category.icon as MaterialIconName} size={18} color={draft.categoryId === category.id ? palette.onPrimary : palette.primary} />
                  <Text style={[styles.categoryChipText, draft.categoryId === category.id && styles.categoryChipTextActive]}>{category.name}</Text>
                </Pressable>
              ))}
            </View>
          </Panel>

          <View style={styles.twoColumn}>
            <Field label={copy.editor.date} value={draft.dueDate || ""} onChangeText={(dueDate) => setDraft((current) => ({ ...current, dueDate }))} placeholder="YYYY-MM-DD" />
            <Field label={copy.editor.time} value={draft.dueTime || ""} onChangeText={(dueTime) => setDraft((current) => ({ ...current, dueTime }))} placeholder="09:00" />
          </View>

          <Field
            label={copy.editor.reminder}
            value={draft.reminderTime || ""}
            onChangeText={(reminderTime) => setDraft((current) => ({ ...current, reminderTime: reminderTime || null }))}
            placeholder="08:45"
          />

          <Panel style={styles.stackSmall}>
            <SettingRow
              title={copy.editor.dailyTitle}
              body={copy.editor.dailyBody}
              value={draft.repeat === "daily"}
              onValueChange={(enabled) =>
                setDraft((current) => ({
                  ...current,
                  repeat: enabled ? "daily" : "none",
                  dueDate: current.dueDate || todayIso(),
                  lastDailyRefresh: enabled ? current.lastDailyRefresh || current.dueDate || todayIso() : null
                }))
              }
            />
          </Panel>

          <Panel style={styles.stackSmall}>
            <Text style={styles.sectionTitle}>{copy.editor.subtasks}</Text>
            {(draft.subtasks || []).map((subtask) => (
              <Pressable
                key={subtask.id}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: subtask.isCompleted }}
                onPress={() =>
                  setDraft((current) => ({
                    ...current,
                    subtasks: (current.subtasks || []).map((item) => (item.id === subtask.id ? { ...item, isCompleted: !item.isCompleted } : item))
                  }))
                }
                style={styles.subtaskRow}
              >
                <View style={[styles.subtaskCheck, subtask.isCompleted && styles.subtaskCheckDone]}>
                  {subtask.isCompleted ? <MaterialIcons name="done" size={14} color={palette.onPrimary} /> : null}
                </View>
                <Text style={[styles.subtaskText, subtask.isCompleted && styles.taskTitleDone]}>{subtask.title}</Text>
              </Pressable>
            ))}
            <View style={styles.addSubtaskRow}>
              <TextInput
                accessibilityLabel={copy.editor.newSubtask}
                placeholder={copy.editor.subtaskPlaceholder}
                placeholderTextColor={palette.outline}
                value={subtaskTitle}
                onChangeText={setSubtaskTitle}
                style={styles.addSubtaskInput}
              />
              <IconButton icon="add" label={copy.a11y.addSubtask} tone="primary" onPress={addSubtask} />
            </View>
          </Panel>

          <Panel style={styles.stackSmall}>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitle}>{copy.editor.attachments}</Text>
              <IconButton icon="attach-file" label={copy.common.addAttachment} tone="primary" onPress={pickAttachment} disabled={!existing} />
            </View>
            {existing ? (
              existing.attachments.length ? (
                existing.attachments.map((attachment) => (
                  <View key={attachment.id} style={styles.attachmentRow}>
                    <View style={styles.attachmentPreview}>
                      {attachment.fileType.startsWith("image/") ? (
                        <Image source={{ uri: attachment.fileUrl }} style={styles.attachmentImage} />
                      ) : (
                        <MaterialIcons name="insert-drive-file" size={22} color={palette.primary} />
                      )}
                    </View>
                    <View style={styles.flex}>
                      <Text numberOfLines={1} style={styles.attachmentTitle}>
                        {attachment.fileName}
                      </Text>
                      <Text style={styles.attachmentMeta}>{attachment.fileType}</Text>
                    </View>
                    <IconButton icon="close" label={copy.a11y.removeAttachment(attachment.fileName)} onPress={() => removeTaskAttachment(existing.id, attachment.id)} />
                  </View>
                ))
              ) : (
                <Text style={styles.attachmentEmpty}>{copy.editor.noAttachments}</Text>
              )
            ) : (
              <Text style={styles.attachmentEmpty}>{copy.editor.saveBeforeAttachment}</Text>
            )}
          </Panel>

          <Button label={existing ? copy.editor.saveChanges : copy.editor.addTask} icon="check" onPress={save} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function CategoryTile({ copy, category, tasks }: { copy: AppCopy; category: Category; tasks: Task[] }) {
  const categoryTasks = tasks.filter((task) => task.categoryId === category.id);
  const completed = categoryTasks.filter((task) => task.isCompleted).length;
  const progress = categoryTasks.length ? (completed / categoryTasks.length) * 100 : 0;

  return (
    <Panel style={styles.categoryTile}>
      <MaterialIcons name={category.icon as MaterialIconName} size={24} color={palette.primary} />
      <Text style={styles.categoryTitle}>{category.name}</Text>
      <Text style={styles.categoryMeta}>{copy.categories.activeTaskCount(category.taskCount)}</Text>
      <ProgressBar value={progress} />
    </Panel>
  );
}

function FeatureTile({ icon, title, body }: { icon: MaterialIconName; title: string; body: string }) {
  return (
    <Panel style={styles.featureTile}>
      <MaterialIcons name={icon} size={24} color={palette.primary} />
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureBody}>{body}</Text>
    </Panel>
  );
}

function SettingRow({ title, body, value, onValueChange }: { title: string; body: string; value: boolean; onValueChange: (value: boolean) => void }) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.flex}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingBody}>{body}</Text>
      </View>
      <Switch
        accessibilityLabel={title}
        value={value}
        onValueChange={onValueChange}
        thumbColor={value ? palette.primary : palette.surfaceContainerLowest}
        trackColor={{ false: palette.surfaceContainerHighest, true: palette.primaryContainer }}
      />
    </View>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <Panel style={styles.emptyState}>
      <MaterialIcons name="inbox" size={28} color={palette.primary} />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
    </Panel>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: palette.background,
    flex: 1
  },
  flex: {
    flex: 1
  },
  centered: {
    alignItems: "center",
    gap: 18,
    justifyContent: "center"
  },
  pressed: {
    opacity: 0.72
  },
  scrollContent: {
    paddingBottom: 112,
    paddingHorizontal: 20
  },
  editorContent: {
    gap: 18,
    paddingBottom: 40,
    paddingHorizontal: 20
  },
  authWrap: {
    flex: 1,
    justifyContent: "center",
    padding: 20
  },
  authPanel: {
    gap: 16
  },
  brandBadge: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: palette.primary,
    borderRadius: 24,
    height: 64,
    justifyContent: "center",
    width: 64,
    ...shadow
  },
  brandBadgeText: {
    color: palette.onPrimary,
    fontSize: 20,
    fontWeight: "900"
  },
  authTitle: {
    color: palette.onSurface,
    fontSize: 42,
    fontWeight: "300",
    letterSpacing: 0,
    lineHeight: 48,
    textAlign: "center"
  },
  authSubtitle: {
    color: palette.onSurfaceVariant,
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 23,
    textAlign: "center"
  },
  authLink: {
    color: palette.primary,
    fontSize: 14,
    fontWeight: "900",
    paddingVertical: 8,
    textAlign: "center"
  },
  notice: {
    alignItems: "flex-start",
    backgroundColor: palette.primaryContainer,
    borderRadius: 18,
    flexDirection: "row",
    gap: 8,
    padding: 12
  },
  noticeText: {
    color: palette.onPrimaryContainer,
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17
  },
  errorText: {
    color: palette.error,
    fontSize: 13,
    fontWeight: "800"
  },
  successText: {
    color: palette.primary,
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18
  },
  stack: {
    gap: 20
  },
  stackSmall: {
    gap: 12
  },
  eyebrow: {
    color: palette.primary,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0,
    marginBottom: 8,
    textTransform: "uppercase"
  },
  heroTitle: {
    color: palette.onSurface,
    fontSize: 38,
    fontWeight: "300",
    letterSpacing: 0,
    lineHeight: 44
  },
  heroSubtitle: {
    color: palette.onSurfaceVariant,
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 24,
    marginTop: 8
  },
  heroPanel: {
    gap: 18,
    overflow: "hidden"
  },
  heroPanelTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  decorNumber: {
    color: palette.primary,
    fontSize: 120,
    fontWeight: "900",
    opacity: 0.06,
    position: "absolute",
    right: 14,
    top: -28
  },
  panelLabel: {
    color: palette.onSurfaceVariant,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  progressNumber: {
    color: palette.onSurface,
    fontSize: 48,
    fontWeight: "300",
    letterSpacing: 0,
    marginTop: 6
  },
  progressMedallion: {
    alignItems: "center",
    backgroundColor: palette.primaryContainer,
    borderRadius: 24,
    height: 58,
    justifyContent: "center",
    width: 58
  },
  statRow: {
    flexDirection: "row",
    gap: 10
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  sectionTitle: {
    color: palette.onSurface,
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 0
  },
  sectionHint: {
    color: palette.onSurfaceVariant,
    fontSize: 13,
    fontWeight: "800"
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  categoryTile: {
    gap: 10,
    minHeight: 158,
    width: "48%"
  },
  categoryTitle: {
    color: palette.onSurface,
    fontSize: 17,
    fontWeight: "900"
  },
  categoryMeta: {
    color: palette.onSurfaceVariant,
    fontSize: 12,
    fontWeight: "800"
  },
  rowBetween: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
    justifyContent: "space-between"
  },
  compactButton: {
    minHeight: 46,
    paddingHorizontal: 14
  },
  searchPanel: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    padding: 14
  },
  searchInput: {
    color: palette.onSurface,
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    minHeight: 34
  },
  momentumText: {
    color: palette.onSurface,
    fontSize: 23,
    fontWeight: "300",
    lineHeight: 30,
    marginBottom: 14,
    marginTop: 8
  },
  premiumHero: {
    backgroundColor: palette.tertiaryContainer,
    gap: 12
  },
  planGrid: {
    gap: 10
  },
  planOption: {
    alignItems: "center",
    backgroundColor: palette.surfaceContainerLowest,
    borderColor: palette.outlineVariant,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 12,
    minHeight: 92,
    padding: 14
  },
  planOptionActive: {
    borderColor: palette.onTertiaryContainer,
    borderWidth: 1.5
  },
  planTitle: {
    color: palette.onSurface,
    fontSize: 18,
    fontWeight: "900"
  },
  planDetail: {
    color: palette.onSurfaceVariant,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17,
    marginTop: 4
  },
  planPriceWrap: {
    alignItems: "flex-end",
    gap: 6
  },
  premiumPrice: {
    color: palette.onTertiaryContainer,
    fontSize: 28,
    fontWeight: "900"
  },
  planBadge: {
    backgroundColor: palette.surfaceContainerLow,
    borderRadius: 999,
    color: palette.onSurfaceVariant,
    fontSize: 10,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 5
  },
  planBadgeActive: {
    backgroundColor: palette.tertiaryContainer,
    color: palette.onTertiaryContainer
  },
  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  featureTile: {
    gap: 9,
    minHeight: 166,
    width: "48%"
  },
  featureTitle: {
    color: palette.onSurface,
    fontSize: 16,
    fontWeight: "900"
  },
  featureBody: {
    color: palette.onSurfaceVariant,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19
  },
  profileHeader: {
    alignItems: "center",
    gap: 8
  },
  avatarLarge: {
    alignItems: "center",
    backgroundColor: palette.primaryContainer,
    borderRadius: 50,
    height: 100,
    justifyContent: "center",
    width: 100
  },
  avatarPressable: {
    alignItems: "center",
    backgroundColor: palette.primaryContainer,
    borderRadius: 50,
    height: 100,
    justifyContent: "center",
    overflow: "visible",
    width: 100
  },
  avatarImage: {
    borderRadius: 50,
    height: 100,
    width: 100
  },
  avatarEditBadge: {
    alignItems: "center",
    backgroundColor: palette.primary,
    borderRadius: 16,
    bottom: 0,
    height: 32,
    justifyContent: "center",
    position: "absolute",
    right: 0,
    width: 32
  },
  avatarText: {
    color: palette.onPrimaryContainer,
    fontSize: 28,
    fontWeight: "900"
  },
  settingRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 16,
    minHeight: 66
  },
  settingTitle: {
    color: palette.onSurface,
    fontSize: 16,
    fontWeight: "900"
  },
  settingBody: {
    color: palette.onSurfaceVariant,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17,
    marginTop: 2
  },
  languageRow: {
    flexDirection: "row",
    gap: 10
  },
  legalLinkRow: {
    flexDirection: "row",
    gap: 10
  },
  legalButton: {
    flex: 1
  },
  twoColumn: {
    flexDirection: "row",
    gap: 12
  },
  optionRow: {
    flexDirection: "row",
    gap: 8
  },
  priorityOption: {
    borderColor: palette.outlineVariant,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    flex: 1,
    padding: 8
  },
  priorityOptionActive: {
    backgroundColor: palette.surfaceContainerHigh,
    borderColor: palette.primary
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  categoryChip: {
    alignItems: "center",
    backgroundColor: palette.surfaceContainerLow,
    borderRadius: 999,
    flexDirection: "row",
    gap: 7,
    minHeight: 44,
    paddingHorizontal: 12
  },
  categoryChipActive: {
    backgroundColor: palette.primary
  },
  categoryChipText: {
    color: palette.primary,
    fontSize: 13,
    fontWeight: "900"
  },
  categoryChipTextActive: {
    color: palette.onPrimary
  },
  subtaskRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    minHeight: 42
  },
  subtaskCheck: {
    alignItems: "center",
    borderColor: palette.outline,
    borderRadius: 10,
    borderWidth: 1.5,
    height: 22,
    justifyContent: "center",
    width: 22
  },
  subtaskCheckDone: {
    backgroundColor: palette.primary,
    borderColor: palette.primary
  },
  subtaskText: {
    color: palette.onSurface,
    flex: 1,
    fontSize: 15,
    fontWeight: "800"
  },
  addSubtaskRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10
  },
  addSubtaskInput: {
    backgroundColor: palette.surfaceContainerLow,
    borderRadius: 16,
    color: palette.onSurface,
    flex: 1,
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: 14
  },
  attachmentRow: {
    alignItems: "center",
    backgroundColor: palette.surfaceContainerLow,
    borderRadius: 20,
    flexDirection: "row",
    gap: 12,
    minHeight: 66,
    padding: 10
  },
  attachmentPreview: {
    alignItems: "center",
    backgroundColor: palette.surfaceContainerLowest,
    borderRadius: 16,
    height: 46,
    justifyContent: "center",
    overflow: "hidden",
    width: 46
  },
  attachmentImage: {
    height: 46,
    width: 46
  },
  attachmentTitle: {
    color: palette.onSurface,
    fontSize: 14,
    fontWeight: "900"
  },
  attachmentMeta: {
    color: palette.onSurfaceVariant,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2
  },
  attachmentEmpty: {
    color: palette.onSurfaceVariant,
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 19
  },
  historyRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    padding: 14
  },
  historyStatus: {
    alignItems: "center",
    borderRadius: 15,
    height: 30,
    justifyContent: "center",
    width: 30
  },
  historyStatusDone: {
    backgroundColor: palette.primary
  },
  historyStatusMissed: {
    backgroundColor: palette.errorContainer
  },
  historyTitle: {
    color: palette.onSurface,
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 20
  },
  historyMeta: {
    color: palette.onSurfaceVariant,
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 16,
    marginTop: 3
  },
  historyBadge: {
    borderRadius: 999,
    fontSize: 11,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 6
  },
  historyBadgeDone: {
    backgroundColor: palette.primaryContainer,
    color: palette.onPrimaryContainer
  },
  historyBadgeMissed: {
    backgroundColor: palette.errorContainer,
    color: palette.onErrorContainer
  },
  taskTitleDone: {
    color: palette.onSurfaceVariant,
    textDecorationLine: "line-through"
  },
  emptyState: {
    alignItems: "center",
    gap: 8
  },
  emptyTitle: {
    color: palette.onSurface,
    fontSize: 17,
    fontWeight: "900",
    textAlign: "center"
  },
  emptyBody: {
    color: palette.onSurfaceVariant,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
    textAlign: "center"
  }
});
