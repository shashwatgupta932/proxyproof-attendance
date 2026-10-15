from flask import Flask, request, jsonify, Response
import time
import hashlib
import csv
import io

app = Flask(__name__)

# In-memory database for prototype
students = {
    "26BCE2125": {"device_id": "device-mac-001", "name": "Shashwat Gupta", "attendance": 0}
}
active_sessions = {}
attendance_records = []

def generate_rotating_token(session_id):
    """Generates a time-based rotating token that changes every 10 seconds to defeat replay attacks."""
    current_window = int(time.time() / 10)
    secret = f"{session_id}-{current_window}".encode()
    return hashlib.sha256(secret).hexdigest()[:8]

@app.route('/start_session', methods=['POST'])
def start_session():
    """Organiser starts a session[span_3](start_span)[span_3](end_span)."""
    data = request.json
    session_id = data.get('session_id')
    duration = data.get('duration_minutes', 5)
    
    active_sessions[session_id] = {
        "end_time": time.time() + (duration * 60)
    }
    return jsonify({"message": "Session started", "session_id": session_id})

@app.route('/mark_attendance', methods=['POST'])
def mark_attendance():
    """Server marks attendance based on registered device, fresh token, and RSSI[span_4](start_span)[span_4](end_span)."""
    data = request.json
    student_id = data.get('student_id')
    device_id = data.get('device_id')
    session_id = data.get('session_id')
    token = data.get('token')
    rssi = data.get('rssi') # Signal strength

    # 1. Check if session is active
    if session_id not in active_sessions or time.time() > active_sessions[session_id]['end_time']:
        return jsonify({"error": "Session inactive"}), 400

    # 2. Verify registered device (Anti-proxy: one device marks one student)[span_5](start_span)[span_5](end_span)
    if student_id not in students or students[student_id]['device_id'] != device_id:
        return jsonify({"error": "Unregistered device. Admin approval needed."}), 403

    # 3. Verify rotating token (Anti-proxy: defeats shared codes)[span_6](start_span)[span_6](end_span)
    expected_token = generate_rotating_token(session_id)
    if token != expected_token:
        return jsonify({"error": "Invalid or expired token"}), 403

    # 4. Verify physical presence via RSSI (e.g., must be > -75 dBm to be in the room)[span_7](start_span)[span_7](end_span)
    if rssi < -75:
        return jsonify({"error": "RSSI too weak. Move closer to the organiser."}), 403

    # Mark attendance
    attendance_records.append({"student_id": student_id, "session_id": session_id, "timestamp": time.time()})
    students[student_id]['attendance'] += 1
    
    return jsonify({"message": "Attendance marked successfully!"})

@app.route('/export_csv', methods=['GET'])
def export_csv():
    """CSV export for organisers[span_8](start_span)[span_8](end_span)."""
    si = io.StringIO()
    cw = csv.writer(si)
    cw.writerow(['Student ID', 'Name', 'Total Attendance'])
    for sid, data in students.items():
        cw.writerow([sid, data['name'], data['attendance']])
    
    return Response(si.getvalue(), mimetype='text/csv', headers={"Content-Disposition": "attachment;filename=attendance.csv"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
