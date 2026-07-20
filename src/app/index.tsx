import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { ArtistMarquee } from '@/components/artist-marquee';
import { SpotifyMark } from '@/components/spotify-mark';

const GREEN = '#31B767';

export default function ConnectSpotifyScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 8 }]}>
      <View style={styles.header}>
        <Svg width={22} height={22} viewBox="0 0 24 24">
          <Path d="M20 12H5m6-7-7 7 7 7" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </Svg>
        <Text style={styles.headerTitle}>
          Connection — <Text style={styles.headerStep}>2 of 3</Text>
        </Text>
        <Pressable style={styles.skip}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      <View style={styles.intro}>
        <Text style={styles.title}>Connect Your</Text>
        <View style={styles.titleRow}>
          <SpotifyMark size={30} color={GREEN} />
          <Text style={styles.title}> Spotify</Text>
        </View>
        <Text style={styles.subtitle}>
          Link Spotify to track favorite artists and get concert recommendations tailored to your listening.
        </Text>
      </View>

      <ArtistMarquee />

      <Pressable style={styles.connect}>
        <SpotifyMark size={24} color={GREEN} />
        <Text style={styles.connectText}>Connect Spotify</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 40,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
  },
  headerStep: {
    color: '#7C7C80',
  },
  skip: {
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  skipText: {
    color: '#EBEBF0',
    fontSize: 13,
    fontWeight: '600',
  },
  intro: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.8,
    lineHeight: 40,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtitle: {
    color: '#8E8E93',
    fontSize: 17,
    lineHeight: 24,
    marginTop: 12,
    marginBottom: 4,
  },
  connect: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
  },
  connectText: {
    color: GREEN,
    fontSize: 19,
    fontWeight: '700',
  },
});
