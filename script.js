const plannerAlarm = new Audio("alarm.mp3");
plannerAlarm.preload = "auto";

const loginBtn = document.getElementById("loginBtn");
const loginModal = document.getElementById("loginModal");
const closeModal = document.getElementById("closeModal");

// Modal open karne ke liye
if (loginBtn) {
    loginBtn.onclick = function () {
        loginModal.style.display = "flex";
    };
}

// Close button se modal band karne ke liye
if (closeModal) {
    closeModal.onclick = function () {
        loginModal.style.display = "none";
    };
}

// Modal ke bahar click karne par band karne ke liye
window.onclick = function (e) {
    if (e.target === loginModal) {
        loginModal.style.display = "none";
    }
};

const openSignup = document.getElementById("openSignup");
const signupName = document.getElementById("signupName");
let signupMode = false;

// Signup aur Login mode toggler
if (openSignup) {
    openSignup.onclick = function(e){
        e.preventDefault();
        signupMode = !signupMode;
        if(signupMode){
            signupName.style.display = "block";
            document.getElementById("loginSubmit").innerText = "Create Account";
            openSignup.innerText = "Login";
        }else{
            signupName.style.display = "none";
            document.getElementById("loginSubmit").innerText = "Login";
            openSignup.innerText = "Sign Up";
        }
    };
}

const loginSubmit = document.getElementById("loginSubmit");

if (loginSubmit) {
    // Signup Handler
    loginSubmit.addEventListener("click", function () {
        if (signupMode) {
            const user = {
                name: signupName.value,
                email: document.getElementById("loginEmail")?.value || "",
                password: document.getElementById("loginPassword")?.value || ""
            };
            localStorage.setItem("studyboostUser", JSON.stringify(user));
            alert("✅ Account Created Successfully!");
        }
    });

    // Login Handler
    loginSubmit.addEventListener("click", function () {
        if (!signupMode) {
            const loginEmail = document.getElementById("loginEmail");
            const loginPassword = document.getElementById("loginPassword");
            const user = JSON.parse(localStorage.getItem("studyboostUser"));
            if (
                user &&
                loginEmail && loginPassword &&
                user.email === loginEmail.value &&
                user.password === loginPassword.value
            ) {
                alert("🎉 Login Successful!");
                isLoggedIn = true;
                localStorage.setItem("isLoggedIn", "true");
                currentUser = user.name;
                loginModal.style.display = "none";
                updateUserUI();
            } else {
                alert("❌ Invalid Email or Password");
            }
        }
    });
}

// User UI update karne ka function
function updateUserUI() {
    const user = JSON.parse(localStorage.getItem("studyboostUser"));
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    const loginBtn = document.getElementById("loginBtn");
    const appLogin = document.getElementById("appLogin");
    const welcomeUser = document.getElementById("welcomeUser");
    const logoutBtn = document.getElementById("logoutBtn");

    if (user && loggedIn) {
        if (loginBtn) loginBtn.style.display = "none";
        if (appLogin) appLogin.style.display = "none";
        if (welcomeUser) {
            welcomeUser.style.display = "inline-block";
            welcomeUser.innerText = "👋 " + user.name;
        }
        if (logoutBtn) logoutBtn.style.display = "inline-block";
        if (document.getElementById("guestBanner")) document.getElementById("guestBanner").style.display = "none";
        if (document.getElementById("guestCard")) document.getElementById("guestCard").style.display = "none";
        if (document.getElementById("studentMode")) document.getElementById("studentMode").style.display = "block";
    } else {
        if (loginBtn) loginBtn.style.display = "inline-block";
        if (appLogin) appLogin.style.display = "inline-block";
        if (welcomeUser) {
            welcomeUser.style.display = "none";
            welcomeUser.innerText = "";
        }
        if (logoutBtn) logoutBtn.style.display = "none";
        if (document.getElementById("guestBanner")) document.getElementById("guestBanner").style.display = "block";
        if (document.getElementById("guestCard")) document.getElementById("guestCard").style.display = "block";
        if (document.getElementById("studentMode")) document.getElementById("studentMode").style.display = "none";
    }
}

updateUserUI();

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.onclick = function () {
        localStorage.setItem("isLoggedIn", "false");
        alert("👋 Logged Out Successfully!");
        location.reload();
    };
}

const askAI = document.getElementById("askAI");
const questionInput = document.getElementById("questionInput");

if (questionInput) {
    questionInput.addEventListener("keypress", function(e){
        if(e.key === "Enter"){
            e.preventDefault();
            if (askAI) askAI.click();
        }
    });
}
const aiAnswer = document.getElementById("aiAnswer");

async function askGroq(question) {
    const response = await fetch("https://studyboost-api.mauryaarpit2406.workers.dev", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            question: `
Answer this question in PREMIUM StudyBoost Hub AI format.

Rules:
- Use simple English.
- Use short paragraphs.
- Use proper headings.
- Make important words bold using **bold**.
- Underline important terms using <u>underline</u>.
- Use bullet points.
- Never write huge paragraphs.
- Keep the answer mobile friendly.
- Add emojis only in headings.
- Explain like a premium study app.

Question:
${question}
`
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "No response");
    }

    return data.answer;
}

async function askGroqNotes(topic) {
    return await askGroq(
        "Create well-structured study notes on the topic: " +
        topic +
        ". Use simple English, proper headings, bullet points and explain for students."
    );
}

if (askAI) {
    askAI.addEventListener("click", async function () {
        const loggedIn = localStorage.getItem("isLoggedIn") === "true";

        if (!loggedIn) {
            if (guestAI <= 0) {
                alert("🔒 Please Login for Unlimited AI Questions.");
                loginModal.style.display = "flex";
                return;
            }
            guestAI--;
            document.getElementById("guestAI").innerText = guestAI;
        }

        const question = questionInput.value.trim().toLowerCase();
        localStorage.setItem("lastQuestion", question);

        updateRecentActivity(question);
        updateGoal();
        totalQuestions++;
        localStorage.setItem("totalQuestions", totalQuestions);
        if (questionsCount) questionsCount.innerText = totalQuestions;
        updateProgress();
        updateAchievement();
        updateXP();

        if (question === "") {
            aiAnswer.innerHTML = `
<div class="premium-ai-answer">
<div class="ai-title">⚠️ Empty Question</div>
<div class="ai-divider"></div>
<div class="ai-content">Please enter your question first.</div>
</div>`;
            return;
        }

        aiAnswer.innerHTML = `
        <div class="ai-thinking">
        🤖 Thinking...
        <div class="ai-dot"></div>
        <div class="ai-dot"></div>
        <div class="ai-dot"></div>
        </div>`;

        try {
            const answer = await askGroq(question);

            aiAnswer.innerHTML = `
<div class="premium-ai-answer">
<div class="ai-title">🤖 AI Response</div>
<div class="ai-divider"></div>
<div class="ai-content">
${answer
.replace(/^### (.*)$/gm,"<h3>$1</h3>")
.replace(/^## (.*)$/gm,"<h2>$1</h2>")
.replace(/^# (.*)$/gm,"<h1>$1</h1>")
.replace(/\*\*(.*?)\*\*/g,"<b>$1</b>")
.replace(/\*(.*?)\*/g,"<i>$1</i>")
.replace(/^- (.*)$/gm,"• $1")
.replace(/\n/g,"<br>")
}
</div>
<div class="ai-divider"></div>
<div class="ai-footer">
<span>⚡ Powered by Groq AI</span>
<span>🎓 StudyBoost Hub AI</span>
</div>
</div>`;
            if (copyBtn) copyBtn.style.display = "inline-block";
            if (clearBtn) clearBtn.style.display = "inline-block";
            return;
        }
        catch (error) {
            alert("ERROR: " + error.message);
            console.log(error);
        }
    });
}

const copyBtn = document.getElementById("copyAnswer");
const clearBtn = document.getElementById("clearAnswer");

if (copyBtn) {
    copyBtn.addEventListener("click", function () {
        const answer = aiAnswer.innerText;
        if(answer.trim() === ""){
            alert("⚠️ No answer to copy.");
            return;
        }
        navigator.clipboard.writeText(answer);
        alert("✅ Answer copied successfully!");
    });
}

if (clearBtn) {
    clearBtn.addEventListener("click", function(){
        aiAnswer.innerHTML = "Your AI answer will appear here...";
        copyBtn.style.display = "none";
        clearBtn.style.display = "none";
        if (questionInput) questionInput.value = "";
    });
}

const dashboardName = document.getElementById("dashboardName");
const user = JSON.parse(localStorage.getItem("studyboostUser"));
const loggedIn = localStorage.getItem("isLoggedIn") === "true";

if(user && loggedIn){
    if (dashboardName) dashboardName.innerText = "👋 Welcome, " + user.name;
    if (document.getElementById("profileName")) document.getElementById("profileName").innerText = "👋 Welcome, " + user.name;
    const today = new Date().toLocaleDateString();
    if (document.getElementById("lastLogin")) document.getElementById("lastLogin").innerText = today;
} else {
    if (dashboardName) dashboardName.innerText = "👋 Welcome Student";
    if (document.getElementById("profileName")) document.getElementById("profileName").innerText = "👋 Welcome";
}

const questionsCount = document.getElementById("questionsCount");
let totalQuestions = localStorage.getItem("totalQuestions") || 0;
if (questionsCount) questionsCount.innerText = totalQuestions;

const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");

function updateProgress(){
    let progress = totalQuestions * 5;
    if(progress > 100){
        progress = 100;
    }
    if (progressFill) progressFill.style.width = progress + "%";
    if (progressText) progressText.innerText = progress + "%";
}
updateProgress();

const achievementBadge = document.getElementById("achievementBadge");

function updateAchievement(){
    if (!achievementBadge) return;
    if(totalQuestions >= 25){
        achievementBadge.innerHTML = "🥇 Study Master";
    }
    else if(totalQuestions >= 10){
        achievementBadge.innerHTML = "🥈 Learner";
    }
    else if(totalQuestions >= 1){
        achievementBadge.innerHTML = "🥉 First Question Completed";
    }
    else{
        achievementBadge.innerHTML = "🔒 No Achievement Yet";
    }
}
updateAchievement();

const userLevel = document.getElementById("userLevel");
const xpText = document.getElementById("xpText");

function updateXP(additionalXP = 0){
    let xp = (totalQuestions * 10) + additionalXP;
    if (xpText) xpText.innerText = "XP : " + xp;
    if (userLevel) {
        if(xp >= 500){
            userLevel.innerText = "🏆 Expert";
        }
        else if(xp >= 250){
            userLevel.innerText = "🟣 Advanced";
        }
        else if(xp >= 100){
            userLevel.innerText = "🔵 Intermediate";
        }
        else{
            userLevel.innerText = "🟢 Beginner";
        }
    }
}
updateXP();

const lastQuestion = document.getElementById("lastQuestion");
const activityStatus = document.getElementById("activityStatus");

function updateRecentActivity(question){
    if (lastQuestion) lastQuestion.innerText = question;
    if (activityStatus) activityStatus.innerText = "✅ Answer Generated";
}

const savedQuestion = localStorage.getItem("lastQuestion");
if(savedQuestion){
    if (lastQuestion) lastQuestion.innerText = savedQuestion;
    if (activityStatus) activityStatus.innerText = "✅ Answer Generated";
}

const goalProgress = document.getElementById("goalProgress");
const goalFill = document.getElementById("goalFill");

function updateGoal(){
    let completed = totalQuestions;
    if(completed > 10){
        completed = 10;
    }
    if (goalProgress) goalProgress.innerText = completed + " / 10 Questions Completed";
    if (goalFill) goalFill.style.width = (completed * 10) + "%";
}
updateGoal();

const resetDashboard = document.getElementById("resetDashboard");
if (resetDashboard) {
    resetDashboard.addEventListener("click", function(){
        if(confirm("Reset all dashboard progress?")){
            localStorage.removeItem("totalQuestions");
            localStorage.removeItem("lastQuestion");
            localStorage.removeItem("quizStats");
            totalQuestions = 0;
            if (questionsCount) questionsCount.innerText = 0;
            updateProgress();
            updateAchievement();
            updateXP();
            updateGoal();
            
            quizStats = { attempts: 0, totalScore: 0, recentQuizzes: [] };
            renderQuizStatsUI();

            if (lastQuestion) lastQuestion.innerText = "No question asked yet.";
            if (activityStatus) activityStatus.innerText = "⏳ Waiting...";
            alert("✅ Dashboard Reset Successfully!");
        }
    });
}

const notesTopic = document.getElementById("notesTopic");
const generateNotes = document.getElementById("generateNotes");
const notesResult = document.getElementById("notesResult");
const historyList = document.getElementById("historyList");
const notesCount = document.getElementById("notesCount");
const copyNotes = document.getElementById("copyNotes");
const clearNotes = document.getElementById("clearNotes");
const downloadNotes = document.getElementById("downloadNotes");

if (generateNotes) {
    generateNotes.addEventListener("click", async function(){
        const loggedIn = localStorage.getItem("isLoggedIn") === "true";

        if (!loggedIn) {
            if (guestNotes <= 0) {
                alert("🔒 Please Login for Unlimited Notes.");
                loginModal.style.display = "flex";
                return;
            }
            guestNotes--;
            document.getElementById("guestNotes").innerText = guestNotes;
        }

        const topic = notesTopic.value.trim().toLowerCase();
        addToHistory(topic);
        updateNotesCounter();
        
        if (copyNotes) copyNotes.style.display = "none";
        if (clearNotes) clearNotes.style.display = "inline-block";
        if (downloadNotes) downloadNotes.style.display = "inline-block";

        if(topic === ""){
            notesResult.innerHTML = "⚠️ Please enter a topic.";
            return;
        }

        try {
            notesResult.innerHTML = `
            <div class="notes-loading">
            📝 Generating Smart Notes...
            </div>`;
            const notes = await askGroqNotes(topic);
            notesResult.innerHTML = `
<div class="premium-notes">
${notes
.replace(/\*\*(.*?)\*\*/g,"<b>$1</b>")
.replace(/^# (.*)$/gm,"<h1>$1</h1>")
.replace(/^## (.*)$/gm,"<h2>$1</h2>")
.replace(/^### (.*)$/gm,"<h3>$1</h3>")
.replace(/^- (.*)$/gm,"• $1")
.replace(/\n/g,"<br>")}
</div>`;
            if (copyNotes) copyNotes.style.display = "inline-block";
            if (clearNotes) clearNotes.style.display = "inline-block";
            if (downloadNotes) downloadNotes.style.display = "inline-block";
            return;
        } 
        catch (error) {
            alert("ERROR: " + error.message);
            console.log(error);
        }
    });
}

if (copyNotes) {
    copyNotes.addEventListener("click", function(){
        navigator.clipboard.writeText(notesResult.innerText);
        alert("✅ Notes Copied Successfully!");
    });
}

if (clearNotes) {
    clearNotes.addEventListener("click", function(){
        notesTopic.value = "";
        notesResult.innerHTML = "Your notes will appear here...";
        copyNotes.style.display = "none";
        clearNotes.style.display = "none";
        downloadNotes.style.display = "none";
    });
}

if (downloadNotes) {
    downloadNotes.addEventListener("click", function(){
        const text = notesResult.innerText;
        const blob = new Blob([text], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "StudyBoost_Notes.txt";
        link.click();
    });
}

function addToHistory(topic){
    if (!historyList) return;
    let history = JSON.parse(localStorage.getItem("notesHistory")) || [];
    history.unshift(topic);
    history = history.slice(0,5);
    localStorage.setItem("notesHistory", JSON.stringify(history));
    historyList.innerHTML = "";
    history.forEach(function(item){
        historyList.innerHTML += "<li>📖 " + item + "</li>";
    });
}

const savedHistory = JSON.parse(localStorage.getItem("notesHistory")) || [];
if(savedHistory.length > 0 && historyList){
    historyList.innerHTML = "";
    savedHistory.forEach(function(item){
        historyList.innerHTML += "<li>📖 " + item + "</li>";
    });
}

let totalNotes = localStorage.getItem("totalNotes") || 0;
if (notesCount) notesCount.innerText = totalNotes;

function updateNotesCounter(){
    totalNotes++;
    localStorage.setItem("totalNotes", totalNotes);
    if (notesCount) notesCount.innerText = totalNotes;
}

// Interactive Quiz Logic
let currentQuizData = [];
let userAnswers = {};

function escapeHTML(str) {
    if (!str) return '';
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

async function generateQuiz() {
    const topicInput = document.getElementById('quizTopic');
    const quizOutput = document.getElementById('quizResult');
    const topic = topicInput ? topicInput.value.trim() : '';

    if (!topic) {
        alert("Please enter a topic to generate the quiz!");
        return;
    }

    if (quizOutput) {
        quizOutput.innerHTML = `
            <div style="text-align:center; padding: 20px;">
                <p style="font-size: 1.1rem; font-weight: bold;">Generating 10 MCQs for "${escapeHTML(topic)}"... ⏳</p>
                <p style="color: #666;">Please wait a few seconds!</p>
            </div>
        `;
    }

    const prompt = `Generate a quiz on the topic "${topic}" with strictly 10 multiple-choice questions.
Respond ONLY with a valid JSON array of objects. Do not include markdown formatting, backticks, or extra commentary.

JSON Format:
[
  {
    "id": 1,
    "question": "Question text here?",
    "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
    "correctAnswer": "B"
  }
]`;

    try {
        const response = await fetch("https://studyboost-api.mauryaarpit2406.workers.dev", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question: prompt })
        });

        if (!response.ok) throw new Error("Server error");

        const data = await response.json();
        let rawText = data.answer || data.response || data.reply || data.text || JSON.stringify(data);

        const cleanJSON = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
        currentQuizData = JSON.parse(cleanJSON);
        userAnswers = {};

        renderInteractiveQuiz();
   } catch (error) {
        console.error("Quiz Error:", error);
        if (quizOutput) {
            quizOutput.innerHTML = `
                <div style="text-align:center; padding: 15px; color: #d32f2f;">
                    <p style="font-weight: bold;">Failed to generate quiz. Please try again!</p>
                    <button type="button" style="margin-top:10px; padding:6px 12px; cursor:pointer;" onclick="generateQuiz()">🔄 Retry</button>
                </div>
            `;
        }
    }
}

const generateQuizBtn = document.getElementById("generateQuiz");
if (generateQuizBtn) {
    generateQuizBtn.onclick = generateQuiz;
}

function renderInteractiveQuiz() {
    const quizOutput = document.getElementById('quizResult');
    if (!quizOutput) return;

    let html = `
        <div class="interactive-quiz-wrapper" style="width:100%; display:flex; flex-direction:column; gap:15px; margin-top:15px;">
    `;

    currentQuizData.forEach((q, qIndex) => {
        html += `
            <div class="quiz-card-box" id="q-card-${qIndex}" style="border: 1px solid #ddd; border-radius: 8px; padding: 12px; background: #fff; text-align: left;">
                <h4 class="q-title" style="margin-top:0; color:#2e7d32; font-size:1rem;">${qIndex + 1}. ${escapeHTML(q.question)}</h4>
                <div class="options-container" style="display:flex; flex-direction:column; gap:6px;">
        `;

        q.options.forEach((opt) => {
            const letter = opt.trim().charAt(0).toUpperCase();
            html += `
                <button type="button" 
                        class="quiz-opt-btn opt-btn-${qIndex}" 
                        style="text-align:left; padding:8px 12px; border:1px solid #ccc; background:#f9f9f9; border-radius:6px; cursor:pointer; width:100%; font-size:0.9rem;"
                        onclick="selectQuizOption(${qIndex}, '${letter}', this)">
                    ${escapeHTML(opt)}
                </button>
            `;
        });

        html += `
                </div>
                <div class="q-feedback" id="feedback-${qIndex}" style="display:none; margin-top:8px; padding:6px; border-radius:4px; font-size:0.85rem;"></div>
            </div>
        `;
    });

    html += `
        <div style="display:flex; gap:10px; margin-top:10px; justify-content:center;">
            <button id="submitQuizBtn" type="button" style="background:#2196F3; color:white; border:none; padding:10px 20px; border-radius:6px; font-weight:bold; cursor:pointer;" onclick="submitInteractiveQuiz()">✅ Submit & Check Answers</button>
            <button type="button" style="background:#757575; color:white; border:none; padding:10px 15px; border-radius:6px; cursor:pointer;" onclick="resetQuizInput()">🗑️ Clear</button>
        </div>
        <div id="quizScoreResult" style="margin-top:10px;"></div>
    </div>`;

    quizOutput.innerHTML = html;
}

function selectQuizOption(qIndex, letter, btnElement) {
    userAnswers[qIndex] = letter;

    const buttons = document.querySelectorAll(`.opt-btn-${qIndex}`);
    buttons.forEach(btn => {
        btn.style.background = '#f9f9f9';
        btn.style.borderColor = '#ccc';
        btn.style.fontWeight = 'normal';
    });
    
    btnElement.style.background = '#e3f2fd';
    btnElement.style.borderColor = '#2196F3';
    btnElement.style.fontWeight = 'bold';
}

let quizStats = JSON.parse(localStorage.getItem('quizStats')) || {
    attempts: 0,
    totalScore: 0,
    recentQuizzes: []
};

function renderQuizStatsUI() {
    const quizCountEl = document.getElementById('quizCount');
    if (quizCountEl) quizCountEl.innerText = quizStats.attempts;

    const quizScoreEl = document.getElementById('quizScore');
    if (quizScoreEl) quizScoreEl.innerText = quizStats.totalScore;

    const quizHistoryEl = document.getElementById('quizHistoryList');
    if (quizHistoryEl) {
        if (quizStats.recentQuizzes.length === 0) {
            quizHistoryEl.innerHTML = `<li>No quizzes yet</li>`;
        } else {
            let html = '';
            quizStats.recentQuizzes.forEach(item => {
                html += `
                    <li style="margin-bottom: 5px;">
                        📌 <strong>${escapeHTML(item.topic)}</strong>: ${item.score}/${item.total} pts
                    </li>
                `;
            });
            quizHistoryEl.innerHTML = html;
        }
    }
}

function submitInteractiveQuiz() {
    let score = 0;

    currentQuizData.forEach((q, qIndex) => {
        const userAns = userAnswers[qIndex];
        const correctAns = q.correctAnswer.trim().toUpperCase();
        const feedbackDiv = document.getElementById(`feedback-${qIndex}`);
        const buttons = document.querySelectorAll(`.opt-btn-${qIndex}`);

        buttons.forEach(btn => {
            btn.disabled = true;
            btn.style.cursor = 'default';
            
            const btnText = btn.innerText.trim();
            const btnLetter = btnText.charAt(0).toUpperCase();

            if (btnLetter === correctAns) {
                btn.style.background = '#d4edda';
                btn.style.borderColor = '#28a745';
                btn.style.color = '#155724';
                btn.style.fontWeight = 'bold';
            }
            if (userAns && btnLetter === userAns && userAns !== correctAns) {
                btn.style.background = '#f8d7da';
                btn.style.borderColor = '#dc3545';
                btn.style.color = '#721c24';
            }
        });
if (feedbackDiv) {
            if (userAns === correctAns) {
                score++;
                feedbackDiv.style.background = '#e8f5e9';
                feedbackDiv.innerHTML = `<span style="color: #2e7d32; font-weight:bold;">✔ Correct Answer!</span>`;
            } else {
                feedbackDiv.style.background = '#ffebee';
                feedbackDiv.innerHTML = `<span style="color: #c62828; font-weight:bold;">❌ Incorrect! Correct Answer is: Option ${correctAns}</span>`;
            }
            feedbackDiv.style.display = 'block';
        }
    });

    const topicInput = document.getElementById('quizTopic');
    const topicName = topicInput && topicInput.value.trim() ? topicInput.value.trim() : 'General Quiz';

    quizStats.attempts += 1;
    quizStats.totalScore += score;
    quizStats.recentQuizzes.unshift({
        topic: topicName,
        score: score,
        total: currentQuizData.length
    });

    if (quizStats.recentQuizzes.length > 5) {
        quizStats.recentQuizzes.pop();
    }

    localStorage.setItem('quizStats', JSON.stringify(quizStats));
    renderQuizStatsUI();

    const resultDiv = document.getElementById('quizScoreResult');
    if (resultDiv) {
        resultDiv.innerHTML = `
            <div style="text-align:center; padding:15px; background:#f0f4c3; border-radius:8px; border:1px solid #c0ca33;">
                <h3 style="margin:0 0 8px 0; color:#33691e;">🎉 Score: ${score} / ${currentQuizData.length}</h3>
                <button type="button" style="padding:6px 12px; border:none; background:#3949ab; color:white; border-radius:4px; cursor:pointer;" onclick="resetQuizInput()">✨ Next Quiz</button>
            </div>
        `;
    }

    const submitBtn = document.getElementById('submitQuizBtn');
    if (submitBtn) submitBtn.style.display = 'none';

    updateXP(score * 10);
}

document.addEventListener('DOMContentLoaded', renderQuizStatsUI);
renderQuizStatsUI();

function resetQuizInput() {
    currentQuizData = [];
    userAnswers = {};
    const topicInput = document.getElementById('quizTopic');
    if (topicInput) topicInput.value = '';
    const quizOutput = document.getElementById('quizResult');
    if (quizOutput) quizOutput.innerHTML = 'Your quiz will appear here...';
}

let guestAI = 3;
let guestNotes = 2;
let guestQuiz = 1;

const guestLoginBtn = document.getElementById("guestLoginBtn");
if (guestLoginBtn) {
    guestLoginBtn.addEventListener("click", function(){
        loginModal.style.display = "flex";
    });
}

const studentMode = document.getElementById("studentMode");
let isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
let currentUser = "Guest";

// Theme Switcher
const themeToggle = document.getElementById("themeToggle");
if (themeToggle) {
    themeToggle.onclick = function(){
        document.body.classList.toggle("dark-mode");
        if(document.body.classList.contains("dark-mode")){
            localStorage.setItem("theme","dark");
            themeToggle.innerText = "☀️ Light Mode";
        } else {
            localStorage.setItem("theme","light");
            themeToggle.innerText = "🌙 Dark Mode";
        }
    };
}

if(localStorage.getItem("theme") === "dark"){
    document.body.classList.add("dark-mode");
    if (themeToggle) themeToggle.innerText = "☀️ Light Mode";
}
// Get Started Landing Button
const getStartedBtn = document.getElementById("getStartedBtn");
if(getStartedBtn){
    getStartedBtn.addEventListener("click", function(){
        // Header/Navbar hide karna hai App Dashboard me
        if(document.querySelector("header")) document.querySelector("header").style.display="none";
        
        if(document.getElementById("guestBanner")) document.getElementById("guestBanner").style.display="none";
        if(document.getElementById("guestCard")) document.getElementById("guestCard").style.display="none";
        if(document.getElementById("landingPage")) document.getElementById("landingPage").style.display="none";
        if(document.getElementById("appHome")) document.getElementById("appHome").style.display="block";
        if(document.querySelector(".hero")) document.querySelector(".hero").style.display = "none";
        if(document.querySelector(".features")) document.querySelector(".features").style.display = "none";
        if(document.querySelector(".about")) document.querySelector(".about").style.display = "none";
        if(document.querySelector(".contact")) document.querySelector(".contact").style.display = "none";
        
        window.scrollTo(0,0);
    });
}
// ==========================================
// 🚀 NAVIGATION FIXED (DIRECT SCROLL & SHOW)
// ==========================================
function goToFeatureSection(sectionId) {
    // Header ko app view me hidden hi rakhna hai
    const header = document.querySelector("header");
    if (header) header.style.display = "none";

    const sec = document.getElementById(sectionId);
    if (sec) {
        sec.style.display = "block";
        sec.scrollIntoView({ behavior: "smooth" });
    }
}
document.getElementById("goAI")?.addEventListener("click", function () {
    goToFeatureSection("ai-section");
});
document.getElementById("goNotes")?.addEventListener("click", function () {
    goToFeatureSection("notes-section");
});
document.getElementById("goQuiz")?.addEventListener("click", function () {
    goToFeatureSection("quiz-section");
});
document.getElementById("goPlanner")?.addEventListener("click", function () {
    goToFeatureSection("planner-section");
});
document.getElementById("goVision")?.addEventListener("click", function () {
    goToFeatureSection("vision-section");
});
document.getElementById("goAIPlanner")?.addEventListener("click", function () {
    goToFeatureSection("planner-ai-section");
});
document.getElementById("appLogin")?.addEventListener("click", function () {
    if (loginModal) loginModal.style.display = "flex";
});

// Study Planner
const plannerTask = document.getElementById("plannerTask");
const addTask = document.getElementById("addTask");
const progressPercent = document.getElementById("progressPercent");
const plannerList = document.getElementById("plannerList");

let tasks = [];

function loadTasks() {
    const saved = localStorage.getItem("studyPlanner");
    tasks = saved ? JSON.parse(saved) : [];
}

function saveTasks() {
    localStorage.setItem("studyPlanner", JSON.stringify(tasks));
}

function renderTasks(){
    if (!plannerList) return;
    plannerList.innerHTML = "";
    tasks.forEach(function(task,index){
        plannerList.innerHTML += `
<li class="${task.completed ? "taskDone" : ""}">
    <strong>${task.text}</strong><br>
    📅 ${task.date} &nbsp; ⏰ ${task.time} <br>
    <button onclick="completeTask(${index})">✅</button>
    <button onclick="deleteTask(${index})">🗑</button>
</li>`;
    });

    let completed = tasks.filter(t => t.completed).length;
    let percent = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
    if (progressPercent) progressPercent.innerText = "📊 Progress: " + percent + "%";
}

loadTasks();
renderTasks();

if (addTask) {
    addTask.addEventListener("click", function(){
        const task = plannerTask.value.trim();
        const taskDate = document.getElementById("taskDate")?.value || "";
        const taskTime = document.getElementById("plannerTaskTime")?.value || "";

        if(task === ""){
            alert("⚠️ Please enter a study task.");
            return;
        }
        tasks.push({
            text: task,
            date: taskDate,
            time: taskTime,
            completed: false
        });
        
        saveTasks();
        plannerTask.value = "";
        renderTasks();
    });
}

function completeTask(index){
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    renderTasks();
}

function deleteTask(index){
    tasks.splice(index,1);
    saveTasks();
    renderTasks();
}
// AI Study Planner
const plannerPrompt = document.getElementById("plannerPrompt");
const generatePlanner = document.getElementById("generatePlanner");
const plannerResult = document.getElementById("plannerResult");
const copyPlanner = document.getElementById("copyPlanner");
const clearPlanner = document.getElementById("clearPlanner");

if (generatePlanner) {
    generatePlanner.addEventListener("click", async function(){
        const prompt = plannerPrompt.value.trim();
        if(prompt === ""){
            alert("⚠️ Please enter your goal.");
            return;
        }

        plannerResult.innerHTML = "🤖 AI is creating your study plan...";
        try{
            const plan = await askGroq("Create a day-wise study plan for: " + prompt);
            plannerResult.innerHTML = plan.replace(/\n/g,"<br>");
            if (copyPlanner) copyPlanner.style.display = "inline-block";
            if (clearPlanner) clearPlanner.style.display = "inline-block";
        }
        catch(error){
            plannerResult.innerHTML = "❌ Failed to generate study plan.";
        }
    });
}

copyPlanner?.addEventListener("click", function () {
    navigator.clipboard.writeText(plannerResult.innerText);
    alert("✅ AI Study Plan Copied!");
});

clearPlanner?.addEventListener("click", function () {
    if (plannerPrompt) plannerPrompt.value = "";
    if (plannerResult) plannerResult.innerHTML = "Your AI Study Plan will appear here...";
    if (copyPlanner) copyPlanner.style.display = "none";
    if (clearPlanner) clearPlanner.style.display = "none";
});
const backLanding = document.getElementById("backLanding");
if (backLanding) {
    backLanding.addEventListener("click", function () {
        // Landing page par wapas Header show kar do
        if(document.querySelector("header")) document.querySelector("header").style.display = "block";
        if(document.getElementById("appHome")) document.getElementById("appHome").style.display = "none";
        if(document.querySelector(".hero")) document.querySelector(".hero").style.display = "block";
        if(document.querySelector(".features")) document.querySelector(".features").style.display = "block";
        if(document.querySelector(".about")) document.querySelector(".about").style.display = "block";
        if(document.querySelector(".contact")) document.querySelector(".contact").style.display = "block";
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}
// AI Vision Studio
const VISION_API = "https://studyboost-vision.mauryaarpit2406.workers.dev/";
let currentVisionPrompt = "Describe this image in detail.";
let selectedVisionImage = null;

const visionCameraBtn = document.getElementById("visionCameraBtn");
const visionGalleryBtn = document.getElementById("visionGalleryBtn");
const visionImage = document.getElementById("visionImage");
const visionPreview = document.getElementById("visionPreview");
const visionActions = document.getElementById("visionActions");
const visionHeading = document.getElementById("visionHeading");
const visionResult = document.getElementById("visionResult");

if (visionCameraBtn && visionImage) {
    visionCameraBtn.addEventListener("click", () => {
        visionImage.setAttribute("capture", "environment");
        visionImage.click();
    });
}

if (visionGalleryBtn && visionImage) {
    visionGalleryBtn.addEventListener("click", () => {
        visionImage.removeAttribute("capture");
        visionImage.click();
    });
}

document.getElementById("visionSolve")?.addEventListener("click", () => {
    currentVisionPrompt = "Solve the question from the image directly.";
    selectedVisionImage ? sendVisionRequest() : visionImage?.click();
});

document.getElementById("visionGenerateNotes")?.addEventListener("click", () => {
    currentVisionPrompt = "Generate study notes from this image.";
    selectedVisionImage ? sendVisionRequest() : visionImage?.click();
});

if (visionImage) {
    visionImage.addEventListener("change", function () {
        const file = this.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            selectedVisionImage = e.target.result;
            if (visionActions) visionActions.style.display = "flex";
            if (visionHeading) visionHeading.style.display = "block";
            if (visionResult) visionResult.style.display = "block";

            if (visionPreview) {
                visionPreview.innerHTML = `<img src="${selectedVisionImage}" style="width:100%; max-height:250px; object-fit:cover; border-radius:8px;">`;
            }
            sendVisionRequest();
        };
        reader.readAsDataURL(file);
    });
}

function sendVisionRequest() {
    if (!selectedVisionImage) return;
    if (visionResult) visionResult.innerHTML = "🤖 AI is analyzing image...";

    fetch(VISION_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: currentVisionPrompt, image: selectedVisionImage })
    })
    .then(res => res.json())
    .then(data => {
        const answer = data.choices?.[0]?.message?.content || "❌ No response received.";
        if (visionResult) {
            visionResult.innerHTML = (typeof marked !== "undefined") ? marked.parse(answer) : answer;
        }
    })
    .catch(() => {
        if (visionResult) visionResult.innerHTML = "❌ Vision Request Failed";
    });
}
