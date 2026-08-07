import { StyleSheet, View } from 'react-native';

import { ShinyButton } from '@/components/shiny-button';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <ShinyButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#02040c',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
