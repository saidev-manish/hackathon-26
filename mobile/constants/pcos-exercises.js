/**
 * PCOS-Specific Exercise Database
 * Science-based exercises for PCOS management
 */

export const EXERCISE_CATEGORIES = {
    YOGA: 'yoga',
    STRENGTH: 'strength',
    CARDIO: 'cardio',
    CORE: 'core',
};

export const exercises = [
    // 🧘‍♀️ YOGA - Hormone + Stress Regulation
    {
        id: 1,
        name: 'Butterfly Pose',
        category: EXERCISE_CATEGORIES.YOGA,
        duration: 60,
        difficulty: 'Beginner',
        description: 'Improves blood flow to ovaries and reduces pelvic tension',
        steps: [
            'Sit with legs extended',
            'Bend knees and bring soles of feet together',
            'Hold feet and gently press elbows on inner thighs',
            'Lean forward slightly and breathe deeply',
            'Hold for 60 seconds',
        ],
        benefits: ['Blood flow to ovaries', 'Pelvic tension relief', 'Hip opener'],
        modelPath: null, // Will be: require('../assets/models/butterfly.glb')
    },
    {
        id: 2,
        name: 'Malasana (Yogic Squat)',
        category: EXERCISE_CATEGORIES.YOGA,
        duration: 45,
        difficulty: 'Beginner',
        description: 'Opens hips and improves digestive function',
        steps: [
            'Stand with feet wider than hip-width',
            'Bend knees and lower hips down',
            'Press elbows against inner knees',
            'Keep chest upright and breathe',
            'Hold for 45 seconds',
        ],
        benefits: ['Hip opening', 'Digestion improvement', 'Hormone balance'],
        modelPath: null,
    },
    {
        id: 3,
        name: 'Cobra Pose (Bhujangasana)',
        category: EXERCISE_CATEGORIES.YOGA,
        duration: 30,
        difficulty: 'Beginner',
        description: 'Stimulates abdominal organs and improves digestion',
        steps: [
            'Lie on your stomach',
            'Place hands under shoulders',
            'Press chest upward using arm strength',
            'Keep elbows close to ribs',
            'Hold for 30 seconds',
        ],
        benefits: ['Abdominal stimulation', 'Digestion boost', 'Stress relief'],
        modelPath: null,
    },
    {
        id: 4,
        name: 'Bridge Pose (Setu Bandhasana)',
        category: EXERCISE_CATEGORIES.YOGA,
        duration: 60,
        difficulty: 'Beginner',
        description: 'Strengthens glutes and activates ovarian region',
        steps: [
            'Lie on back with knees bent',
            'Feet flat, hip-width apart',
            'Press into feet and lift hips',
            'Clasp hands under back if possible',
            'Hold for 60 seconds',
        ],
        benefits: ['Glute activation', 'Ovarian stimulation', 'Hormone regulation'],
        modelPath: null,
    },
    {
        id: 5,
        name: 'Reclined Butterfly (Supta Baddha Konasana)',
        category: EXERCISE_CATEGORIES.YOGA,
        duration: 90,
        difficulty: 'Beginner',
        description: 'Relaxing pose that opens hips and promotes hormone balance',
        steps: [
            'Lie on your back',
            'Bend knees and bring soles together',
            'Let knees fall open naturally',
            'Relax arms at sides',
            'Breathe deeply for 90 seconds',
        ],
        benefits: ['Deep hip opening', 'Stress relief', 'Hormone balance'],
        modelPath: null,
    },
    {
        id: 6,
        name: 'Sun Salutation (Surya Namaskar)',
        category: EXERCISE_CATEGORIES.YOGA,
        duration: 900,
        difficulty: 'Moderate',
        description: 'Slow flowing sequence that activates all body systems',
        steps: [
            'Stand in mountain pose',
            'Flow through 12 positions slowly',
            'Coordinate breath with movement',
            'Complete 5-10 rounds',
            'Rest in child\'s pose',
        ],
        benefits: ['Full body activation', 'Endocrine system regulation', 'Calorie burn'],
        modelPath: null,
    },

    // 🏋️‍♀️ STRENGTH TRAINING - Insulin Sensitivity (Most Important)
    {
        id: 7,
        name: 'Bodyweight Squats',
        category: EXERCISE_CATEGORIES.STRENGTH,
        duration: 45,
        difficulty: 'Beginner',
        description: 'Improves insulin sensitivity and builds lean muscle',
        steps: [
            'Stand with feet hip-width apart',
            'Lower down as if sitting in a chair',
            'Keep chest up and weight in heels',
            'Push through heels to stand',
            'Perform 3 sets of 12-15 reps',
        ],
        benefits: ['Insulin sensitivity', 'Lean muscle', 'Metabolism boost'],
        frequency: '3-4x per week',
        modelPath: null,
    },
    {
        id: 8,
        name: 'Glute Bridges',
        category: EXERCISE_CATEGORIES.STRENGTH,
        duration: 30,
        difficulty: 'Beginner',
        description: 'Activates glutes and strengthens posterior chain',
        steps: [
            'Lie on back with knees bent',
            'Feet flat on ground',
            'Push through heels to lift hips',
            'Squeeze glutes at the top',
            'Lower and repeat for 3 sets of 15 reps',
        ],
        benefits: ['Glute strength', 'Posterior chain activation', 'Hip stability'],
        frequency: '3-4x per week',
        modelPath: null,
    },
    {
        id: 9,
        name: 'Deadlifts',
        category: EXERCISE_CATEGORIES.STRENGTH,
        duration: 60,
        difficulty: 'Moderate',
        description: 'Full body strength exercise for major muscle groups',
        steps: [
            'Stand with feet hip-width apart',
            'Bend at hips and knees to grab weight',
            'Keep back straight and chest up',
            'Drive through heels to stand',
            'Perform 3 sets of 8-10 reps',
        ],
        benefits: ['Whole body strength', 'Insulin sensitivity', 'Metabolic boost'],
        frequency: '2-3x per week',
        modelPath: null,
    },
    {
        id: 10,
        name: 'Lunges',
        category: EXERCISE_CATEGORIES.STRENGTH,
        duration: 45,
        difficulty: 'Moderate',
        description: 'Builds leg strength and improves balance',
        steps: [
            'Stand with feet hip-width apart',
            'Step forward and lower back knee',
            'Front knee stays over ankle',
            'Push back to starting position',
            'Alternate legs for 3 sets of 12 reps per leg',
        ],
        benefits: ['Leg strength', 'Balance', 'Lower body toning'],
        frequency: '3-4x per week',
        modelPath: null,
    },
    {
        id: 11,
        name: 'Step-ups',
        category: EXERCISE_CATEGORIES.STRENGTH,
        duration: 30,
        difficulty: 'Moderate',
        description: 'Functional movement for leg and glute strength',
        steps: [
            'Stand facing a step or bench',
            'Step up with right leg first',
            'Push through right heel to stand',
            'Step down and repeat',
            'Perform 3 sets of 10 reps per leg',
        ],
        benefits: ['Leg strength', 'Glute activation', 'Cardiovascular benefit'],
        frequency: '3-4x per week',
        modelPath: null,
    },
    {
        id: 12,
        name: 'Wall Sit',
        category: EXERCISE_CATEGORIES.STRENGTH,
        duration: 60,
        difficulty: 'Beginner',
        description: 'Isometric strength exercise for quads and glutes',
        steps: [
            'Stand with back against wall',
            'Walk feet forward and lower body',
            'Keep back flat against wall',
            'Thighs parallel to ground',
            'Hold for 30-60 seconds, repeat 3 times',
        ],
        benefits: ['Quad strength', 'Glute activation', 'Endurance'],
        frequency: '3-4x per week',
        modelPath: null,
    },
    {
        id: 13,
        name: 'Resistance Band Workouts',
        category: EXERCISE_CATEGORIES.STRENGTH,
        duration: 45,
        difficulty: 'Moderate',
        description: 'Low-impact strength training for muscle development',
        steps: [
            'Use resistance band for leg exercises',
            'Perform banded squats, leg lifts, lateral walks',
            'Maintain tension throughout movement',
            'Complete 3 sets of 12-15 reps',
            'Progress by using stronger band resistance',
        ],
        benefits: ['Lean muscle', 'Joint safe', 'Metabolic boost'],
        frequency: '3-4x per week',
        modelPath: null,
    },

    // ❤️ LOW-IMPACT CARDIO - Moderate Intensity (Avoid Excessive HIIT)
    {
        id: 14,
        name: 'Brisk Walking',
        category: EXERCISE_CATEGORIES.CARDIO,
        duration: 1800,
        difficulty: 'Easy',
        description: 'Gentle cardiovascular exercise that lowers cortisol',
        steps: [
            'Walk at a pace where you can talk but not sing',
            'Maintain consistent pace for 30 minutes',
            'Swing arms naturally',
            'Focus on posture and breathing',
            'Do 4-5 times per week',
        ],
        benefits: ['Cortisol reduction', 'Fat loss', 'Cardiovascular health'],
        frequency: '4-5x per week',
        modelPath: null,
    },
    {
        id: 15,
        name: 'Cycling',
        category: EXERCISE_CATEGORIES.CARDIO,
        duration: 1800,
        difficulty: 'Easy',
        description: 'Low-impact cardio that builds leg endurance',
        steps: [
            'Adjust bike seat to hip height',
            'Pedal at moderate, consistent pace',
            'Maintain steady heart rate',
            'Complete 30 minutes of cycling',
            'Do 4-5 times per week',
        ],
        benefits: ['Low impact', 'Leg endurance', 'Fat loss'],
        frequency: '4-5x per week',
        modelPath: null,
    },
    {
        id: 16,
        name: 'Swimming',
        category: EXERCISE_CATEGORIES.CARDIO,
        duration: 1800,
        difficulty: 'Easy',
        description: 'Whole-body low-impact cardio exercise',
        steps: [
            'Swim at moderate pace',
            'Vary strokes for full-body activation',
            'Maintain steady breathing',
            'Complete 30 minutes',
            'Do 4-5 times per week',
        ],
        benefits: ['Full body workout', 'Zero impact', 'Stress relief'],
        frequency: '4-5x per week',
        modelPath: null,
    },
    {
        id: 17,
        name: 'Incline Treadmill',
        category: EXERCISE_CATEGORIES.CARDIO,
        duration: 1800,
        difficulty: 'Moderate',
        description: 'Increases calorie burn without high-impact stress',
        steps: [
            'Set treadmill to 1-3% incline',
            'Walk briskly at your pace',
            'Avoid holding onto handrails',
            'Maintain steady effort for 30 minutes',
            'Do 4-5 times per week',
        ],
        benefits: ['Higher calorie burn', 'Low impact', 'Glute activation'],
        frequency: '4-5x per week',
        modelPath: null,
    },
    {
        id: 18,
        name: 'Dance Cardio (Moderate)',
        category: EXERCISE_CATEGORIES.CARDIO,
        duration: 1200,
        difficulty: 'Moderate',
        description: 'Fun, moderate-intensity cardio without cortisol spike',
        steps: [
            'Follow along with dance video',
            'Maintain moderate intensity throughout',
            'Focus on rhythm and enjoyment',
            'Complete 20 minutes',
            'Do 3-4 times per week',
        ],
        benefits: ['Enjoyable exercise', 'Moderate intensity', 'Mood boost'],
        frequency: '3-4x per week',
        modelPath: null,
    },

    // 🧘 CORE + PELVIC ACTIVATION - Bloating & Hormonal Regulation
    {
        id: 19,
        name: 'Cat-Cow Stretch',
        category: EXERCISE_CATEGORIES.CORE,
        duration: 120,
        difficulty: 'Beginner',
        description: 'Mobilizes spine and activates core with breath',
        steps: [
            'Get on hands and knees',
            'Inhale and drop belly (cow pose)',
            'Exhale and arch back (cat pose)',
            'Flow between poses for 2 minutes',
            'Repeat daily or 4-5 times per week',
        ],
        benefits: ['Spinal mobilization', 'Digestion', 'Core engagement'],
        modelPath: null,
    },
    {
        id: 20,
        name: 'Pelvic Tilts',
        category: EXERCISE_CATEGORIES.CORE,
        duration: 60,
        difficulty: 'Beginner',
        description: 'Activates pelvic floor and lower abdominals',
        steps: [
            'Lie on back with knees bent',
            'Tilt pelvis to engage abs',
            'Release slowly',
            'Repeat for 1-2 minutes',
            'Do 5-6 times per week',
        ],
        benefits: ['Pelvic floor activation', 'Core strengthening', 'Hormone regulation'],
        modelPath: null,
    },
    {
        id: 21,
        name: 'Bird-Dog',
        category: EXERCISE_CATEGORIES.CORE,
        duration: 45,
        difficulty: 'Moderate',
        description: 'Core stability exercise that enhances balance',
        steps: [
            'Get on hands and knees',
            'Extend right arm and left leg',
            'Keep spine neutral',
            'Return and switch sides',
            'Do 3 sets of 10 reps per side',
        ],
        benefits: ['Core stability', 'Balance', 'Spinal health'],
        modelPath: null,
    },
    {
        id: 22,
        name: 'Plank (Short Duration)',
        category: EXERCISE_CATEGORIES.CORE,
        duration: 30,
        difficulty: 'Moderate',
        description: 'Full-body core exercise without excessive strain',
        steps: [
            'Get in forearm plank position',
            'Keep body in straight line',
            'Engage core and hold',
            'Hold for 20-30 seconds',
            'Rest and repeat 3 times',
        ],
        benefits: ['Core strength', 'Shoulder stability', 'Body tension'],
        modelPath: null,
    },
    {
        id: 23,
        name: 'Kegel Exercises',
        category: EXERCISE_CATEGORIES.CORE,
        duration: 600,
        difficulty: 'Easy',
        description: 'Pelvic floor strengthening for hormone regulation',
        steps: [
            'Contract pelvic floor muscles (as if stopping urine)',
            'Hold for 3-5 seconds',
            'Release and relax for 3-5 seconds',
            'Repeat for 10 minutes daily',
            'Do daily for best results',
        ],
        benefits: ['Pelvic floor strength', 'Hormone circulation', 'Core activation'],
        modelPath: null,
    },
];

// 21-Day Reset Program
export const programs = [
    {
        id: 1,
        name: 'PCOS 21-Day Reset Program',
        description: 'Science-based progressive workout program for PCOS management',
        duration: 21,
        weeks: [
            {
                week: 1,
                name: 'Hormone Calm',
                description: 'Focus on stress reduction and hormone balance',
                days: [
                    {
                        day: 1,
                        title: 'Yoga Flow & Walking',
                        workouts: [
                            { exerciseId: 6, sets: 1, duration: '15 min', notes: 'Surya Namaskar - slow flow' },
                            { exerciseId: 14, sets: 1, duration: '15 min', notes: 'Brisk Walking' },
                        ],
                    },
                    {
                        day: 2,
                        title: 'Yoga Poses & Core',
                        workouts: [
                            { exerciseId: 1, sets: 3, duration: '3 min', notes: 'Butterfly Pose' },
                            { exerciseId: 4, sets: 3, duration: '3 min', notes: 'Bridge Pose' },
                            { exerciseId: 19, sets: 1, duration: '2 min', notes: 'Cat-Cow' },
                        ],
                    },
                    {
                        day: 3,
                        title: 'Light Walking & Stretching',
                        workouts: [
                            { exerciseId: 14, sets: 1, duration: '20 min', notes: 'Brisk Walking' },
                            { exerciseId: 5, sets: 1, duration: '5 min', notes: 'Reclined Butterfly' },
                        ],
                    },
                    {
                        day: 4,
                        title: 'Restorative Yoga',
                        workouts: [
                            { exerciseId: 1, sets: 3, duration: '3 min', notes: 'Butterfly Pose' },
                            { exerciseId: 3, sets: 2, duration: '2 min', notes: 'Cobra Pose' },
                            { exerciseId: 5, sets: 1, duration: '5 min', notes: 'Reclined Butterfly' },
                        ],
                    },
                    {
                        day: 5,
                        title: 'Walking & Light Yoga',
                        workouts: [
                            { exerciseId: 14, sets: 1, duration: '25 min', notes: 'Brisk Walking' },
                            { exerciseId: 2, sets: 2, duration: '2 min', notes: 'Malasana - Yogic Squat' },
                        ],
                    },
                    {
                        day: 6,
                        title: 'Full Yoga Flow',
                        workouts: [
                            { exerciseId: 6, sets: 1, duration: '20 min', notes: 'Surya Namaskar - 8 rounds' },
                        ],
                    },
                    {
                        day: 7,
                        title: 'Rest & Pelvic Activation',
                        workouts: [
                            { exerciseId: 23, sets: 1, duration: '10 min', notes: 'Daily Kegels' },
                            { exerciseId: 20, sets: 1, duration: '2 min', notes: 'Pelvic Tilts' },
                        ],
                    },
                ],
            },
            {
                week: 2,
                name: 'Insulin Control',
                description: 'Build strength to improve insulin sensitivity',
                days: [
                    {
                        day: 8,
                        title: 'Strength Intro + Cardio',
                        workouts: [
                            { exerciseId: 7, sets: 3, reps: 12, notes: 'Bodyweight Squats' },
                            { exerciseId: 14, sets: 1, duration: '15 min', notes: 'Brisk Walking' },
                        ],
                    },
                    {
                        day: 9,
                        title: 'Glute Focus + Core',
                        workouts: [
                            { exerciseId: 8, sets: 3, reps: 15, notes: 'Glute Bridges' },
                            { exerciseId: 19, sets: 1, duration: '2 min', notes: 'Cat-Cow' },
                            { exerciseId: 21, sets: 3, reps: 10, notes: 'Bird-Dog per side' },
                        ],
                    },
                    {
                        day: 10,
                        title: 'Low-Impact Cardio',
                        workouts: [
                            { exerciseId: 15, sets: 1, duration: '20 min', notes: 'Cycling' },
                        ],
                    },
                    {
                        day: 11,
                        title: 'Full Body Strength',
                        workouts: [
                            { exerciseId: 10, sets: 3, reps: 10, notes: 'Lunges per leg' },
                            { exerciseId: 8, sets: 3, reps: 15, notes: 'Glute Bridges' },
                            { exerciseId: 12, sets: 3, duration: '30-45 sec', notes: 'Wall Sit' },
                        ],
                    },
                    {
                        day: 12,
                        title: 'Swimming or Cycling',
                        workouts: [
                            { exerciseId: 16, sets: 1, duration: '20 min', notes: 'Swimming' },
                        ],
                    },
                    {
                        day: 13,
                        title: 'Strength & Recovery',
                        workouts: [
                            { exerciseId: 11, sets: 3, reps: 10, notes: 'Step-ups per leg' },
                            { exerciseId: 6, sets: 1, duration: '15 min', notes: 'Surya Namaskar' },
                        ],
                    },
                    {
                        day: 14,
                        title: 'Rest Day',
                        workouts: [
                            { exerciseId: 23, sets: 1, duration: '10 min', notes: 'Daily Kegels' },
                        ],
                    },
                ],
            },
            {
                week: 3,
                name: 'Fat Loss + Balance',
                description: 'Combine strength and cardio for optimal results',
                days: [
                    {
                        day: 15,
                        title: 'Mixed Strength Session',
                        workouts: [
                            { exerciseId: 7, sets: 3, reps: 15, notes: 'Bodyweight Squats' },
                            { exerciseId: 9, sets: 2, reps: 8, notes: 'Deadlifts' },
                            { exerciseId: 13, sets: 3, reps: 12, notes: 'Resistance Band Workouts' },
                        ],
                    },
                    {
                        day: 16,
                        title: 'Dance Cardio + Core',
                        workouts: [
                            { exerciseId: 18, sets: 1, duration: '20 min', notes: 'Dance Cardio - moderate' },
                            { exerciseId: 22, sets: 3, duration: '30 sec', notes: 'Plank holds' },
                        ],
                    },
                    {
                        day: 17,
                        title: 'Incline Walking',
                        workouts: [
                            { exerciseId: 17, sets: 1, duration: '30 min', notes: 'Incline Treadmill' },
                        ],
                    },
                    {
                        day: 18,
                        title: 'Strength + Yoga Cool Down',
                        workouts: [
                            { exerciseId: 10, sets: 3, reps: 12, notes: 'Lunges' },
                            { exerciseId: 8, sets: 3, reps: 15, notes: 'Glute Bridges' },
                            { exerciseId: 6, sets: 1, duration: '15 min', notes: 'Surya Namaskar - recovery' },
                        ],
                    },
                    {
                        day: 19,
                        title: 'Swimming or Cycling',
                        workouts: [
                            { exerciseId: 16, sets: 1, duration: '30 min', notes: 'Swimming' },
                        ],
                    },
                    {
                        day: 20,
                        title: 'Full Body Strength',
                        workouts: [
                            { exerciseId: 7, sets: 3, reps: 15, notes: 'Bodyweight Squats' },
                            { exerciseId: 11, sets: 3, reps: 12, notes: 'Step-ups' },
                            { exerciseId: 12, sets: 3, duration: '45 sec', notes: 'Wall Sit' },
                            { exerciseId: 21, sets: 3, reps: 12, notes: 'Bird-Dog per side' },
                        ],
                    },
                    {
                        day: 21,
                        title: 'Celebration & Reflection',
                        workouts: [
                            { exerciseId: 18, sets: 1, duration: '20 min', notes: 'Fun Dance Cardio' },
                            { exerciseId: 5, sets: 1, duration: '5 min', notes: 'Reclined Butterfly - relaxation' },
                        ],
                    },
                ],
            },
        ],
    },
];

// Get exercise data by ID
export const getExerciseById = (id) => exercises.find((ex) => ex.id === id);

// Get exercises by category
export const getExercisesByCategory = (category) => exercises.filter((ex) => ex.category === category);

// Get program by ID
export const getProgramById = (id) => programs.find((p) => p.id === id);
