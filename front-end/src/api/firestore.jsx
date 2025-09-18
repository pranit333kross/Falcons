import { collection, doc, setDoc, getDocs, query, where, getDoc, addDoc, serverTimestamp, arrayUnion, collectionGroup, updateDoc } from "firebase/firestore";
import { db, appId } from './firebase.jsx';

export const addReviewToCourse = (courseId, reviewData) => {
    const reviewsRef = collection(db, `/artifacts/${appId}/public/data/courses/${courseId}/reviews`);
    return addDoc(reviewsRef, {
        ...reviewData,
        createdAt: serverTimestamp()
    });
};
export const getReviewsForCourse = async (courseId) => {
    const reviewsRef = collection(db, `/artifacts/${appId}/public/data/courses/${courseId}/reviews`);
    const q = query(reviewsRef);
    const querySnapshot = await getDocs(q);
    const reviews = [];
    querySnapshot.forEach((doc) => {
        reviews.push({ id: doc.id, ...doc.data() });
    });
    return reviews.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate());
};


export const createSubmission = (userId, userEmail, assignmentId, fileURL, fileName) => {
    const submissionsRef = collection(db, `/artifacts/${appId}/users/${userId}/submissions`);
    return addDoc(submissionsRef, {
        assignmentId,
        userId,
        studentEmail: userEmail,
        fileURL,
        fileName,
        submittedAt: serverTimestamp(),
        grade: null // Initialize grade as null
    });
};

/**
 * Fetches all submissions for a specific assignment across all users.
 * This uses a collectionGroup query, which requires a Firestore index.
 */
export const getSubmissionsForAssignment = async (assignmentId) => {
    const submissionsQuery = query(
        collectionGroup(db, 'submissions'),
        where('assignmentId', '==', assignmentId)
    );
    const querySnapshot = await getDocs(submissionsQuery);
    const submissions = [];
    querySnapshot.forEach((doc) => {
        submissions.push({ id: doc.id, ...doc.data() });
    });
    return submissions;
};

/**
 * Updates a specific submission document with a grade.
 */
export const gradeSubmission = (studentId, submissionId, grade) => {
    const submissionRef = doc(db, `/artifacts/${appId}/users/${studentId}/submissions`, submissionId);
    return updateDoc(submissionRef, {
        grade: grade
    });
};

/**
 * Fetches all submissions made by a single user.
 */
export const getSubmissionsForUser = async (userId) => {
    const submissionsRef = collection(db, `/artifacts/${appId}/users/${userId}/submissions`);
    const q = query(submissionsRef);
    const querySnapshot = await getDocs(q);
    const submissions = [];
    querySnapshot.forEach((doc) => {
        submissions.push({ id: doc.id, ...doc.data() });
    });
    return submissions.sort((a, b) => b.submittedAt?.toDate() - a.submittedAt?.toDate());
};


// --- Assignment Functions ---

export const createAssignment = (courseId, title, description, instructorId) => {
    const assignmentsRef = collection(db, `/artifacts/${appId}/public/data/assignments`);
    return addDoc(assignmentsRef, {
        courseId,
        title,
        description,
        instructorId,
        createdAt: serverTimestamp(),
    });
};

export const getAssignmentsForCourse = async (courseId) => {
    const assignmentsRef = collection(db, `/artifacts/${appId}/public/data/assignments`);
    const q = query(assignmentsRef, where("courseId", "==", courseId));
    const querySnapshot = await getDocs(q);
    const assignments = [];
    querySnapshot.forEach((doc) => {
        assignments.push({ id: doc.id, ...doc.data() });
    });
    return assignments;
};

export const getAssignmentById = async (assignmentId) => {
    const assignmentRef = doc(db, `/artifacts/${appId}/public/data/assignments`, assignmentId);
    const docSnap = await getDoc(assignmentRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
    } else {
        throw new Error("Assignment not found");
    }
};

export const getAssignmentsByInstructor = async (instructorId) => {
    const assignmentsRef = collection(db, `/artifacts/${appId}/public/data/assignments`);
    const q = query(assignmentsRef, where("instructorId", "==", instructorId));
    const querySnapshot = await getDocs(q);
    const assignments = [];
    querySnapshot.forEach((doc) => {
        assignments.push({ id: doc.id, ...doc.data() });
    });
    return assignments;
};


// --- Other Existing Functions ---

const awardBadge = async (userId, result) => {
    const userRef = doc(db, `/artifacts/${appId}/users/${userId}`);
    if (result.percentage === 100) {
        await setDoc(userRef, {
            badges: arrayUnion({
                name: "Perfect Score",
                quizTitle: result.quizTitle,
                awardedAt: serverTimestamp()
            })
        }, { merge: true });
    }
};

export const getLecturesForCourse = async (courseId) => {
    const lecturesRef = collection(db, `/artifacts/${appId}/public/data/lectures`);
    const q = query(lecturesRef, where("courseId", "==", courseId));
    const querySnapshot = await getDocs(q);
    const lectures = [];
    querySnapshot.forEach((doc) => {
        lectures.push({ id: doc.id, ...doc.data() });
    });
    return lectures;
};

export const getQuizResultsForUser = async (userId) => {
    const resultsRef = collection(db, `/artifacts/${appId}/users/${userId}/quizResults`);
    const q = query(resultsRef);
    const querySnapshot = await getDocs(q);
    const results = [];
    querySnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
    });
    return results.sort((a, b) => b.completedAt?.toDate() - a.completedAt?.toDate());
};

export const saveQuizResult = async (userId, quizId, score, totalQuestions, quizTitle) => {
    const resultsRef = collection(db, `/artifacts/${appId}/users/${userId}/quizResults`);
    const resultData = {
        quizId,
        quizTitle,
        score,
        totalQuestions,
        percentage: Math.round((score / totalQuestions) * 100),
        completedAt: serverTimestamp()
    };
    await addDoc(resultsRef, resultData);
    await awardBadge(userId, resultData);
};

export const getQuizById = async (quizId) => {
    const quizRef = doc(db, `/artifacts/${appId}/public/data/quizzes`, quizId);
    const docSnap = await getDoc(quizRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
    } else {
        throw new Error("Quiz not found");
    }
};

export const getCourseById = async (courseId) => {
    const courseRef = doc(db, `/artifacts/${appId}/public/data/courses`, courseId);
    const docSnap = await getDoc(courseRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
    } else {
        throw new Error("Course not found");
    }
};

export const getQuizzesForCourse = async (courseId) => {
    const quizzesRef = collection(db, `/artifacts/${appId}/public/data/quizzes`);
    const q = query(quizzesRef, where("courseId", "==", courseId));
    const querySnapshot = await getDocs(q);
    const quizzes = [];
    querySnapshot.forEach((doc) => {
        quizzes.push({ id: doc.id, ...doc.data() });
    });
    return quizzes;
};

export const getCourses = async () => {
    const coursesRef = collection(db, `/artifacts/${appId}/public/data/courses`);
    const q = query(coursesRef);
    const querySnapshot = await getDocs(q);
    const courses = [];
    querySnapshot.forEach((doc) => {
        courses.push({ id: doc.id, ...doc.data() });
    });
    return courses;
};

export const seedDatabase = async () => {
    // ... seedDatabase function remains the same ...
};

