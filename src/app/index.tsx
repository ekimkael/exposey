import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CardStack } from '@/components/card-stack';
import { FloatingLabelField } from '@/components/floating-label-field';
import { HERO_STAGE, ONYX_COLORS, ONYX_COPY } from '@/constants/onyx';
import { useKeyboardShrink } from '@/hooks/use-keyboard-shrink';

const HERO_HEIGHT = HERO_STAGE.height;

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const shrink = useKeyboardShrink();
  const canSubmit = email.length > 0 && password.length > 0;

  return (
    <LinearGradient colors={[ONYX_COLORS.backgroundTop, ONYX_COLORS.backgroundBottom]} style={styles.fill}>
      <SafeAreaView style={styles.fill}>
        <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.content}>
            <Animated.View
              style={[
                styles.hero,
                {
                  height: shrink.interpolate({ inputRange: [0, 1], outputRange: [HERO_HEIGHT, HERO_HEIGHT * 0.42] }),
                },
              ]}>
              <Animated.View
                style={{
                  transformOrigin: 'top',
                  transform: [{ scale: shrink.interpolate({ inputRange: [0, 1], outputRange: [1, 0.45] }) }],
                }}>
                <CardStack />
              </Animated.View>
            </Animated.View>

            <Text style={styles.title}>{ONYX_COPY.title}</Text>
            <Text style={styles.subtitle}>{ONYX_COPY.subtitle}</Text>

            <View style={styles.form}>
              <FloatingLabelField
                label={ONYX_COPY.emailPlaceholder}
                value={email}
                onChangeText={setEmail}
                textContentType="username"
                autoComplete="email"
                keyboardType="email-address"
                returnKeyType="next"
              />
              <FloatingLabelField
                label={ONYX_COPY.passwordPlaceholder}
                value={password}
                onChangeText={setPassword}
                textContentType="password"
                autoComplete="password"
                returnKeyType="done"
                secureTextEntry
              />
            </View>

            <View style={[styles.signInButton, { backgroundColor: canSubmit ? ONYX_COLORS.buttonEnabled : ONYX_COLORS.buttonDisabled }]}>
              <Text style={[styles.signInText, { color: canSubmit ? ONYX_COLORS.buttonTextEnabled : ONYX_COLORS.buttonTextDisabled }]}>
                {ONYX_COPY.signIn}
              </Text>
            </View>
          </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  hero: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: ONYX_COLORS.title,
    textAlign: 'center',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 14,
    color: ONYX_COLORS.subtitle,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 28,
  },
  form: {
    gap: 12,
  },
  signInButton: {
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  signInText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
