import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ActionButton } from "@/components/ui/ActionButton";
import { Theme } from "@/constants/Theme";
import { registerApi } from "@/services/authService";

export default function RegisterScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const register = async () => {
    if (!username.trim() || !email.trim() || password.length < 6)
      return setError("Nhập đầy đủ thông tin; mật khẩu cần ít nhất 6 ký tự.");
    setLoading(true);
    setError("");
    try {
      const response = await registerApi(
        username.trim(),
        email.trim(),
        password,
      );
      if (!response.result)
        throw new Error(response.message || "Không thể tạo tài khoản.");
      Alert.alert(
        "Tạo tài khoản thành công",
        "Bây giờ bạn có thể đăng nhập và đồng bộ tiến độ.",
        [{ text: "Đăng nhập", onPress: () => router.replace("/(auth)/login") }],
      );
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Không thể tạo tài khoản.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Pressable onPress={() => router.back()} style={styles.back}>
        <MaterialCommunityIcons
          name="arrow-left"
          size={25}
          color={Theme.colors.ink}
        />
      </Pressable>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.eyebrow}>BẮT ĐẦU HÀNH TRÌNH</Text>
          <Text style={styles.title}>Tạo tài khoản cho bé</Text>
          <Text style={styles.subtitle}>
            Thông tin chỉ dùng để lưu và đồng bộ tiến độ học.
          </Text>
          <Text style={styles.label}>Tên hiển thị của bé</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            placeholder="Ví dụ: Minh Anh"
            placeholderTextColor="#9AA8B1"
          />
          <Text style={styles.label}>Email phụ huynh</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="parent@email.com"
            placeholderTextColor="#9AA8B1"
          />
          <Text style={styles.label}>Mật khẩu</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Ít nhất 6 ký tự"
            placeholderTextColor="#9AA8B1"
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {loading ? (
            <ActivityIndicator size="large" color={Theme.colors.green} />
          ) : (
            <ActionButton
              label="Tạo tài khoản"
              icon="account-plus"
              onPress={register}
            />
          )}
          <Pressable
            onPress={() => router.replace("/(auth)/login")}
            style={styles.login}
          >
            <Text style={styles.loginText}>Đã có tài khoản? Đăng nhập</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Theme.colors.background },
  back: {
    width: 48,
    height: 48,
    margin: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  form: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    padding: 24,
    justifyContent: "center",
  },
  eyebrow: {
    color: Theme.colors.greenDark,
    fontSize: 11,
    fontWeight: "900",
    textAlign: "center",
  },
  title: {
    color: Theme.colors.ink,
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 5,
  },
  subtitle: {
    color: Theme.colors.muted,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 26,
  },
  label: { color: Theme.colors.ink, fontWeight: "800", marginBottom: 7 },
  input: {
    height: 55,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    color: Theme.colors.ink,
    fontSize: 16,
    marginBottom: 16,
  },
  error: {
    color: Theme.colors.coralDark,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  login: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  loginText: { color: Theme.colors.blueDark, fontWeight: "900" },
});
