import React, { useCallback, useEffect, useRef, useState } from 'react';
import { 
View,
Text,
StyleSheet,
ScrollView,
TouchableOpacity,
Image,
Animated,
Easing,
PermissionsAndroid,
Platform
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
ArrowLeft,
Settings,
Bluetooth,
RefreshCw,
Heart,
Activity,
MoonStar,
Flame,
Plus,
} from 'lucide-react-native';

import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../styles/theme';
import PcosBottomNav from '../../components/PcosBottomNav';

export default function PcosWearableDevicesScreen() {

const managerRef = useRef(null);
const syncTimerRef = useRef(null);

const { currentUser } = useAuth();
const router = useRouter();

const [device,setDevice] = useState(null);
const [isSyncing,setIsSyncing] = useState(false);
const [hasSynced,setHasSynced] = useState(false);
const [lastSyncedText,setLastSyncedText] = useState('No synced data yet');
const [batteryPercent,setBatteryPercent] = useState(()=>Math.floor(Math.random()*26)+70);

const spinAnim = useRef(new Animated.Value(0)).current;

useEffect(() => {

try {

const { BleManager } = require('react-native-ble-plx');
managerRef.current = new BleManager();

} catch (error) {

console.warn('BLE module unavailable, using mock sync mode.', error);
managerRef.current = null;

}

return () => {

if (syncTimerRef.current) {
clearTimeout(syncTimerRef.current);
}

if (managerRef.current?.destroy) {
managerRef.current.destroy();
}

};

}, []);

const requestBluetoothPermission = async () => {

if (Platform.OS === "android") {

const granted = await PermissionsAndroid.requestMultiple([
PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
]);

return Object.values(granted).every(
status => status === PermissionsAndroid.RESULTS.GRANTED
);

}

return true;

};

const connectToDevice = async (device) => {

try {

const connected = await device.connect();

await connected.discoverAllServicesAndCharacteristics();

setDevice(connected);
setBatteryPercent(Math.floor(Math.random()*26)+70);

setHasSynced(true);

setIsSyncing(false);

setLastSyncedText("Connected & synced just now");

console.log("Connected to",connected.name);

}catch(error){

console.log("Connection error",error);

setIsSyncing(false);

}

};

const scanDevices = async () => {

const manager = managerRef.current;

if (!manager) {

setIsSyncing(true);
setLastSyncedText('Sync in progress...');

syncTimerRef.current = setTimeout(() => {
setDevice({ name: 'Apple Watch Series 9' });
setBatteryPercent(Math.floor(Math.random() * 26) + 70);
setHasSynced(true);
setIsSyncing(false);
setLastSyncedText('Connected & synced just now');
}, 1800);

return;

}

const permission = await requestBluetoothPermission();

if(!permission){

console.log("Permission denied");

return;

}

setIsSyncing(true);

setLastSyncedText("Scanning for devices...");

manager.startDeviceScan(null,null,(error,scannedDevice)=>{

if(error){

console.log(error);

setIsSyncing(false);

return;

}

if(scannedDevice?.name){

console.log("Found:",scannedDevice.name);

if(
scannedDevice.name.includes("Watch") ||
scannedDevice.name.includes("Fitbit") ||
scannedDevice.name.includes("Band")
){

manager.stopDeviceScan();

connectToDevice(scannedDevice);

}

}

});

};

const handleSyncNow = useCallback(()=>{

if(isSyncing) return;

scanDevices();

},[isSyncing]);

useEffect(()=>{

if(!isSyncing){

spinAnim.stopAnimation(()=>{
spinAnim.setValue(0);
});

return;

}

const spinLoop = Animated.loop(

Animated.timing(spinAnim,{
toValue:1,
duration:700,
easing:Easing.linear,
useNativeDriver:true
})

);

spinLoop.start();

return ()=>{
spinLoop.stop();
};

},[isSyncing]);

const spin = spinAnim.interpolate({

inputRange:[0,1],
outputRange:['0deg','360deg']

});

const bars=[26,38,32,52,46,60,40,30];

return (

<SafeAreaView style={styles.container}>

<View style={styles.screenBody}>

<ScrollView contentContainerStyle={styles.content}>

<View style={styles.headerRow}>

<TouchableOpacity style={styles.iconButton} onPress={()=>router.back()}>

<ArrowLeft size={20} color={theme.colors.primary}/>

</TouchableOpacity>

<Text style={styles.headerTitle}>Wearable Devices</Text>

<TouchableOpacity style={styles.iconButton}>

<Settings size={20} color={theme.colors.muted}/>

</TouchableOpacity>

</View>

<Text style={styles.sectionTitle}>CONNECTED DEVICE</Text>

<View style={styles.card}>

<View style={styles.connectedRow}>

<View style={styles.connectedInfo}>

<Text style={styles.deviceName}>

{device?.name || "No Device Connected"}

</Text>

<Text style={styles.deviceMeta}>

{device ? `Connected • ${batteryPercent}% Battery` : "Tap Sync to connect"}

</Text>

<Text style={styles.syncMeta}>{lastSyncedText}</Text>

<TouchableOpacity
style={styles.syncButton}
onPress={handleSyncNow}
>

<Animated.View
style={isSyncing?{transform:[{rotate:spin}]}:null}
>

<RefreshCw size={14} color="#fff"/>

</Animated.View>

<Text style={styles.syncButtonText}>

{isSyncing?"Syncing...":"Sync Now"}

</Text>

</TouchableOpacity>

</View>

<View style={styles.watchVisualWrap}>

<Image
source={require('../../assets/r5.jpeg')}
style={styles.watchImage}
/>

</View>

</View>

</View>

<View style={styles.sectionHeaderRow}>

<Text style={styles.sectionTitle}>TODAY'S SYNCED DATA</Text>

<Text style={styles.sectionHint}>

{hasSynced?'LIVE UPDATES':'SYNC REQUIRED'}

</Text>

</View>

{!hasSynced ? (

<View style={[styles.card,styles.noDataCard]}>

<Bluetooth size={18} color={theme.colors.primary}/>

<Text style={styles.noDataTitle}>No data yet</Text>

<Text style={styles.noDataText}>

Sync your wearable device

</Text>

</View>

) : (

<>

<View style={[styles.card,styles.heartCard]}>

<View style={styles.metricTopRow}>

<View>

<Text style={styles.metricLabel}>Heart Rate</Text>

<Text style={styles.metricValue}>

72 <Text style={styles.metricUnit}>BPM</Text>

</Text>

</View>

<View style={styles.metricIconWrap}>

<Heart size={18} color="#E45879" fill="#E45879"/>

</View>

</View>

<View style={styles.barRow}>

{bars.map((height,index)=>(

<View key={index}
style={[styles.bar,{height}]}
/>

))}

</View>

</View>

</>

)}

<View style={{height:80}}/>

</ScrollView>

<PcosBottomNav active="none"/>

</View>

</SafeAreaView>

);

}

const styles = StyleSheet.create({

container:{flex:1,backgroundColor:'#F5F5F8'},

screenBody:{flex:1},

content:{padding:20},

headerRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},

iconButton:{width:34,height:34,justifyContent:'center',alignItems:'center'},

headerTitle:{fontSize:28,fontWeight:'700'},

sectionTitle:{fontSize:13,fontWeight:'700',marginTop:20},

card:{
backgroundColor:"#fff",
padding:14,
borderRadius:16,
marginTop:10
},

connectedRow:{
flexDirection:'row',
justifyContent:'space-between'
},

connectedInfo:{flex:1},

deviceName:{fontSize:22,fontWeight:'700'},

deviceMeta:{fontSize:14,color:'#6B7280'},

syncMeta:{fontSize:12,color:'#9CA3AF'},

syncButton:{
backgroundColor:'#5B66EA',
padding:10,
borderRadius:10,
marginTop:10,
flexDirection:'row',
alignItems:'center'
},

syncButtonText:{
color:'#fff',
fontWeight:'700',
marginLeft:6
},

watchVisualWrap:{alignItems:'center'},

watchImage:{width:90,height:80},

noDataCard:{
alignItems:'center',
paddingVertical:20
},

noDataTitle:{fontWeight:'700',marginTop:6},

noDataText:{color:'#6B7280'},

metricTopRow:{
flexDirection:'row',
justifyContent:'space-between'
},

metricLabel:{fontSize:16},

metricValue:{fontSize:36,fontWeight:'700'},

metricUnit:{fontSize:16},

metricIconWrap:{
width:36,
height:36,
backgroundColor:'#FDE8EE',
borderRadius:10,
alignItems:'center',
justifyContent:'center'
},

barRow:{
flexDirection:'row',
marginTop:10,
height:60
},

bar:{
flex:1,
backgroundColor:'#F7C9D2',
marginHorizontal:2,
borderRadius:6
}

});