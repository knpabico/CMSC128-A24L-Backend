import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import type { Alumnus, ScholarshipStudent, Student } from "@/models/models";
import { uploadDocument } from "@/lib/upload";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    padding: 72, // 1 inch margin (72 points = 1 inch)
    fontSize: 11,
    fontFamily: "Times-Roman",
    lineHeight: 1.5,
  },
  section: {
    marginBottom: 10,
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
  headerContainer: {
    position: "absolute",
    top: 72, // 1 inch from top
    left: 72, // 1 inch from left
    right: 72, // 1 inch from right
    height: 60,
    marginBottom: 20,
  },
  grayRectangle: {
    backgroundColor: "#D3D3D3",
    width: "50%",
    height: 15,
    position: "absolute",
    left: "25%",
    top: 5,
  },
  grayRectangle2: {
    backgroundColor: "#D3D3D3",
    width: "50%",
    height: 15,
    position: "absolute",
    left: "25%",
    top: 30,
  },
  redCircle: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#791C1F", // Darker red to match image
    borderWidth: 10,
    borderColor: "#124A2B",
    top: 0,
    left: 0,
  },
  blueCircle: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#0856BA", // Darker blue to match image
    top: 0,
    right: 0,
  },
  contentContainer: {
    marginTop: 80, // Add space for the header
  },
});

// Helper function to get day suffix (st, nd, rd, th)
const getDaySuffix = (day: number): string => {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
};

// Auto-generated PDF for scholarshipStudent
const ScholarshipStudentPDF = ({
  scholarshipStudent,
  student,
  alum,
}: {
  scholarshipStudent: ScholarshipStudent;
  student: Student;
  alum: Alumnus;
}) => {
  // Format current date
  const currentDate = new Date();
  const day = currentDate.getDate();
  const month = currentDate.toLocaleString("default", { month: "long" });
  const year = currentDate.getFullYear();
  const formattedDate = `${day}${getDaySuffix(day)} of ${month}, ${year}`;

  return (
    <Document>
      <Page size="LEGAL" style={styles.page}>
        {/* Header with gray rectangle and circles */}
        <View style={styles.headerContainer}>
          <View style={styles.grayRectangle} />
          <View style={styles.grayRectangle2} />
          <View style={styles.redCircle} />
          <View style={styles.blueCircle} />
        </View>

        <View style={styles.contentContainer}>
          {/* Title */}
          <Text
            style={[styles.title, { textAlign: "center", marginBottom: 20 }]}
          >
            SCHOLARSHIP AGREEMENT
          </Text>

          {/* Introduction */}
          <View style={styles.section}>
            <Text style={styles.paragraph}>
              This Scholarship Agreement is entered into on the {formattedDate},
              by and between {alum.firstName} {alum.lastName}, a sponsor and
              alumnus of the Institute of Computer Science, and {student.name},
              a student of the same institute.
            </Text>

            <Text style={styles.paragraph}>
              {student.name}, with student number {student.studentNumber},
              resides in {student.address} and may be contacted via email at{" "}
              {student.emailAddress}. They are currently enrolled at the
              Institute of Computer Science and have demonstrated both academic
              excellence and a strong commitment to the field of Computer
              Science.
            </Text>

            <Text style={styles.paragraph}>
              {alum.firstName} {alum.lastName}, with student number{" "}
              {alum.studentNumber}, resides in {alum.address[0]},{" "}
              {alum.address[1]}, {alum.address[2]} and may be contacted via
              email at {alum.email}. As a graduate of the Institute of Computer
              Science, the Sponsor expresses their intention to support students
              who demonstrate potential and dedication to their academic
              pursuits.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.paragraph}>
              <Text style={{ fontWeight: "bold" }}>WHEREAS</Text>, the
              Sponsor/Alumnus desires to support the Student for educational
              purposes in accordance with the terms outlined in this Agreement;
              and
            </Text>

            <Text style={styles.paragraph}>
              <Text style={{ fontWeight: "bold" }}>WHEREAS</Text>, the Student
              has shown academic promise and a sincere commitment to the
              discipline of Computer Science;
            </Text>

            <Text style={styles.paragraph}>
              <Text style={{ fontWeight: "bold" }}>NOW, THEREFORE</Text>, in
              consideration of the mutual promises and obligations set forth
              herein, the parties agree to the following terms:
            </Text>
          </View>

          {/* Terms */}
          <View style={styles.section}>
            <Text style={[styles.paragraph, { fontWeight: "bold" }]}>
              1. Scholarship Support
            </Text>
            <Text style={[styles.paragraph, { marginLeft: 20 }]}>
              The Sponsor/Alumnus agrees to provide scholarship support to the
              Student to aid in the pursuit of education at the Institute of
              Computer Science. The support may come in the form of educational
              resources or financial assistance, as mutually agreed upon by both
              parties, and is intended solely for academic use.
            </Text>

            <Text
              style={[styles.paragraph, { fontWeight: "bold", marginTop: 10 }]}
            >
              2. Academic Obligations of the Student
            </Text>
            <Text style={[styles.paragraph, { marginLeft: 20 }]}>
              The Student agrees to maintain the minimum grade point average
              required by the Institute and to remain in good academic standing
              throughout the duration of the scholarship. The Student further
              agrees to provide the Sponsor with periodic updates regarding
              academic progress, including but not limited to grade reports and
              notable achievements.
            </Text>

            <Text
              style={[styles.paragraph, { fontWeight: "bold", marginTop: 10 }]}
            >
              3. Duration of Agreement
            </Text>
            <Text style={[styles.paragraph, { marginLeft: 20 }]}>
              This Agreement shall remain in effect for the duration of the
              Student's enrollment at the Institute of Computer Science,
              provided the Student continues to comply with the terms outlined
              herein.
            </Text>
          </View>

          {/* Signature */}
          <View style={[styles.section]}>
            <Text style={styles.paragraph}>
              <Text style={{ fontWeight: "bold" }}>IN WITNESS WHEREOF</Text>,
              the parties have executed this Agreement on the date first written
              above.
            </Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 45,
                marginLeft: 20,
                marginRight: 20,
              }}
            >
              <Text>
                {alum.firstName} {alum.lastName}
              </Text>
              <Text>{student.name}</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

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
