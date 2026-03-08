import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZE, BORDER, SHADOW } from '../../src/constants';
import { BrutalCard, BrutalButton, BrutalInput } from '../../src/components/ui';
import { useAuthStore } from '../../src/stores';
import { useForm } from '../../src/hooks';
import { profileSchema, changePasswordSchema, type ProfileInput, type ChangePasswordInput } from '../../src/utils';
import { authService } from '../../src/services';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, updateProfile, logout } = useAuthStore();
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const profileForm = useForm<typeof profileSchema>({
    schema: profileSchema,
    initialValues: {
      name: user?.name ?? '',
      currency: user?.currency ?? 'VND',
    },
    onSubmit: async (values: ProfileInput) => {
      await updateProfile(values);
      Alert.alert('Thành công', 'Hồ sơ đã được cập nhật');
    },
  });

  const passwordForm = useForm<typeof changePasswordSchema>({
    schema: changePasswordSchema,
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
    onSubmit: async (values: ChangePasswordInput) => {
      await authService.changePassword(values.currentPassword, values.newPassword);
      Alert.alert('Thành công', 'Mật khẩu đã được thay đổi');
      passwordForm.reset();
      setShowPasswordForm(false);
    },
  });

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* User Info */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      {/* Profile Form */}
      <BrutalCard title="Thông tin cá nhân" style={styles.section}>
        <BrutalInput
          label="Họ tên"
          value={profileForm.values.name}
          onChangeText={(v) => profileForm.setValue('name', v)}
          error={profileForm.errors.name}
        />
        <BrutalInput
          label="Loại tiền tệ"
          value={profileForm.values.currency}
          onChangeText={(v) => profileForm.setValue('currency', v.toUpperCase())}
          error={profileForm.errors.currency}
          maxLength={3}
          autoCapitalize="characters"
          placeholder="VND"
        />
        {profileForm.submitError && (
          <Text style={styles.errorText}>⚠️ {profileForm.submitError}</Text>
        )}
        <BrutalButton
          title="Lưu thay đổi"
          onPress={profileForm.handleSubmit}
          loading={profileForm.isSubmitting}
          fullWidth
        />
      </BrutalCard>

      {/* Password Section */}
      <BrutalCard title="Bảo mật" style={styles.section}>
        {showPasswordForm ? (
          <>
            <BrutalInput
              label="Mật khẩu hiện tại"
              value={passwordForm.values.currentPassword}
              onChangeText={(v) => passwordForm.setValue('currentPassword', v)}
              error={passwordForm.errors.currentPassword}
              secureTextEntry
            />
            <BrutalInput
              label="Mật khẩu mới"
              value={passwordForm.values.newPassword}
              onChangeText={(v) => passwordForm.setValue('newPassword', v)}
              error={passwordForm.errors.newPassword}
              secureTextEntry
            />
            <BrutalInput
              label="Xác nhận mật khẩu mới"
              value={passwordForm.values.confirmNewPassword}
              onChangeText={(v) => passwordForm.setValue('confirmNewPassword', v)}
              error={passwordForm.errors.confirmNewPassword}
              secureTextEntry
            />
            {passwordForm.submitError && (
              <Text style={styles.errorText}>⚠️ {passwordForm.submitError}</Text>
            )}
            <View style={styles.passwordActions}>
              <BrutalButton
                title="Lưu mật khẩu"
                onPress={passwordForm.handleSubmit}
                loading={passwordForm.isSubmitting}
              />
              <BrutalButton
                title="Hủy"
                onPress={() => {
                  setShowPasswordForm(false);
                  passwordForm.reset();
                }}
                variant="outline"
              />
            </View>
          </>
        ) : (
          <BrutalButton
            title="Đổi mật khẩu"
            onPress={() => setShowPasswordForm(true)}
            variant="outline"
            fullWidth
          />
        )}
      </BrutalCard>

      {/* App Info */}
      <BrutalCard title="Thông tin ứng dụng" style={styles.section}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Phiên bản</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Tài khoản từ</Text>
          <Text style={styles.infoValue}>
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '—'}
          </Text>
        </View>
      </BrutalCard>

      {/* Logout */}
      <BrutalButton
        title="Đăng xuất"
        onPress={handleLogout}
        variant="danger"
        fullWidth
        size="lg"
        style={styles.logoutButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: BORDER.radiusFull,
    backgroundColor: COLORS.primary,
    borderWidth: BORDER.widthThick,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    ...SHADOW.brutal,
  },
  avatarText: {
    fontSize: FONT_SIZE.display,
    fontWeight: '900',
    color: COLORS.textOnPrimary,
  },
  userName: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    color: COLORS.text,
  },
  userEmail: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  passwordActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceAlt,
  },
  infoLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  logoutButton: {
    marginTop: SPACING.md,
  },
});
