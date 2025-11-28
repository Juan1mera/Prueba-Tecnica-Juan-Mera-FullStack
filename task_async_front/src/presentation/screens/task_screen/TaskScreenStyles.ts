import { StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

export const TaskScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex1: {
    flex: 1
  },
  height100: {
    height: 100, 
    textAlignVertical: 'top' 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backText: {
    fontSize: 32,
    color: colors.primary,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  deleteText: {
    color: colors.warning,
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  dateButton: {
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateText: { color: colors.text, fontSize: 15 },
  placeholderText: { color: colors.textSecondary, fontSize: 15 },
  clearReminder: { marginTop: 8 },
  clearText: { color: colors.warning, fontSize: 14, fontWeight: '500' },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
});