const loginBtn = document.getElementById("loginBtn");
const loginModal = document.getElementById("loginModal");
const closeModal = document.getElementById("closeModal");

// Modal open karne ke liye
loginBtn.onclick = function () {
    loginModal.style.display = "flex";
};

// Close button se modal band karne ke liye
closeModal.onclick = function () {
    loginModal.style.display = "none";
};

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

const loginSubmit = document.getElementById("loginSubmit");

// Signup Handler
loginSubmit.addEventListener("click", function () {
    if (signupMode) {
        const user = {
            name: signupName.value,
            email: loginEmail.value,
            password: loginPassword.value
        };
        localStorage.setItem("studyboostUser", JSON.stringify(user));
        alert("✅ Account Created Successfully!");
    }
});

// Login Handler
loginSubmit.addEventListener("click", function () {
    if (!signupMode) {
        const user = JSON.parse(localStorage.getItem("studyboostUser"));
        if (
            user &&
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

// User UI update karne ka function
function updateUserUI() {
    const user = JSON.parse(localStorage.getItem("studyboostUser"));
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    const loginBtn = document.getElementById("loginBtn");
    const appLogin = document.getElementById("appLogin");
    const welcomeUser = document.getElementById("welcomeUser");
    const logoutBtn = document.getElementById("logoutBtn");

    if (user && loggedIn) {
        loginBtn.style.display = "none";
        appLogin.style.display = "none";
        welcomeUser.style.display = "inline-block";
        welcomeUser.innerText = "👋 " + user.name;
        logoutBtn.style.display = "inline-block";
        document.getElementById("guestBanner").style.display = "none";
        document.getElementById("guestCard").style.display = "none";
        document.getElementById("studentMode").style.display = "block";
    } else {
        loginBtn.style.display = "inline-block";
        appLogin.style.display = "inline-block";
        welcomeUser.style.display = "none";
        welcomeUser.innerText = "";
        logoutBtn.style.display = "none";
        document.getElementById("guestBanner").style.display = "block";
        document.getElementById("guestCard").style.display = "block";
        document.getElementById("studentMode").style.display = "none";
    }
}

// Page load hone par UI update karein
updateUserUI();

const logoutBtn = document.getElementById("logoutBtn");
logoutBtn.onclick = function () {
    localStorage.setItem("isLoggedIn", "false");
    alert("👋 Logged Out Successfully!");
    location.reload();
};

const askAI = document.getElementById("askAI");
const questionInput = document.getElementById("questionInput");

// Enter key press event handler input box ke liye
questionInput.addEventListener("keypress", function(e){
    if(e.key === "Enter"){
        e.preventDefault();
        askAI.click();
    }
});

const aiAnswer = document.getElementById("aiAnswer");

// Groq API Wrapper Function (Fixed & Linked to Cloudflare Backend)
async function askGroq(question) {
    const response = await fetch("https://studyboost-api.mauryaarpit2406.workers.dev", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            question: question
        })
    });

    const data = await response.json();
    console.log(data);

    if (!response.ok) {
        throw new Error(data.error || "No response");
    }

    return data.answer;
}

// Notes Generator Prompt Function
async function askGroqNotes(topic) {
    return await askGroq(
        "Create well-structured study notes on the topic: " +
        topic +
        ". Use simple English, proper headings, bullet points and explain for students."
    );
}

// Quiz Generator Prompt Function
async function askGroqQuiz(topic) {
    return await askGroq(
        "Create a quiz on the topic: " +
        topic +
        ". Generate exactly 10 multiple-choice questions. Each question must have 4 options (A, B, C, D). After every question, write the correct answer in this format: ✅ Answer: A. Use simple English."
    );
}

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
    questionsCount.innerText = totalQuestions;
    updateProgress();
    updateAchievement();
    updateXP();

    if (question === "") {
        aiAnswer.innerHTML = "⚠️ Please enter your question.";
        return;
    }

    aiAnswer.innerHTML = `
    <div class="ai-thinking">
    🤖 Thinking...
    <div class="ai-dot"></div>
    <div class="ai-dot"></div>
    <div class="ai-dot"></div>
    </div>
    `;

    try {
        const answer = await askGroq(question);
        aiAnswer.innerHTML = answer;
        copyBtn.style.display = "inline-block";
        clearBtn.style.display = "inline-block";
        return;
    }
    catch (error) {
        alert("ERROR: " + error.message);
        console.log(error);
    }

    // Offline Fallback System (Runs only if backend completely fails)
    aiAnswer.innerHTML = `
    <div class="ai-loading">
    🤖 AI is thinking...
    <div class="loading-dots">
    <span>.</span><span>.</span><span>.</span>
    </div>
    </div>
    `;
    copyBtn.style.display = "none";

    setTimeout(() => {
        if (question.includes("newton")) {
            aiAnswer.innerHTML = "<b>Newton's Second Law</b><br><br>Force = Mass × Acceleration (F = ma).";
        }
        else if (question.includes("photosynthesis")) {
            aiAnswer.innerHTML = "<b>Photosynthesis</b><br><br>Plants use sunlight, water and carbon dioxide to prepare food and release oxygen.";
        }
        else if (question.includes("python")) {
            aiAnswer.innerHTML = "<b>Python</b><br><br>Python is a simple and powerful programming language used for AI, Web Development and Automation.";
        }
        else if (question.includes("html")) {
            aiAnswer.innerHTML = "<b>HTML</b><br><br>HTML is used to create the structure of web pages.";
        }
        else if (question.includes("css")) {
            aiAnswer.innerHTML = "<b>CSS</b><br><br>CSS is used to design and style web pages.";
        }
        else if (question.includes("javascript")) {
            aiAnswer.innerHTML = "<b>JavaScript</b><br><br>JavaScript makes websites interactive and dynamic.";
        }
        else if (question.includes("gravity")) {
            aiAnswer.innerHTML = "<b>Gravity</b><br><br>Gravity is the force that attracts objects toward the Earth.";
        }
        else if (
            question === "ai" ||
            question === "what is ai" ||
            question === "explain ai" ||
            question.includes("artificial intelligence")
        ) {
            aiAnswer.innerHTML = "<b>Artificial Intelligence</b><br><br>Artificial Intelligence (AI) is a technology that enables computers to learn, solve problems and make decisions like humans.";
        }
        else if (question.includes("math")) {
            aiAnswer.innerHTML = "<b>Mathematics</b><br><br>Mathematics is the study of numbers, shapes and patterns.";
        }
        else if (question.includes("chemistry")) {
            aiAnswer.innerHTML = "<b>Chemistry</b><br><br>Chemistry is the study of matter, atoms, molecules and chemical reactions.";
        }
        else if (question.includes("biology")) {
            aiAnswer.innerHTML = "<b>Biology</b><br><br>Biology is the scientific study of living organisms.";
        }
        else {
            aiAnswer.innerHTML = "🤖 Sorry! I don't know this answer yet.<br><br>When we connect Gemini AI later, I'll answer almost any study question.";
        }
        aiAnswer.classList.add("answer-show");
        copyBtn.style.display = "inline-block";
        clearBtn.style.display = "inline-block";
    }, 1500);
});

// Copy AI Answer Logic
const copyBtn = document.getElementById("copyAnswer");
const clearBtn = document.getElementById("clearAnswer");

copyBtn.addEventListener("click", function () {
    const answer = aiAnswer.innerText;
    if(answer.trim() === ""){
        alert("⚠️ No answer to copy.");
        return;
    }
    navigator.clipboard.writeText(answer);
    alert("✅ Answer copied successfully!");
});

// Clear AI Answer Logic
clearBtn.addEventListener("click", function(){
    aiAnswer.innerHTML = "Your AI answer will appear here...";
    copyBtn.style.display = "none";
    clearBtn.style.display = "none";
    questionInput.value = "";
});

// Dashboard Init
const dashboardName = document.getElementById("dashboardName");
const user = JSON.parse(localStorage.getItem("studyboostUser"));
const loggedIn = localStorage.getItem("isLoggedIn") === "true";

if(user && loggedIn){
    dashboardName.innerText = "👋 Welcome, " + user.name;
    document.getElementById("profileName").innerText = "👋 Welcome, " + user.name;
    const today = new Date().toLocaleDateString();
    document.getElementById("lastLogin").innerText = today;
} else {
    dashboardName.innerText = "👋 Welcome";
    document.getElementById("profileName").innerText = "👋 Welcome";
}

// Question Counter Setup
const questionsCount = document.getElementById("questionsCount");
let totalQuestions = localStorage.getItem("totalQuestions") || 0;
questionsCount.innerText = totalQuestions;

// Progress Updater
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");

function updateProgress(){
    let progress = totalQuestions * 5;
    if(progress > 100){
        progress = 100;
    }
    progressFill.style.width = progress + "%";
    progressText.innerText = progress + "%";
}
updateProgress();

// Badge / Achievements System
const achievementBadge = document.getElementById("achievementBadge");

function updateAchievement(){
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

// XP System Logic
const userLevel = document.getElementById("userLevel");
const xpText = document.getElementById("xpText");

function updateXP(){
    let xp = totalQuestions * 10;
    xpText.innerText = "XP : " + xp;
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
updateXP();

// Recent Activity Logger
const lastQuestion = document.getElementById("lastQuestion");
const activityStatus = document.getElementById("activityStatus");

function updateRecentActivity(question){
    lastQuestion.innerText = question;
    activityStatus.innerText = "✅ Answer Generated";
}

const savedQuestion = localStorage.getItem("lastQuestion");
if(savedQuestion){
    lastQuestion.innerText = savedQuestion;
    activityStatus.innerText = "✅ Answer Generated";
}

// Daily Goal Tracking
const goalProgress = document.getElementById("goalProgress");
const goalFill = document.getElementById("goalFill");

function updateGoal(){
    let completed = totalQuestions;
    if(completed > 10){
        completed = 10;
    }
    goalProgress.innerText = completed + " / 10 Questions Completed";
    goalFill.style.width = (completed * 10) + "%";
}
updateGoal();

// Reset Dashboard Data
const resetDashboard = document.getElementById("resetDashboard");
resetDashboard.addEventListener("click", function(){
    if(confirm("Reset all dashboard progress?")){
        localStorage.removeItem("totalQuestions");
        localStorage.removeItem("lastQuestion");
        totalQuestions = 0;
        questionsCount.innerText = 0;
        updateProgress();
        updateAchievement();
        updateXP();
        updateGoal();
        lastQuestion.innerText = "No question asked yet.";
        activityStatus.innerText = "⏳ Waiting...";
        alert("✅ Dashboard Reset Successfully!");
    }
});

const notesTopic = document.getElementById("notesTopic");
const generateNotes = document.getElementById("generateNotes");
const notesResult = document.getElementById("notesResult");
const historyList = document.getElementById("historyList");
const notesCount = document.getElementById("notesCount");
const copyNotes = document.getElementById("copyNotes");
const clearNotes = document.getElementById("clearNotes");
const downloadNotes = document.getElementById("downloadNotes");

// Generate Notes Click Event
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
    
    copyNotes.style.display = "none";
    clearNotes.style.display = "inline-block";
    downloadNotes.style.display = "inline-block";

    if(topic === ""){
        notesResult.innerHTML = "⚠️ Please enter a topic.";
        return;
    }

    try {
        notesResult.innerHTML = `
        <div class="notes-loading">
        📝 Generating Smart Notes
        <br><br>
        <span>●</span><span>●</span><span>●</span>
        </div>
        `;
        const notes = await askGroqNotes(topic);
        notesResult.innerHTML = notes.replace(/\n/g, "<br>");
        copyNotes.style.display = "inline-block";
        clearNotes.style.display = "inline-block";
        downloadNotes.style.display = "inline-block";
        return;
    } 
    catch (error) {
        alert("ERROR: " + error.message);
        console.log(error);
    }

    // Offline hardcoded Notes logic 
    if(topic.includes("html")){
        notesResult.innerHTML = `<h3>📚 HTML Notes</h3>• HTML stands for HyperText Markup Language.<br>• HTML is used to create web pages.<br>• HTML uses tags like &lt;h1&gt;, &lt;p&gt;, &lt;img&gt;.<br>• HTML works with CSS and JavaScript.`;
    }
    else if(topic.includes("css")){
        notesResult.innerHTML = `<h3>🎨 CSS Notes</h3>• CSS stands for Cascading Style Sheets.<br>• CSS is used to style web pages.<br>• It controls colors, fonts and layouts.<br>• CSS makes websites attractive.`;
    }
    else if(topic.includes("javascript")){
        notesResult.innerHTML = `<h3>⚡ JavaScript Notes</h3>• JavaScript makes websites interactive.<br>• It handles buttons, forms and animations.<br>• JS works together with HTML and CSS.<br>• It is one of the most popular programming languages.`;
    }
    else if(topic.includes("photosynthesis")){
        notesResult.innerHTML = `<h3>🌿 Photosynthesis Notes</h3>• Plants prepare food using sunlight.<br>• Chlorophyll absorbs light energy.<br>• Carbon dioxide and water are used.<br>• Oxygen is released during the process.`;
    }
    else if(topic.includes("biology")){
        notesResult.innerHTML = `<h3>🧬 Biology Notes</h3>• Biology is the study of living organisms.<br>• It includes plants, animals and microorganisms.<br>• Major branches are Botany, Zoology and Microbiology.<br>• Biology helps us understand life processes.`;
    }
    else if(topic.includes("chemistry")){
        notesResult.innerHTML = `<h3>⚗️ Chemistry Notes</h3>• Chemistry is the study of matter.<br>• It explains atoms, molecules and reactions.<br>• It is divided into Organic, Inorganic and Physical Chemistry.<br>• Chemistry is important in medicine and industries.`;
    }
    else if(topic.includes("physics")){
        notesResult.innerHTML = `<h3>⚡ Physics Notes</h3>• Physics studies matter, energy and motion.<br>• It explains force, gravity and electricity.<br>• Newton's laws are fundamental concepts.<br>• Physics is used in engineering and technology.`;
    }
    else if(topic.includes("math")){
        notesResult.innerHTML = `<h3>➗ Mathematics Notes</h3>• Mathematics studies numbers and patterns.<br>• It includes Algebra, Geometry and Calculus.<br>• Math improves logical thinking.<br>• It is used in science, engineering and finance.`;
    }
    else if(topic.includes("python")){
        notesResult.innerHTML = `<h3>🐍 Python Notes</h3>• Python is an easy programming language.<br>• It is used in AI, Web Development and Automation.<br>• Python has simple syntax.<br>• It is one of the most popular programming languages.`;
    }
    else if(topic.includes("artificial intelligence") || topic === "ai"){
        notesResult.innerHTML = `<h3>🤖 Artificial Intelligence Notes</h3>• AI enables computers to perform intelligent tasks.<br>• AI is used in Chatbots, Robots and Self-driving Cars.<br>• Machine Learning is a branch of AI.<br>• AI is transforming education and healthcare.`;
    }
    else {
        notesResult.innerHTML = `<h3>📖 Notes</h3>Sorry! Notes for this topic are not available yet.<br><br>🚀 When we connect Gemini AI, notes for almost any topic will be generated automatically.`;
    }
    copyNotes.style.display = "inline-block"; 
    clearNotes.style.display = "inline-block"; 
    downloadNotes.style.display = "inline-block";
});

// Copy Notes Logic
copyNotes.addEventListener("click", function(){
    navigator.clipboard.writeText(notesResult.innerText);
    alert("✅ Notes Copied Successfully!");
});

// Clear Notes Logic
clearNotes.addEventListener("click", function(){
    notesTopic.value = "";
    notesResult.innerHTML = "Your notes will appear here...";
    copyNotes.style.display = "none";
    clearNotes.style.display = "none";
    downloadNotes.style.display = "none";
});

// Download Notes text file link generation
downloadNotes.addEventListener("click", function(){
    const text = notesResult.innerText;
    const blob = new Blob([text], { type: "text/plain" });
const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "StudyBoost_Notes.txt";
    link.click();
});

// Notes History array logic
function addToHistory(topic){
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
if(savedHistory.length > 0){
    historyList.innerHTML = "";
    savedHistory.forEach(function(item){
        historyList.innerHTML += "<li>📖 " + item + "</li>";
    });
}

// Notes Counter
let totalNotes = localStorage.getItem("totalNotes") || 0;
notesCount.innerText = totalNotes;

function updateNotesCounter(){
    totalNotes++;
    localStorage.setItem("totalNotes", totalNotes);
    notesCount.innerText = totalNotes;
}

const quizTopic = document.getElementById("quizTopic");
const generateQuiz = document.getElementById("generateQuiz");
const quizResult = document.getElementById("quizResult");
const checkQuiz = document.getElementById("checkQuiz");
const copyQuiz = document.getElementById("copyQuiz");
const clearQuiz = document.getElementById("clearQuiz");
const quizCount = document.getElementById("quizCount");
const quizScore = document.getElementById("quizScore");
const quizHistoryList = document.getElementById("quizHistoryList");

// Generate Quiz event listener
generateQuiz.addEventListener("click", async function(){
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";

    if (!loggedIn) {
        if (guestQuiz <= 0) {
            alert("🔒 Please Login for Unlimited Quiz.");
            loginModal.style.display = "flex";
            return;
        }
        guestQuiz--;
        document.getElementById("guestQuiz").innerText = guestQuiz;
    }

    const topic = quizTopic.value.trim().toLowerCase();
    addQuizHistory(topic);
    copyQuiz.style.display = "none";
    clearQuiz.style.display = "none";
    updateQuizCounter();
    checkQuiz.style.display = "none"; 

    if(topic === ""){
        quizResult.innerHTML = "⚠️ Please enter a topic.";
        return;
    }

    try {
        quizResult.innerHTML = `
        <div class="quiz-loading">
        📚 Creating AI Quiz
        <br><br>
        <span>●</span><span>●</span><span>●</span>
        </div>
        `;
        const quiz = await askGroqQuiz(topic);
        quizResult.innerHTML = quiz.replace(/\n/g, "<br>");
        checkQuiz.style.display = "inline-block";
        copyQuiz.style.display = "inline-block";
        clearQuiz.style.display = "inline-block";
        return;
    } 
    catch (error) {
        alert("ERROR: " + error.message);
        console.log(error);
    }
});

// Check Quiz Score Event
checkQuiz.addEventListener("click", function(){
    addQuizScore();
    alert("🎉 Correct Answer!\n\nIn the next update, users will be able to select options and the app will automatically check whether the selected answer is correct.");
});

// Quiz Count Tracker
let totalQuiz = localStorage.getItem("totalQuiz") || 0;
quizCount.innerText = totalQuiz;

function updateQuizCounter(){
    totalQuiz++;
    localStorage.setItem("totalQuiz", totalQuiz);
    quizCount.innerText = totalQuiz;
}

// Score Calculation Logic
let totalScore = parseInt(localStorage.getItem("quizScore")) || 0;
quizScore.innerText = totalScore;

function addQuizScore(){
    totalScore++;
    localStorage.setItem("quizScore", totalScore);
    quizScore.innerText = totalScore;
}

// Copy Quiz Utility
copyQuiz.addEventListener("click", function(){
    navigator.clipboard.writeText(quizResult.innerText);
    alert("✅ Quiz Copied Successfully!");
});

// Clear Quiz Utility
clearQuiz.addEventListener("click", function(){
    quizTopic.value = "";
    quizResult.innerHTML = "Your quiz will appear here...";
    checkQuiz.style.display = "none";
    copyQuiz.style.display = "none";
    clearQuiz.style.display = "none";
});

// Quiz History stack update
function addQuizHistory(topic){
    let history = JSON.parse(localStorage.getItem("quizHistory")) || [];
    history.unshift(topic);
    history = history.slice(0,5);
    localStorage.setItem("quizHistory", JSON.stringify(history));
    quizHistoryList.innerHTML = "";
    history.forEach(function(item){
        quizHistoryList.innerHTML += "<li>🧠 " + item + "</li>";
    });
}

const savedQuizHistory = JSON.parse(localStorage.getItem("quizHistory")) || [];
if(savedQuizHistory.length > 0){
    quizHistoryList.innerHTML = "";
    savedQuizHistory.forEach(function(item){
        quizHistoryList.innerHTML += "<li>🧠 " + item + "</li>";
    });
}

// Guest limitations metrics initialization
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

// Theme Switcher Module (Dark / Light Mode Toggle)
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

const getStartedBtn = document.getElementById("getStartedBtn");
if(getStartedBtn){
    getStartedBtn.addEventListener("click",function(){
        document.querySelector("header").style.display="none";
        document.getElementById("guestBanner").style.display="none";
        document.getElementById("guestCard").style.display="none";
        document.getElementById("landingPage").style.display="none";
        document.getElementById("appHome").style.display="block";
        document.querySelector(".features").style.display = "none";
        document.querySelector(".about").style.display = "none";
        document.querySelector(".contact").style.display = "none";
        document.getElementById("ai-section").style.display = "block";
        document.getElementById("notes-section").style.display = "block";
        document.getElementById("quiz-section").style.display = "block";
        document.getElementById("planner-section").style.display = "block";
        document.querySelector(".planner-ai-section").style.display = "block";
        window.scrollTo(0,0);
    });
}
// ========= APP HOME FEATURES =========
document.getElementById("openAI")?.addEventListener("click", function () {
    document.getElementById("ai-section").scrollIntoView({ behavior: "smooth" });
});
document.getElementById("openNotes")?.addEventListener("click", function () {
    document.getElementById("notes-section").scrollIntoView({ behavior: "smooth" });
});
document.getElementById("openQuiz")?.addEventListener("click", function () {
    document.getElementById("quiz-section").scrollIntoView({ behavior: "smooth" });
});
document.getElementById("openPlanner")?.addEventListener("click", function () {
    document.querySelector(".planner-ai-section").scrollIntoView({ behavior: "smooth" });
});

// ===== APP HOME BUTTONS =====
document.getElementById("goAI")?.addEventListener("click", function () {
    document.getElementById("ai-section").scrollIntoView({ behavior: "smooth" });
});
document.getElementById("goNotes")?.addEventListener("click", function () {
    document.getElementById("notes-section").scrollIntoView({ behavior: "smooth" });
});
document.getElementById("goQuiz")?.addEventListener("click", function () {
    document.getElementById("quiz-section").scrollIntoView({ behavior: "smooth" });
});
document.getElementById("goPlanner")?.addEventListener("click", function () {
    document.querySelector(".planner-ai-section").scrollIntoView({ behavior: "smooth" });
});
document.getElementById("appLogin")?.addEventListener("click", function () {
    if (typeof loginModal !== 'undefined') {
        loginModal.style.display = "flex";
    }
});

// ================= STUDY PLANNER =================
const plannerTask = document.getElementById("plannerTask");
const addTask = document.getElementById("addTask");
const progressPercent = document.getElementById("progressPercent");
const plannerList = document.getElementById("plannerList");

let tasks = JSON.parse(localStorage.getItem("studyPlanner")) || [];

function showTasks(){
    plannerList.innerHTML = "";
    tasks.forEach(function(task,index){
        plannerList.innerHTML += `
        <li>
            ${task}
            <button onclick="completeTask(${index})">✅</button>
            <button onclick="deleteTask(${index})">🗑</button>
        </li>
        `;
    });

    let completed = 0;
    tasks.forEach(function(task){
        if(task.startsWith("✅")){
            completed++;
        }
    });

    let percent = 0;
    if(tasks.length > 0){
        percent = Math.round((completed / tasks.length) * 100);
    }
    progressPercent.innerText = "📊 Progress : " + percent + "%";
}
showTasks();

// Add Task
if (addTask) {
    addTask.addEventListener("click", function(){
        const task = plannerTask.value.trim();
        const taskDate = document.getElementById("plannerTaskDate").value;
        const taskTime = document.getElementById("plannerTaskTime").value;

        if(task === ""){
            alert("⚠️ Please enter a study task.");
            return;
        }

        tasks.push(task + " 📅 " + taskDate + " ⏰ " + taskTime);
        if(taskTime !== ""){
            alert("🔔 Reminder Set For : " + taskTime);
        }
        localStorage.setItem("studyPlanner", JSON.stringify(tasks));
        plannerTask.value = "";
        showTasks();
    });
}

function completeTask(index){
    tasks[index] = "✅ " + tasks[index];
    localStorage.setItem("studyPlanner", JSON.stringify(tasks));
    showTasks();
}

function deleteTask(index){
    tasks.splice(index,1);
    localStorage.setItem("studyPlanner", JSON.stringify(tasks));
    showTasks();
}

const plannerDate = document.getElementById("plannerDate");
if(plannerDate){
    const today = new Date();
    plannerDate.innerText = "📅 Today : " + today.toDateString();
}

async function askGroqPlanner(prompt){
    return await askGroq(
        "Create a day-wise study plan for this goal: " +
        prompt +
        ". Give proper Day 1, Day 2, Day 3 format with bullet points."
    );
}

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
            const plan = await askGroqPlanner(prompt);
            plannerResult.innerHTML = plan.replace(/\n/g,"<br>");
            copyPlanner.style.display = "inline-block";
            clearPlanner.style.display = "inline-block";
        }
        catch(error){
            plannerResult.innerHTML = "❌ Failed to generate study plan.";
            console.log(error);
        }
    });
}

// ===== AI Planner Copy =====
copyPlanner?.addEventListener("click", function () {
    navigator.clipboard.writeText(plannerResult.innerText);
    alert("✅ AI Study Plan Copied!");
});

// ===== AI Planner Clear =====
clearPlanner?.addEventListener("click", function () {
    plannerPrompt.value = "";
    plannerResult.innerHTML = "Your AI Study Plan will appear here...";
    copyPlanner.style.display = "none";
    clearPlanner.style.display = "none";
});

const backLanding = document.getElementById("backLanding");
if (backLanding) {
    backLanding.addEventListener("click", function () {
        document.getElementById("appHome").style.display = "none";
        document.querySelector(".hero").style.display = "block";
        document.querySelector(".features").style.display = "block";
        document.querySelector(".about").style.display = "block";
        document.querySelector(".contact").style.display = "block";
        document.getElementById("guestBanner").style.display = "block";
        document.getElementById("guestCard").style.display = "block";
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}