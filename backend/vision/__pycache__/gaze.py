def get_point(landmarks, index):
    lm = landmarks[index]
    return lm.x, lm.y


def estimate_gaze(face_landmarks):
    nose_x, nose_y = get_point(face_landmarks, 1)
    left_eye_x, left_eye_y = get_point(face_landmarks, 33)
    right_eye_x, right_eye_y = get_point(face_landmarks, 263)

    eye_center_x = (left_eye_x + right_eye_x) / 2
    eye_center_y = (left_eye_y + right_eye_y) / 2

    dx = nose_x - eye_center_x
    dy = nose_y - eye_center_y

    H_THRESHOLD = 0.03
    V_THRESHOLD = 0.03

    if dx > H_THRESHOLD:
        return "RIGHT"
    elif dx < -H_THRESHOLD:
        return "LEFT"
    elif dy > V_THRESHOLD:
        return "DOWN"
    elif dy < -V_THRESHOLD:
        return "UP"
    else:
        return "CENTER"
