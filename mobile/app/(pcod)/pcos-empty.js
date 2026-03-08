import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Droplets, ArrowRight, Bluetooth } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../styles/theme';
import PcosBottomNav from '../../components/PcosBottomNav';

const SOS_GUIDES = {
	sugar: {
		title: 'Sugar Craving SOS',
		intro: 'Cravings happen. Let\'s manage them in a healthy way.',
		purpose: 'Provide immediate guidance so cravings do not turn into harmful choices.',
		points: [
			'Healthy alternatives:',
			'Small bowl of fruit (apple, berries, papaya)',
			'Dark chocolate (70%) in a small portion',
			'Greek yogurt with nuts',
			'Dates with almonds',
			'Banana with peanut butter',
			'Quick distraction techniques:',
			'Drink a glass of water',
			'Take 5 deep breaths',
			'Go for a 5 minute walk',
			'Eat a handful of nuts and wait 10 minutes',
		],
	},
	stress: {
		title: 'Stress SOS',
		intro: 'Take a moment. Your health matters.',
		purpose: 'Reduce stress spikes that can influence hormonal balance.',
		points: [
			'1 minute breathing guide:',
			'Inhale for 4 seconds',
			'Hold for 4 seconds',
			'Exhale for 6 seconds',
			'Repeat for 1 minute',
			'Quick relaxation suggestions:',
			'Listen to calming music',
			'Stretch your shoulders',
			'Take a short walk',
			'Drink warm herbal tea',
			'Write down what you feel',
			'Support message: Stress can influence hormonal balance. Small moments of relaxation can help your body restore balance.',
		],
	},
	cramps: {
		title: 'Severe Cramps SOS',
		intro: 'You are not alone. Let\'s ease the pain safely.',
		purpose: 'Give quick relief actions for intense cramps.',
		points: [
			'Use a heating pad on lower abdomen',
			'Do gentle stretching for 5 to 10 minutes',
			'Hydrate with warm water',
			'Take rest and avoid intense activity',
		],
	},
};

export default function PCOSEmptyScreen() {
	const { currentUser } = useAuth();
	const router = useRouter();
	const [sosVisible, setSosVisible] = useState(false);
	const [selectedSos, setSelectedSos] = useState(null);

	useEffect(() => {
		let active = true;

		const enforcePcosRoute = async () => {
			if (!currentUser?.uid) return;
			const careType = await AsyncStorage.getItem(`careType:${currentUser.uid}`);
			if (!active) return;

			if (careType === 'period') {
				router.replace('/period-dashboard');
				return;
			}

			if (careType !== 'pcos') {
				router.replace('/care-type');
			}
		};

		enforcePcosRoute().catch((error) => {
			console.error('Failed to enforce PCOS empty route', error);
		});

		return () => {
			active = false;
		};
	}, [currentUser?.uid, router]);

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.screenBody}>
				<ScrollView contentContainerStyle={styles.content}>
					<View style={styles.headerRow}>
						<Text style={styles.title}>PCOS Home</Text>
						<TouchableOpacity
							style={styles.bluetoothButton}
							onPress={() => router.push('/pcos-wearable-devices')}
							activeOpacity={0.85}
						>
							<Bluetooth size={18} color={theme.colors.primary} />
						</TouchableOpacity>
					</View>
					<Text style={styles.subtitle}>You’re taking the first step toward better health — we’re right here with you.</Text>

					<View style={styles.card}>
						<Text style={styles.cardTitle}>Focus</Text>
						<Text style={styles.cardText}>Balanced hormones and blood sugar control.</Text>
					</View>

					<View style={styles.card}>
						<Text style={styles.cardTitle}>Foods to include</Text>
						<Text style={styles.cardText}>• Whole grains (brown rice, oats, millets)</Text>
						<Text style={styles.cardText}>• Green leafy vegetables (spinach, broccoli)</Text>
						<Text style={styles.cardText}>• Protein foods (eggs, lentils, chickpeas)</Text>
						<Text style={styles.cardText}>• Healthy fats (nuts, seeds, avocado)</Text>
						<Text style={styles.cardText}>• Fruits: berries, apples, papaya</Text>
					</View>

					<View style={styles.card}>
						<Text style={styles.cardTitle}>Foods to reduce</Text>
						<Text style={styles.cardText}>• Sugary drinks</Text>
						<Text style={styles.cardText}>• Junk food</Text>
						<Text style={styles.cardText}>• Processed snacks</Text>
						<Text style={styles.cardText}>• Excess caffeine</Text>
					</View>

					<TouchableOpacity style={styles.hydrationCard} onPress={() => router.replace('/pcos-hydration')} activeOpacity={0.9}>
						<View style={styles.hydrationLeft}>
							<View style={styles.hydrationIconWrap}>
								<Droplets size={20} color={theme.colors.primary} />
							</View>
							<View>
								<Text style={styles.hydrationTitle}>Hydration Tracker</Text>
								<Text style={styles.hydrationSub}>Track your daily water intake</Text>
							</View>
						</View>
						<ArrowRight size={20} color={theme.colors.primary} />
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.sosCard}
						activeOpacity={0.9}
						onPress={() => {
							setSelectedSos(null);
							setSosVisible(true);
						}}
					>
						<Text style={styles.sosTitle}>SOS Assistant</Text>
						<Text style={styles.sosSubtitle}>Immediate guidance for sugar cravings, stress, and severe cramps.</Text>
					</TouchableOpacity>
				</ScrollView>
				<PcosBottomNav active="home" />
			</View>

			<Modal
				visible={sosVisible}
				transparent
				animationType="fade"
				onRequestClose={() => {
					setSosVisible(false);
					setSelectedSos(null);
				}}
			>
				<Pressable
					style={styles.sosOverlay}
					onPress={() => {
						setSosVisible(false);
						setSelectedSos(null);
					}}
				>
					<Pressable style={styles.sosModalCard} onPress={() => null}>
						<Text style={styles.sosModalTitle}>SOS Support</Text>

						{!selectedSos ? (
							<View style={styles.sosOptionWrap}>
								<TouchableOpacity style={styles.sosOption} onPress={() => setSelectedSos('sugar')}>
									<Text style={styles.sosOptionTitle}>1) Sugar Craving SOS</Text>
								</TouchableOpacity>
								<TouchableOpacity style={styles.sosOption} onPress={() => setSelectedSos('stress')}>
									<Text style={styles.sosOptionTitle}>2) Stress SOS</Text>
								</TouchableOpacity>
								<TouchableOpacity style={styles.sosOption} onPress={() => setSelectedSos('cramps')}>
									<Text style={styles.sosOptionTitle}>3) Severe Cramps SOS</Text>
								</TouchableOpacity>
							</View>
						) : (
							<ScrollView style={styles.sosGuideWrap} contentContainerStyle={styles.sosGuideContent}>
								<Text style={styles.sosGuideTitle}>{SOS_GUIDES[selectedSos].title}</Text>
								<Text style={styles.sosGuideIntro}>{SOS_GUIDES[selectedSos].intro}</Text>
								<Text style={styles.sosGuidePurpose}>Purpose: {SOS_GUIDES[selectedSos].purpose}</Text>
								{SOS_GUIDES[selectedSos].points.map((point) => (
									<Text key={point} style={styles.sosGuidePoint}>- {point}</Text>
								))}
								<TouchableOpacity style={styles.sosBackBtn} onPress={() => setSelectedSos(null)}>
									<Text style={styles.sosBackText}>Back to options</Text>
								</TouchableOpacity>
							</ScrollView>
						)}

						<TouchableOpacity
							style={styles.sosCloseBtn}
							onPress={() => {
								setSosVisible(false);
								setSelectedSos(null);
							}}
						>
							<Text style={styles.sosCloseText}>Close</Text>
						</TouchableOpacity>
					</Pressable>
				</Pressable>
			</Modal>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: theme.colors.background,
	},
	screenBody: {
		flex: 1,
	},
	content: {
		paddingTop: 20,
		gap: 12,
		paddingHorizontal: 24,
		paddingBottom: 100,
	},
	headerRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	title: {
		fontSize: 28,
		fontWeight: '700',
		color: theme.colors.heading,
	},
	bluetoothButton: {
		width: 36,
		height: 36,
		borderRadius: 18,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
		borderColor: theme.colors.inputBorder,
		backgroundColor: theme.colors.surface,
		...theme.shadows.soft,
	},
	subtitle: {
		marginTop: 2,
		fontSize: 14,
		color: theme.colors.body,
		textAlign: 'center',
	},
	card: {
		backgroundColor: theme.colors.surface,
		borderRadius: 16,
		padding: 14,
		borderWidth: 1,
		borderColor: theme.colors.inputBorder,
		...theme.shadows.soft,
	},
	cardTitle: {
		fontSize: 17,
		fontWeight: '700',
		color: theme.colors.heading,
		marginBottom: 8,
	},
	cardText: {
		fontSize: 13,
		color: theme.colors.body,
		lineHeight: 20,
		marginBottom: 4,
	},
	hydrationCard: {
		backgroundColor: theme.colors.surface,
		borderRadius: 16,
		padding: 14,
		borderWidth: 1,
		borderColor: theme.colors.inputBorder,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		...theme.shadows.soft,
	},
	hydrationLeft: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
	},
	hydrationIconWrap: {
		width: 34,
		height: 34,
		borderRadius: 17,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: theme.colors.accentBlue,
	},
	hydrationTitle: {
		fontSize: 15,
		fontWeight: '700',
		color: theme.colors.heading,
	},
	hydrationSub: {
		fontSize: 12,
		color: theme.colors.body,
		marginTop: 2,
	},
	sosCard: {
		backgroundColor: theme.colors.surface,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: theme.colors.inputBorder,
		paddingHorizontal: 14,
		paddingVertical: 12,
		...theme.shadows.soft,
	},
	sosTitle: {
		fontSize: 16,
		fontWeight: '800',
		color: theme.colors.heading,
	},
	sosSubtitle: {
		marginTop: 4,
		fontSize: 13,
		color: theme.colors.body,
	},
	sosOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.35)',
		alignItems: 'center',
		justifyContent: 'center',
		padding: 20,
	},
	sosModalCard: {
		width: '100%',
		maxWidth: 420,
		maxHeight: '78%',
		borderRadius: 18,
		borderWidth: 1,
		borderColor: theme.colors.inputBorder,
		backgroundColor: theme.colors.surface,
		padding: 16,
		...theme.shadows.soft,
	},
	sosModalTitle: {
		fontSize: 18,
		fontWeight: '800',
		color: theme.colors.heading,
		marginBottom: 12,
	},
	sosOptionWrap: {
		gap: 10,
	},
	sosOption: {
		borderRadius: 12,
		borderWidth: 1,
		borderColor: theme.colors.inputBorder,
		backgroundColor: theme.colors.card,
		paddingVertical: 12,
		paddingHorizontal: 12,
	},
	sosOptionTitle: {
		fontSize: 14,
		fontWeight: '700',
		color: theme.colors.heading,
	},
	sosGuideWrap: {
		maxHeight: 340,
	},
	sosGuideContent: {
		gap: 8,
		paddingBottom: 8,
	},
	sosGuideTitle: {
		fontSize: 15,
		fontWeight: '800',
		color: theme.colors.heading,
		marginBottom: 2,
	},
	sosGuideIntro: {
		fontSize: 13,
		lineHeight: 20,
		color: theme.colors.heading,
		fontWeight: '700',
	},
	sosGuidePurpose: {
		fontSize: 13,
		lineHeight: 20,
		color: theme.colors.body,
	},
	sosGuidePoint: {
		fontSize: 13,
		lineHeight: 20,
		color: theme.colors.body,
	},
	sosBackBtn: {
		marginTop: 10,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: theme.colors.primary,
		paddingVertical: 10,
		alignItems: 'center',
		justifyContent: 'center',
	},
	sosBackText: {
		color: theme.colors.primary,
		fontSize: 13,
		fontWeight: '700',
	},
	sosCloseBtn: {
		marginTop: 12,
		borderRadius: 10,
		backgroundColor: theme.colors.primary,
		paddingVertical: 11,
		alignItems: 'center',
		justifyContent: 'center',
	},
	sosCloseText: {
		color: theme.colors.surface,
		fontSize: 14,
		fontWeight: '700',
	},
});
