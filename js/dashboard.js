import { db, auth } from "./firebase.js";
import { collection, query, onSnapshot, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// DOM Elements
const totalCountEl = document.getElementById("totalCount");
const timeSavedEl = document.getElementById("timeSaved");
const tableBody = document.getElementById("evalTableBody");

// Insights
const weakAreaText = document.getElementById("weakAreaText");
const strengthText = document.getElementById("strengthText");
const actionText = document.getElementById("actionText");

// Notes
const teacherNotes = document.getElementById("teacherNotes");
const saveNotesBtn = document.getElementById("saveNotesBtn");

// Buttons
const logoutBtn = document.getElementById("logoutBtn");
const newEvalBtn = document.getElementById("newEvalBtn");

auth.onAuthStateChanged(async (user) => {
  if (user) {
    console.log("Teacher Connected:", user.email);

    // 1. LOAD NOTES
    const noteRef = doc(db, "teacher_notes", user.uid);
    try {
        const noteSnap = await getDoc(noteRef);
        if (noteSnap.exists() && teacherNotes) {
            teacherNotes.value = noteSnap.data().text || "";
        }
    } catch (e) { console.error(e); }

    // 2. LOAD EVALUATIONS
    const q = query(collection(db, "evaluations")); 

    onSnapshot(q, (snapshot) => {
      let total = 0; // Reset total
      let totalScore = 0;
      let rows = "";
      
      if (tableBody) tableBody.innerHTML = "";

      if (snapshot.empty) {
        if(tableBody) tableBody.innerHTML = "<tr><td colspan='5' style='text-align:center; padding:20px;'>No evaluations found.</td></tr>";
        if(totalCountEl) totalCountEl.innerText = "0";
        return;
      }

      snapshot.forEach((doc) => {
        const data = doc.data();

        // 🔥 FILTER: Agar ID nahi hai, toh skip karo (Unknown wala issue fix)
        if (!data.studentId || data.studentId === "Unknown") {
            return;
        }

        // Agar data sahi hai, tabhi count badhao
        total++;
        
        let scoreVal = parseFloat(data.score) || 0;
        totalScore += scoreVal;

        // Strength Logic
        let strength = "Basics";
        let weakness = "Details";
        let badgeClass = "badge-yellow";

        if(scoreVal >= 8) {
            strength = "Concept Clarity";
            weakness = "None";
            badgeClass = "badge-green";
        } else if (scoreVal < 5) {
            strength = "Attempted";
            weakness = "Core Logic";
            badgeClass = "badge-red";
        }

        // Clean ID
        let studentId = data.studentId.replace(/\.(jpg|jpeg|png)/gi, '');
        let dateStr = data.date ? new Date(data.date).toLocaleDateString() : "Recent";

        rows += `
          <tr>
            <td><strong>#${studentId}</strong></td>
            <td><span class="badge ${badgeClass}">${data.score || 0}</span></td>
            <td>${strength}</td>
            <td>${weakness}</td>
            <td style="color:#94a3b8;">${dateStr}</td>
          </tr>
        `;
      });

      if(tableBody) tableBody.innerHTML = rows || "<tr><td colspan='5' style='text-align:center;'>Waiting for valid data...</td></tr>";
      if(totalCountEl) totalCountEl.innerText = total;
      if(timeSavedEl) timeSavedEl.innerText = ((total * 15) / 60).toFixed(1) + " hrs";

      // Insights Calculation
      const avg = total > 0 ? (totalScore / total).toFixed(1) : 0;
      
      if(weakAreaText && strengthText && actionText) {
          if(avg > 7.5) {
              weakAreaText.innerText = "Advanced Problems";
              strengthText.innerText = "Strong Concepts";
              actionText.innerText = "Give tougher questions";
              strengthText.style.color = "#22c55e";
          } else if (avg < 5) {
              weakAreaText.innerText = "Basic Definitions";
              strengthText.innerText = "Handwriting";
              actionText.innerText = "Revise Fundamentals";
              weakAreaText.style.color = "#ef4444";
          } else {
              weakAreaText.innerText = "Structure";
              strengthText.innerText = "Accuracy";
              actionText.innerText = "Focus on formatting";
              weakAreaText.style.color = "#facc15";
          }
      }
    });

  } else {
    window.location.href = "index.html"; 
  }
});

// Save Notes
if(saveNotesBtn) {
    saveNotesBtn.onclick = async () => {
        const user = auth.currentUser;
        if(!user) return alert("Please login first");
        
        const originalText = saveNotesBtn.innerText;
        saveNotesBtn.innerText = "Saving...";
        saveNotesBtn.disabled = true;
        
        try {
            await setDoc(doc(db, "teacher_notes", user.uid), {
                text: teacherNotes.value,
                updatedAt: new Date().toISOString()
            }, { merge: true });

            saveNotesBtn.innerText = "Saved ✅";
            saveNotesBtn.style.backgroundColor = "#10b981";

            setTimeout(() => {
                saveNotesBtn.innerText = "💾 Save Notes";
                saveNotesBtn.style.backgroundColor = "#22c55e";
                saveNotesBtn.disabled = false;
            }, 2000);

        } catch (e) {
            console.error(e);
            saveNotesBtn.innerText = "Error ❌";
            setTimeout(() => {
                saveNotesBtn.innerText = originalText;
                saveNotesBtn.disabled = false;
            }, 2000);
        }
    };
}

if(logoutBtn) {
    logoutBtn.onclick = () => {
        signOut(auth).then(() => window.location.href = "index.html");
    };
}

if(newEvalBtn) {
    newEvalBtn.onclick = () => {
        window.location.href = "evaluate.html";
    };
}