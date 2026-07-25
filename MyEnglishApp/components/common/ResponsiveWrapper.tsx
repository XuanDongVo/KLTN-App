import React from 'react';
import { ScrollView, StyleProp, StyleSheet, useWindowDimensions, View, ViewStyle } from 'react-native';
import { styles } from './ResponsiveWrapper.styles';

interface ResponsiveWrapperProps {
  children: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  scrollable?: boolean;
}

export default function ResponsiveWrapper({ 
  children, 
  contentContainerStyle, 
  style,
  scrollable = true 
}: ResponsiveWrapperProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const containerStyle = [
    styles.baseContainer,
    isMobile ? styles.mobilePadding : styles.desktopPadding,
    style
  ];

  if (scrollable) {
    return (
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.scrollContent, 
          !isMobile && { alignItems: 'center' },
          contentContainerStyle
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.innerContent, isMobile ? { width: '100%' } : { maxWidth: 1200 }]}>
          {children}
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={[styles.fixedContent, !isMobile && { alignItems: 'center' }]}>
      <View style={[styles.innerContent, isMobile ? { width: '100%' } : { maxWidth: 1200 }, containerStyle]}>
        {children}
      </View>
    </View>
  );
}
