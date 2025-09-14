import React from 'react';
import { WebView } from 'react-native-webview';
import { StyleSheet } from 'react-native';

function HomeScreen() {
  return (
    <WebView 
      style={styles.container}
      source={{ uri: 'http://192.168.100.28:3000' }} 
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default HomeScreen;
