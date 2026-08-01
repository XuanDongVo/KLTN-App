import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/Theme';

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Theme.colors.background },
  content: { padding: 18, paddingBottom: 45, maxWidth: 680, width: '100%', alignSelf: 'center' },
  profileHeader: { alignItems: 'center', paddingVertical: 18 },
  avatar: { width: 104, height: 104, borderRadius: 52, backgroundColor: '#EAF7FE', borderWidth: 4, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', ...Theme.shadow },
  name: { color: Theme.colors.ink, fontSize: 24, fontWeight: '900', marginTop: 14 },
  level: { color: Theme.colors.blueDark, fontWeight: '800', marginTop: 3 },
  levelTrack: { width: '75%', maxWidth: 330, height: 10, borderRadius: 5, backgroundColor: '#DFE7EB', overflow: 'hidden', marginTop: 13 },
  levelFill: { height: '100%', backgroundColor: Theme.colors.blue },
  levelCaption: { color: Theme.colors.muted, fontSize: 11, fontWeight: '700', marginTop: 4 },
  sectionTitle: { color: Theme.colors.ink, fontSize: 17, fontWeight: '900', marginTop: 20, marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  stat: { width: '48%', flexGrow: 1, minHeight: 112, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 8, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  statValue: { color: Theme.colors.ink, fontSize: 18, fontWeight: '900', marginTop: 5 },
  statLabel: { color: Theme.colors.muted, fontSize: 11, fontWeight: '700', marginTop: 2 },
  mission: { minHeight: 88, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#DED8FA', borderBottomWidth: 3, borderRadius: 8, backgroundColor: '#F7F5FF', padding: 12 },
  missionIcon: { width: 52, height: 52, borderRadius: 8, backgroundColor: '#EAE6FF', alignItems: 'center', justifyContent: 'center' },
  missionCopy: { flex: 1 },
  missionTitle: { color: Theme.colors.ink, fontWeight: '900', fontSize: 16 },
  missionText: { color: Theme.colors.muted, fontSize: 12, marginTop: 3 },
});
