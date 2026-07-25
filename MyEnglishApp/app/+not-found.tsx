import { Link, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { styles } from './+not-found.styles';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text style={styles.title}>This screen doesn't exist.</Text>

        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}
