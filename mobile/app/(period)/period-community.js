import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    TextInput,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageCircleMore } from 'lucide-react-native';
import {
    addDoc,
    collection,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
} from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { VIDEOS } from '../../constants/videos';
import { theme } from '../../styles/theme';
import PeriodBottomNav from '../../components/PeriodBottomNav';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase/config';
import { handleAsyncError, logger } from '../../utils/errorHandler';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PeriodCommunityScreen() {
    const { t } = useLanguage();
    const { currentUser } = useAuth();
    const router = useRouter();
    const inputRef = useRef(null);
    const [message, setMessage] = useState('');
    const [posts, setPosts] = useState([]);
    const [isSending, setIsSending] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let active = true;
        const enforcePeriodRoute = async () => {
            if (!currentUser?.uid) return;
            const careType = await AsyncStorage.getItem(`careType:${currentUser.uid}`);
            if (!active) return;
            if (careType === 'pcos') {
                router.replace('/pcos-empty');
                return;
            }
            if (careType !== 'period') {
                router.replace('/care-type');
            }
        };
        enforcePeriodRoute().catch((error) => {
            console.error('Failed to enforce period community route', error);
        });
        return () => { active = false; };
    }, [currentUser?.uid, router]);

    useEffect(() => {
        if (!currentUser?.uid) {
            logger.warn('User not authenticated for community posts');
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const postsQuery = query(
                collection(db, 'community_posts'),
                orderBy('createdAt', 'desc')
            );
            const unsubscribe = onSnapshot(
                postsQuery,
                (snapshot) => {
                    try {
                        const nextPosts = snapshot.docs.map((doc) => ({
                            id: doc.id,
                            ...doc.data(),
                        }));
                        setPosts(nextPosts);
                        setIsLoading(false);
                        logger.info('Community posts loaded', { count: nextPosts.length });
                    } catch (error) {
                        logger.error('Error processing community posts', error);
                        setIsLoading(false);
                    }
                },
                (error) => {
                    logger.error('Failed to subscribe to community posts', error);
                    setPosts([]);
                    setIsLoading(false);
                }
            );
            return () => unsubscribe();
        } catch (error) {
            logger.error('Failed to setup community posts listener', error);
            setIsLoading(false);
        }
    }, [currentUser?.uid]);

    const formatTime = (timestamp) => {
        if (!timestamp) return t('justNow');
        const date = typeof timestamp.toDate === 'function'
            ? timestamp.toDate()
            : new Date(timestamp);
        const diffMs = Date.now() - date.getTime();
        if (diffMs < 60 * 1000) return t('justNow');
        if (diffMs < 60 * 60 * 1000) return `${Math.floor(diffMs / (60 * 1000))}m ago`;
        if (diffMs < 24 * 60 * 60 * 1000) return `${Math.floor(diffMs / (60 * 60 * 1000))}h ago`;
        return `${Math.floor(diffMs / (24 * 60 * 60 * 1000))}d ago`;
    };

    const handleSend = async () => {
        const trimmed = message.trim();
        if (!trimmed || isSending) return;
        if (!currentUser?.uid) {
            Alert.alert('Error', 'You must be logged in to post');
            return;
        }
        const displayName = currentUser?.displayName
            || currentUser?.email?.split('@')[0]
            || t('activeUser');
        setIsSending(true);
        try {
            await addDoc(collection(db, 'community_posts'), {
                user: displayName,
                userId: currentUser.uid,
                content: trimmed,
                likes: 0,
                createdAt: serverTimestamp(),
            });
            setMessage('');
            logger.info('Community post sent successfully', { user: displayName });
        } catch (error) {
            logger.error('Failed to send community post', error);
            const { message: errorMsg } = handleAsyncError(error, 'Send community post');
            Alert.alert('Error', errorMsg);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {!currentUser?.uid ? (
                <ScrollView contentContainerStyle={styles.content}>
                    <View>
                        <Text style={styles.title}>{t('pulseCircle')}</Text>
                        <Text style={styles.subtitle}>{t('communitySubtitle')}</Text>
                    </View>
                    <View style={styles.authPromptCard}>
                        <Text style={styles.authPromptIcon}></Text>
                        <Text style={styles.authPromptTitle}>Join Our Community</Text>
                        <Text style={styles.authPromptText}>
                            Sign in to share your wellness journey and connect with others.
                        </Text>
                        <TouchableOpacity
                            style={styles.authPromptButton}
                            onPress={() => router.replace('/login')}
                        >
                            <Text style={styles.authPromptButtonText}>Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            ) : (
                <>
                    <ScrollView contentContainerStyle={styles.content}>
                        <View>
                            <Text style={styles.title}>{t('pulseCircle')}</Text>
                            <Text style={styles.subtitle}>{t('communitySubtitle')}</Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>{t('awarenessHub')}</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.videoRow}>
                                {VIDEOS.map((video) => (
                                    <View key={video.id} style={styles.videoCard}>
                                        <View style={styles.thumbnailWrap}>
                                            <Image source={{ uri: video.thumbnail }} style={styles.thumbnail} resizeMode="cover" />
                                            <Text style={styles.durationBadge}>{video.duration}</Text>
                                        </View>
                                        <View style={styles.videoBody}>
                                            <Text style={styles.videoTitle} numberOfLines={2}>{video.title}</Text>
                                        </View>
                                    </View>
                                ))}
                            </ScrollView>
                        </View>

                        <View style={styles.section}>
                            <View style={styles.feedHeader}>
                                <Text style={styles.sectionTitle}>{t('supportFeed')}</Text>
                                <TouchableOpacity>
                                    <Text style={styles.viewAll}>{t('viewAll')}</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.composeCard}>
                                <Text style={styles.composeTitle}>{t('shareUpdate')}</Text>
                                <View style={styles.composeRow}>
                                    <TextInput
                                        ref={inputRef}
                                        placeholder={t('communityMessagePlaceholder')}
                                        placeholderTextColor={theme.colors.muted}
                                        value={message}
                                        onChangeText={setMessage}
                                        style={styles.composeInput}
                                        multiline
                                    />
                                    <TouchableOpacity
                                        onPress={handleSend}
                                        style={[styles.sendButton, (!message.trim() || isSending) && styles.sendButtonDisabled]}
                                        activeOpacity={0.85}
                                        disabled={!message.trim() || isSending}
                                    >
                                        <Text style={styles.sendButtonText}>{t('sendMessage')}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.feedList}>
                                {isLoading ? (
                                    <View style={styles.loadingContainer}>
                                        <ActivityIndicator size="large" color={theme.colors.primary} />
                                        <Text style={styles.loadingText}>{t('loading')}</Text>
                                    </View>
                                ) : posts.length === 0 ? (
                                    <View style={styles.emptyState}>
                                        <Text style={styles.emptyIcon}></Text>
                                        <Text style={styles.emptyTitle}>{t('noLogsYet')}</Text>
                                        <Text style={styles.emptyText}>Be the first to share your wellness journey!</Text>
                                    </View>
                                ) : (
                                    posts.map((post) => (
                                        <View key={post.id || `${post.user}-${post.content}`} style={styles.postCard}>
                                            <View style={styles.postTop}>
                                                <View style={styles.avatar}><Text></Text></View>
                                                <View>
                                                    <Text style={styles.postUser}>{post.user}</Text>
                                                    <Text style={styles.postTime}>{formatTime(post.createdAt)}</Text>
                                                </View>
                                            </View>
                                            <Text style={styles.postContent}>{post.content}</Text>
                                            <View style={styles.postActions}>
                                                <TouchableOpacity>
                                                    <Text style={styles.actionText}> {post.likes}</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity>
                                                    <Text style={styles.actionText}> {t('reply')}</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    ))
                                )}
                            </View>
                        </View>
                    </ScrollView>

                    {currentUser?.uid && (
                        <TouchableOpacity
                            style={styles.composeButton}
                            activeOpacity={0.85}
                            onPress={() => inputRef.current?.focus()}
                        >
                            <MessageCircleMore size={24} color={theme.colors.surface} />
                        </TouchableOpacity>
                    )}
                </>
            )}
            <PeriodBottomNav active="community" />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    content: { padding: 20, paddingBottom: 120, gap: 24 },
    title: { fontSize: 28, fontWeight: '700', color: theme.colors.heading },
    subtitle: { marginTop: 4, fontSize: 14, color: theme.colors.body },
    section: { gap: 12 },
    sectionTitle: { fontSize: 20, fontWeight: '700', color: theme.colors.heading },
    videoRow: { gap: 12 },
    videoCard: { width: 220, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.inputBorder, backgroundColor: theme.colors.surface, ...theme.shadows.soft },
    thumbnailWrap: { position: 'relative' },
    thumbnail: { width: '100%', height: 120 },
    durationBadge: { position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(46,16,101,0.75)', color: theme.colors.surface, fontSize: 10, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    videoBody: { padding: 12 },
    videoTitle: { fontSize: 13, fontWeight: '700', color: theme.colors.body, lineHeight: 18 },
    feedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    viewAll: { fontSize: 12, fontWeight: '700', textDecorationLine: 'underline', color: theme.colors.primary },
    feedList: { gap: 12 },
    composeCard: { borderRadius: 20, padding: 14, borderWidth: 1, borderColor: theme.colors.inputBorder, backgroundColor: theme.colors.surface, gap: 10, ...theme.shadows.soft },
    composeTitle: { fontSize: 14, fontWeight: '700', color: theme.colors.heading },
    composeRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-end' },
    composeInput: { flex: 1, minHeight: 48, maxHeight: 110, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 14, borderWidth: 1, borderColor: theme.colors.inputBorder, backgroundColor: theme.colors.card, fontSize: 13, color: theme.colors.body },
    sendButton: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: theme.colors.primary },
    sendButtonDisabled: { opacity: 0.6 },
    sendButtonText: { fontSize: 12, color: theme.colors.surface, fontWeight: '700' },
    postCard: { borderRadius: 20, padding: 16, borderWidth: 1, borderColor: theme.colors.inputBorder, backgroundColor: theme.colors.surface, gap: 10, ...theme.shadows.soft },
    postTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    avatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.card },
    postUser: { fontSize: 13, fontWeight: '700', color: theme.colors.heading },
    postTime: { marginTop: 2, fontSize: 10, color: theme.colors.muted },
    postContent: { fontSize: 14, color: theme.colors.body, lineHeight: 20 },
    postActions: { borderTopWidth: 1, borderTopColor: theme.colors.inputBorder, paddingTop: 8, flexDirection: 'row', gap: 20 },
    actionText: { fontSize: 12, color: theme.colors.muted, fontWeight: '700' },
    composeButton: { position: 'absolute', bottom: 96, right: 24, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primary, ...theme.shadows.soft },
    loadingContainer: { paddingVertical: 40, alignItems: 'center', gap: 12 },
    loadingText: { fontSize: 14, color: theme.colors.muted, marginTop: 8 },
    emptyState: { paddingVertical: 60, alignItems: 'center', gap: 12 },
    emptyIcon: { fontSize: 56, marginBottom: 8 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.heading },
    emptyText: { fontSize: 14, color: theme.colors.muted, textAlign: 'center', maxWidth: 280, lineHeight: 20 },
    authPromptCard: { borderRadius: 24, padding: 32, backgroundColor: theme.colors.surface, alignItems: 'center', gap: 16, marginTop: 40, borderWidth: 2, borderColor: theme.colors.secondary, ...theme.shadows.soft },
    authPromptIcon: { fontSize: 64, marginBottom: 8 },
    authPromptTitle: { fontSize: 22, fontWeight: '700', color: theme.colors.heading, textAlign: 'center' },
    authPromptText: { fontSize: 14, color: theme.colors.body, textAlign: 'center', lineHeight: 20 },
    authPromptButton: { backgroundColor: theme.colors.primary, paddingHorizontal: 32, paddingVertical: 12, borderRadius: 12, marginTop: 12 },
    authPromptButtonText: { color: theme.colors.surface, fontSize: 16, fontWeight: '700', textAlign: 'center' },
});
