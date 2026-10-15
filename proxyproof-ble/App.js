import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
// Conceptually importing BLE manager for React Native
import { BleManager } from 'react-native-ble-plx'; 

export default function ProxyProofApp() {
  const [role, setRole] = useState(null); // 'organiser' or 'student[span_10](start_span)'[span_10](end_span)
  const [sessionActive, setSessionActive] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState('Not Marked');

  // Organiser Logic: Broadcast BLE Signal[span_11](start_span)[span_11](end_span)
  const startSession = () => {
    setSessionActive(true);
    const sessionId = "CS101-Morning";
    
    // API Call to backend to open session window
    fetch('http://localhost:5000/start_session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, duration_minutes: 5 })
    });

    Alert.alert("Session Started", "Broadcasting BLE token for 5 minutes.");
    // In a real native module, startBLEBroadcast(sessionId, rotatingToken) would trigger here.
  };

  // Student Logic: Scan for BLE and send to server[span_12](start_span)[span_12](end_span)
  const scanAndMark = () => {
    setAttendanceStatus('Scanning for Organiser BLE...');
    
    // Simulating BLE payload extraction
    setTimeout(() => {
      const mockBlePayload = {
        session_id: "CS101-Morning",
        token: "a1b2c3d4", // Would be dynamically extracted from BLE broadcast
        rssi: -55 // Strong signal indicating they are in the room[span_13](start_span)[span_13](end_span)
      };

      // Send captured BLE data to server[span_14](start_span)[span_14](end_span)
      fetch('http://localhost:5000/mark_attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: "26BCE2125",
          device_id: "device-mac-001", // Bound device[span_15](start_span)[span_15](end_span)
          session_id: mockBlePayload.session_id,
          token: mockBlePayload.token,
          rssi: mockBlePayload.rssi
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setAttendanceStatus(`Failed: ${data.error}`);
        } else {
          setAttendanceStatus('✅ Attendance Marked Automatically!');
        }
      });
    }, 2000);
  };

  if (!role) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>ProxyProof Login</Text>
        <Button title="Login as Organiser" onPress={() => setRole('organiser')} />
        <Button title="Login as Student" onPress={() => setRole('student')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{role === 'organiser' ? 'Organiser Dashboard' : 'Student Portal'}</Text>
      
      {role === 'organiser' ? (
        <View>
          <Button title={sessionActive ? "Broadcasting..." : "Start Attendance Session"} onPress={startSession} />
          <Button title="Export CSV" onPress={() => Alert.alert("Exporting", "Downloading attendance.csv")} />
        </View>
      ) : (
        <View>
          <Text style={styles.status}>Status: {attendanceStatus}</Text>
          <Button title="Scan BLE & Mark Presence" onPress={scanAndMark} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  status: { fontSize: 16, marginBottom: 20, textAlign: 'center' }
});
