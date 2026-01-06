import math

def get_point(landmarks, index):
    lm = landmarks[index]
    return lm.x, lm.y


def is_eyebrow_furrowed(landmarks):
    left_brow_y = get_point(landmarks, 70)[1]
    left_eye_y = get_point(landmarks, 159)[1]

    right_brow_y = get_point(landmarks, 300)[1]
    right_eye_y = get_point(landmarks, 386)[1]

    left_dist = left_eye_y - left_brow_y
    right_dist = right_eye_y - right_brow_y

    avg_dist = (left_dist + right_dist) / 2

    return avg_dist < 0.025


def is_mouth_neutral(landmarks):
    upper_lip_y = get_point(landmarks, 13)[1]
    lower_lip_y = get_point(landmarks, 14)[1]

    lip_gap = abs(upper_lip_y - lower_lip_y)

    return lip_gap < 0.015


def is_head_tilted(landmarks):
    left_eye = get_point(landmarks, 33)
    right_eye = get_point(landmarks, 263)

    dy = right_eye[1] - left_eye[1]
    dx = right_eye[0] - left_eye[0]

    angle = abs(math.degrees(math.atan2(dy, dx)))

    return angle > 5


def calculate_confusion(landmarks):
    score = 0

    if is_eyebrow_furrowed(landmarks):
        score += 0.5

    if is_mouth_neutral(landmarks):
        score += 0.3

    if is_head_tilted(landmarks):
        score += 0.2

    return score
