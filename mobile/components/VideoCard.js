import React from 'react';
import { StyleSheet, View } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';

export function VideoCard({ videoSource, autoPlay = true, loop = true }) {
  const player = useVideoPlayer(videoSource, (videoPlayer) => {
    videoPlayer.loop = loop;
    if (autoPlay) {
      videoPlayer.play();
    }
  });

  return (
    <View style={styles.videoCard}>
      <VideoView
        style={styles.videoPlayer}
        player={player}
        contentFit="contain"
        nativeControls
      />
    </View>
  );
}

const styles = StyleSheet.create({
  videoCard: {
    marginTop: 16,
    width: '92%',
    maxWidth: 380,
    height: 320,
    borderRadius: 18,
    backgroundColor: '#1f1f1f',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    alignSelf: 'center',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
  },
});
