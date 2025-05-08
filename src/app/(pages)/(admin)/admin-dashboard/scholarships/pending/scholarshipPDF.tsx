import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Font,
} from "@react-pdf/renderer";
import { Alumnus, ScholarshipStudent, Student } from "@/models/models";
import { uploadDocument } from "@/lib/upload";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: "Times-Roman",
    lineHeight: 1.5,
  },
  section: {
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  paragraph: {
    marginBottom: 10,
    textAlign: "justify",
  },
});

// Auto-generated PDF for scholarshipStudent
const ScholarshipStudentPDF = ({
  scholarshipStudent,
  student,
  alum,
}: {
  scholarshipStudent: ScholarshipStudent;
  student: Student;
  alum: Alumnus;
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Title */}
      <Text style={styles.title}>Scholarship Agreement Letter</Text>

      <View style={styles.section}>
        <Text style={styles.paragraph}>
          This agreement is made between a willing alumnus and a student in-need
          of a scholarship and has been made on{" "}
          {new Date().toLocaleDateString()}. This letter serves as the formal
          agreement between the alumnus providing the scholarship and the
          student recipient with the administrator as the witness.
        </Text>
      </View>

      <Text style={{ fontWeight: "bold" }}>
        Written below are the details of the two parties involved in this
        scholarship agreement:
      </Text>

      {/* Student info */}
      <View style={styles.section}>
        <Text style={styles.paragraph}>Student Name: {student.name}</Text>

        <Text style={styles.paragraph}>
          Student Number: {student.studentNumber}
        </Text>

        <Text style={styles.paragraph}>Age: {student.age}</Text>

        <Text style={styles.paragraph}>Address: {student.address}</Text>

        <Text style={styles.paragraph}>
          Email Address: {student.emailAddress}
        </Text>

        <Text style={styles.paragraph}>Address: {student.address}</Text>

        <Text style={styles.paragraph}>
          Student's background:
          {student.background}
        </Text>
      </View>

      {/* Alum Info */}
      <View>
        <Text style={styles.paragraph}>
          Sponsor: {alum.firstName} {alum.lastName}{" "}
        </Text>

        <Text style={styles.paragraph}>
          Student Number: {alum.studentNumber}
        </Text>

        <Text style={styles.paragraph}>Age: {alum.age}</Text>

        <Text style={styles.paragraph}>
          Address: {alum.address[0]}, {alum.address[1]}, {alum.address[2]}
        </Text>

        <Text style={styles.paragraph}>Email Address: {alum.email}</Text>
      </View>
    </Page>
  </Document>
);

//generate and upload PDF to Firebase Storage
export const uploadDocToFirebase = async (
  scholarshipStudent: ScholarshipStudent,
  student: Student,
  alum: Alumnus
) => {
  try {
    // Generate the PDF as a Blob
    const pdfBlob = await pdf(
      <ScholarshipStudentPDF
        scholarshipStudent={scholarshipStudent}
        student={student}
        alum={alum}
      />
    ).toBlob();

    // Upload the Blob to Firebase Storage
    const document = new File([pdfBlob], `scholarshipAgreement.pdf`, {
      type: "application/pdf",
    });

    const data = await uploadDocument(
      document,
      `scholarship/${scholarshipStudent.ScholarshipStudentId}`
    ); //ITO YUNG PINAKAFUNCTION NA IUUTILIZE
    // 1st parameter is the actual document, 2nd is yung path sa firebase storage. Bale icustomize niyo na lang ito based sa klase ng image na iuupload niyo.
    // Kapag proof ng work exp ng alumni, magiging await uploadDocument(document, `alumni/${alumniId}`)"
    //(please take a look sa firebase console).

    //Pero, need pa ng attribute na documentURL or kayo bahala sa name (if ever na wala pa) para ma-save sa database. So, iupdate niyo na lang yun sa database after uploading the document.

    //Example: Sa backend niyo, especially sa pagcreate/update ng work experience:
    // await updateDoc(docRef, { docURL: data.url });
    //Ang data.url ay URL ng uploaded document which is nirereturn ng uploadDocument function.

    if (data.success) {
      //setIsError(false);
      //setMessage("Document uploaded successfully!");
      console.log("Document URL:", data.url);
      const workRef = doc(
        db,
        "scholarship_student",
        scholarshipStudent.ScholarshipStudentId
      );
      const workDoc = await getDoc(workRef);

      //set image attribute as the alum photo url
      if (workDoc.exists()) {
        await updateDoc(workRef, { pdf: data.url });
      }
    } else {
      //setMessage(data.result);
      //setIsError(true);
      console.log(data.result);
    }
  } catch (error) {
    console.error("Error uploading document:", error);
    // setMessage("Error uploading document");
    // setIsError(true);
  }
};
