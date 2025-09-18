import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { storage, db, appId } from './firebase.jsx';
export const uploadSubmissionFile = async (file, assignmentId, userId) => {
    if (!file) {
        throw new Error("No file provided for submission.");
    }
    const filePath = `submissions/${assignmentId}/${userId}/${file.name}`;
    const storageRef = ref(storage, filePath);
    const uploadResult = await uploadBytes(storageRef, file);
    return await getDownloadURL(uploadResult.ref);
};
export const uploadVideoAndCreateCourse = async (title, description, file, instructorId) => {
    if (!file) {
        throw new Error("No file provided for upload.");
    }

    // 1. Create a unique path for the video file in Firebase Storage
    const filePath = `courses/${instructorId}/videos/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, filePath);

    // 2. Upload the file
    const uploadResult = await uploadBytes(storageRef, file);
    const videoURL = await getDownloadURL(uploadResult.ref);

    // 3. Create a new course document in Firestore
    const coursesRef = collection(db, `/artifacts/${appId}/public/data/courses`);
    const newCourseDoc = await addDoc(coursesRef, {
        title: title,
        description: description,
        instructorId: instructorId,
        createdAt: serverTimestamp(),
    });

    // 4. Create a new lecture document linked to the new course
    const lecturesRef = collection(db, `/artifacts/${appId}/public/data/lectures`);
    await addDoc(lecturesRef, {
        courseId: newCourseDoc.id,
        title: 'Introduction', // You can make this dynamic later
        videoURL: videoURL,
        createdAt: serverTimestamp(),
    });

    console.log("Course and video lecture created successfully!");
};

